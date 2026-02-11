import {
  cloneVNode,
  computed,
  defineComponent,
  h,
  isVNode,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
  type VNode,
  type VNodeChild,
} from "vue";
import { useOverlayPosition, type Placement } from "@vue-aria/overlays";
import { mergeProps } from "@vue-aria/utils";
import { classNames } from "@vue-spectrum/utils";
import { Overlay } from "@vue-spectrum/overlays";
import { getFocusableElements, trapFocusWithinOverlay } from "./focusTrap";
import {
  provideDialogContext,
  type DialogContextValue,
  type DialogType,
} from "./context";

export interface SpectrumDialogTriggerProps {
  type?: DialogType | undefined;
  mobileType?: DialogType | undefined;
  placement?: Placement | undefined;
  isDismissable?: boolean | undefined;
  isKeyboardDismissDisabled?: boolean | undefined;
  isOpen?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((isOpen: boolean) => void) | undefined;
  container?: HTMLElement | undefined;
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
}

function normalizeChildren(nodes: VNodeChild[] | undefined): VNode[] {
  if (!nodes) {
    return [];
  }

  const result: VNode[] = [];
  for (const node of nodes) {
    if (Array.isArray(node)) {
      result.push(...normalizeChildren(node));
      continue;
    }

    if (!isVNode(node) || typeof node.type === "symbol") {
      continue;
    }

    result.push(node);
  }

  return result;
}

function toHTMLElement(value: unknown): HTMLElement | null {
  if (!value) {
    return null;
  }

  if (value instanceof HTMLElement) {
    return value;
  }

  const maybeEl = (value as { $el?: unknown }).$el;
  if (maybeEl instanceof HTMLElement) {
    return maybeEl;
  }

  return null;
}

function getOverlayTestId(type: DialogType): "modal" | "popover" | "tray" {
  if (type === "popover") {
    return "popover";
  }

  if (type === "tray") {
    return "tray";
  }

  return "modal";
}

function componentAcceptsProp(node: VNode, propName: string): boolean {
  if (typeof node.type === "string" || typeof node.type === "symbol") {
    return false;
  }

  const componentType = node.type as {
    props?: Record<string, unknown> | string[] | undefined;
  };
  const propsDef = componentType.props;
  if (!propsDef) {
    return false;
  }

  if (Array.isArray(propsDef)) {
    return propsDef.includes(propName);
  }

  return propName in propsDef;
}

function componentEmitsEvent(node: VNode, eventName: string): boolean {
  if (typeof node.type === "string" || typeof node.type === "symbol") {
    return false;
  }

  const componentType = node.type as {
    emits?: Record<string, unknown> | string[] | undefined;
  };
  const emitsDef = componentType.emits;
  if (!emitsDef) {
    return false;
  }

  if (Array.isArray(emitsDef)) {
    return emitsDef.includes(eventName);
  }

  return eventName in emitsDef;
}

const DISMISS_BUTTON_STYLE: Record<string, string> = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: "0",
};

const UNMOUNT_OPEN_WARNING =
  "A DialogTrigger unmounted while open. This is likely due to being placed within a trigger that unmounts or inside a conditional. Consider using a DialogContainer instead.";

export const DialogTrigger = defineComponent({
  name: "DialogTrigger",
  inheritAttrs: false,
  props: {
    type: {
      type: String as PropType<DialogType | undefined>,
      default: undefined,
    },
    mobileType: {
      type: String as PropType<DialogType | undefined>,
      default: undefined,
    },
    placement: {
      type: String as PropType<Placement | undefined>,
      default: undefined,
    },
    isDismissable: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isKeyboardDismissDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isOpen: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    defaultOpen: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    onOpenChange: {
      type: Function as PropType<((isOpen: boolean) => void) | undefined>,
      default: undefined,
    },
    container: {
      type: null as unknown as PropType<HTMLElement | undefined>,
      default: undefined,
    },
    slot: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    UNSAFE_className: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const triggerRef = ref<HTMLElement | null>(null);
    const overlayRootRef = ref<HTMLElement | null>(null);
    const restoreFocusRef = ref<HTMLElement | null>(null);
    const lastFocusedInOverlayRef = ref<HTMLElement | null>(null);
    const pendingToggle = ref(false);
    const wasOpenRef = ref(false);
    const hiddenBodyElements = ref<Array<{
      element: HTMLElement;
      previousValue: string | null;
    }>>([]);
    const uncontrolledOpen = ref(Boolean(props.defaultOpen));
    const requestedType = computed<DialogType>(() => props.type ?? "modal");
    const isMobileViewport = computed<boolean>(() => {
      if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
        return false;
      }

      return window.matchMedia("(max-width: 700px)").matches;
    });
    const effectiveType = computed<DialogType>(() => {
      if (requestedType.value !== "popover" || !isMobileViewport.value) {
        return requestedType.value;
      }

      return props.mobileType ?? "modal";
    });
    const resolvedDismissable = computed<boolean | undefined>(() => {
      const didFallbackToModalOnMobile =
        isMobileViewport.value &&
        requestedType.value !== "modal" &&
        effectiveType.value === "modal";

      if (didFallbackToModalOnMobile) {
        return true;
      }

      return props.isDismissable;
    });
    const isOpen = computed<boolean>(() =>
      props.isOpen !== undefined ? props.isOpen : uncontrolledOpen.value
    );

    const setOpen = (nextOpen: boolean): void => {
      if (props.isOpen === undefined) {
        uncontrolledOpen.value = nextOpen;
      }

      props.onOpenChange?.(nextOpen);
    };

    const context: DialogContextValue = {
      type: effectiveType.value,
      onClose: () => {
        setOpen(false);
      },
      isDismissable: resolvedDismissable.value,
    };
    provideDialogContext(context);

    watch(
      [effectiveType, resolvedDismissable],
      () => {
        context.type = effectiveType.value;
        context.isDismissable = resolvedDismissable.value;
      },
      { immediate: true }
    );

    const shouldCloseOnInteractOutside = computed<boolean>(() => {
      if (effectiveType.value === "popover" || effectiveType.value === "tray") {
        return true;
      }

      return Boolean(resolvedDismissable.value);
    });
    const shouldContainFocus = computed<boolean>(
      () => effectiveType.value !== "popover"
    );
    const shouldUsePopoverPositioning = computed(
      () => effectiveType.value === "popover"
    );

    const overlayPosition = useOverlayPosition({
      targetRef: computed(() => triggerRef.value),
      overlayRef: computed(() =>
        shouldUsePopoverPositioning.value ? overlayRootRef.value : null
      ),
      placement: computed(() => props.placement ?? "bottom"),
      offset: 8,
      isOpen: computed(() => isOpen.value && shouldUsePopoverPositioning.value),
      shouldUpdatePosition: computed(
        () => isOpen.value && shouldUsePopoverPositioning.value
      ),
    });

    const focusOverlay = () => {
      const root = overlayRootRef.value;
      if (!root) {
        return;
      }

      const dialog = root.querySelector<HTMLElement>("[role=\"dialog\"], [role=\"alertdialog\"]");
      (dialog ?? root).focus();
    };

    const onDocumentMouseDown = (event: MouseEvent): void => {
      if (!isOpen.value) {
        return;
      }

      const target = event.target as Node | null;
      if (!target) {
        return;
      }

      if (overlayRootRef.value?.contains(target) || triggerRef.value?.contains(target)) {
        return;
      }

      if (target instanceof HTMLElement) {
        const nestedOverlay = target.closest(".spectrum-DialogOverlay");
        if (nestedOverlay && nestedOverlay !== overlayRootRef.value) {
          return;
        }
      }

      if (!shouldCloseOnInteractOutside.value) {
        if (shouldContainFocus.value) {
          event.preventDefault();
        }
        return;
      }

      setOpen(false);
    };

    const onDocumentFocusIn = (event: FocusEvent): void => {
      if (!isOpen.value || !shouldContainFocus.value) {
        return;
      }

      const target = event.target as Node | null;
      if (!target) {
        return;
      }

      if (overlayRootRef.value?.contains(target)) {
        if (target instanceof HTMLElement) {
          lastFocusedInOverlayRef.value = target;
        }
        return;
      }

      if (target instanceof HTMLElement) {
        const nestedOverlay = target.closest(".spectrum-DialogOverlay");
        if (nestedOverlay && nestedOverlay !== overlayRootRef.value) {
          return;
        }
      }

      const root = overlayRootRef.value;
      if (!root) {
        return;
      }

      const dialog =
        root.querySelector<HTMLElement>("[role=\"dialog\"], [role=\"alertdialog\"]") ??
        root;
      const preferredTarget = lastFocusedInOverlayRef.value;
      if (preferredTarget && root.contains(preferredTarget)) {
        if (document.activeElement !== preferredTarget) {
          preferredTarget.focus();
        }
        return;
      }

      const firstFocusable = getFocusableElements(root)[0];
      const fallbackTarget = firstFocusable ?? dialog;
      if (document.activeElement !== fallbackTarget) {
        fallbackTarget.focus();
      }
    };

    const clearAriaHiddenOutsideContent = (): void => {
      for (const entry of hiddenBodyElements.value) {
        if (entry.previousValue === null) {
          entry.element.removeAttribute("aria-hidden");
          continue;
        }

        entry.element.setAttribute("aria-hidden", entry.previousValue);
      }
      hiddenBodyElements.value = [];
    };

    const applyAriaHiddenOutsideContent = (): void => {
      clearAriaHiddenOutsideContent();
      if (
        typeof document === "undefined" ||
        !isOpen.value ||
        effectiveType.value === "popover"
      ) {
        return;
      }

      const overlayContainer = overlayRootRef.value?.closest(
        ".spectrum-Overlay"
      ) as HTMLElement | null;
      if (!overlayContainer) {
        return;
      }

      const nextHiddenElements: Array<{
        element: HTMLElement;
        previousValue: string | null;
      }> = [];

      for (const child of Array.from(document.body.children)) {
        if (!(child instanceof HTMLElement) || child === overlayContainer) {
          continue;
        }

        const previousValue = child.getAttribute("aria-hidden");
        child.setAttribute("aria-hidden", "true");
        nextHiddenElements.push({
          element: child,
          previousValue,
        });
      }

      hiddenBodyElements.value = nextHiddenElements;
    };

    onMounted(() => {
      if (typeof document !== "undefined") {
        document.addEventListener("mousedown", onDocumentMouseDown, true);
        document.addEventListener("focusin", onDocumentFocusIn, true);
      }
    });

    onBeforeUnmount(() => {
      if (typeof document !== "undefined") {
        document.removeEventListener("mousedown", onDocumentMouseDown, true);
        document.removeEventListener("focusin", onDocumentFocusIn, true);
      }
      clearAriaHiddenOutsideContent();

      if (
        wasOpenRef.value &&
        effectiveType.value !== "popover" &&
        effectiveType.value !== "tray" &&
        typeof process !== "undefined" &&
        process.env.NODE_ENV !== "production"
      ) {
        console.warn(UNMOUNT_OPEN_WARNING);
      }
    });

    watch(
      isOpen,
      (nextIsOpen) => {
        wasOpenRef.value = nextIsOpen;
        if (!nextIsOpen) {
          lastFocusedInOverlayRef.value = null;
        }

        if (nextIsOpen) {
          restoreFocusRef.value = triggerRef.value;
          void nextTick(() => {
            if (!restoreFocusRef.value) {
              restoreFocusRef.value = triggerRef.value;
            }
            focusOverlay();
          });
          return;
        }

        const focusTarget = restoreFocusRef.value ?? triggerRef.value;
        if (focusTarget) {
          void nextTick(() => {
            focusTarget.focus();
          });
        }
      },
      { immediate: true }
    );

    watch(
      [isOpen, effectiveType, overlayRootRef],
      ([nextIsOpen, nextType]) => {
        if (!nextIsOpen || nextType === "popover") {
          clearAriaHiddenOutsideContent();
          return;
        }

        void nextTick(() => {
          applyAriaHiddenOutsideContent();
        });
      },
      { immediate: true }
    );

    const onOverlayKeydown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        if (props.isKeyboardDismissDisabled) {
          return;
        }

        event.preventDefault();
        setOpen(false);
        return;
      }

      const root = overlayRootRef.value;
      if (!root) {
        return;
      }

      const dialog =
        root.querySelector<HTMLElement>("[role=\"dialog\"], [role=\"alertdialog\"]") ?? root;
      trapFocusWithinOverlay(event, root, dialog);
    };

    const toggle = (): void => {
      if (pendingToggle.value) {
        return;
      }

      pendingToggle.value = true;
      setOpen(!isOpen.value);
      queueMicrotask(() => {
        pendingToggle.value = false;
      });
    };

    const close = (): void => {
      setOpen(false);
    };

    return () => {
      const children = normalizeChildren(slots.default?.());
      if (children.length !== 2) {
        throw new Error("DialogTrigger must have exactly 2 children");
      }

      const triggerNode = children[0];
      const contentNode = children[1];
      const overlayType = getOverlayTestId(effectiveType.value);
      const placement =
        shouldUsePopoverPositioning.value
          ? overlayPosition.placement.value ?? null
          : null;
      const shouldRenderDismissButtons =
        effectiveType.value === "popover" || effectiveType.value === "tray";

      const renderedTrigger = cloneVNode(
        triggerNode,
        mergeProps(triggerNode.props ?? {}, {
          onClick: toggle,
          onPress: toggle,
          ref: (value: unknown) => {
            triggerRef.value = toHTMLElement(value);
          },
        }),
        true
      );

      const contentCloseProps: Record<string, unknown> = {};
      if (componentAcceptsProp(contentNode, "close")) {
        contentCloseProps.close = close;
      }
      if (
        componentAcceptsProp(contentNode, "onClose") ||
        componentEmitsEvent(contentNode, "close")
      ) {
        contentCloseProps.onClose = close;
      }

      const renderedContent = cloneVNode(contentNode, contentCloseProps, true);

      return h(
        "span",
        {
          class: classNames("spectrum-DialogTrigger", props.UNSAFE_className),
        },
        [
          renderedTrigger,
          h(
            Overlay,
            {
              isOpen: isOpen.value,
              container: props.container,
            },
            {
              default: () =>
                h(
                  "div",
                  {
                    ref: (value: unknown) => {
                      overlayRootRef.value = value as HTMLElement | null;
                    },
                    class: classNames(
                      "spectrum-DialogOverlay",
                      `spectrum-DialogOverlay--${overlayType}`,
                      placement ? `spectrum-DialogOverlay--${placement}` : undefined
                    ),
                    "data-testid": overlayType,
                    "data-placement": placement ?? undefined,
                    tabIndex: -1,
                    onKeydown: onOverlayKeydown,
                    style: shouldUsePopoverPositioning.value
                      ? (overlayPosition.overlayProps.value.style as
                          | Record<string, unknown>
                          | undefined)
                      : undefined,
                  },
                  [
                    shouldRenderDismissButtons
                      ? h(
                          "button",
                          {
                            type: "button",
                            "aria-label": "Dismiss",
                            tabIndex: -1,
                            style: DISMISS_BUTTON_STYLE,
                            onClick: close,
                          },
                          "Dismiss"
                        )
                      : null,
                    renderedContent,
                    shouldRenderDismissButtons
                      ? h(
                          "button",
                          {
                            type: "button",
                            "aria-label": "Dismiss",
                            tabIndex: -1,
                            style: DISMISS_BUTTON_STYLE,
                            onClick: close,
                          },
                          "Dismiss"
                        )
                      : null,
                  ]
                ),
            }
          ),
        ]
      );
    };
  },
});
