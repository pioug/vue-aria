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
import { mergeProps } from "@vue-aria/utils";
import { classNames } from "@vue-spectrum/utils";
import { Overlay } from "@vue-spectrum/overlays";
import {
  provideDialogContext,
  type DialogContextValue,
  type DialogType,
} from "./context";

export interface SpectrumDialogTriggerProps {
  type?: DialogType | undefined;
  mobileType?: DialogType | undefined;
  isDismissable?: boolean | undefined;
  isKeyboardDismissDisabled?: boolean | undefined;
  isOpen?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((isOpen: boolean) => void) | undefined;
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
    const uncontrolledOpen = ref(Boolean(props.defaultOpen));
    const effectiveType = computed<DialogType>(() => props.type ?? "modal");
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
      isDismissable: props.isDismissable,
    };
    provideDialogContext(context);

    watch(
      [effectiveType, () => props.isDismissable],
      () => {
        context.type = effectiveType.value;
        context.isDismissable = props.isDismissable;
      },
      { immediate: true }
    );

    const shouldCloseOnInteractOutside = computed<boolean>(() => {
      if (effectiveType.value === "popover" || effectiveType.value === "tray") {
        return true;
      }

      return Boolean(props.isDismissable);
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
      if (!isOpen.value || !shouldCloseOnInteractOutside.value) {
        return;
      }

      const target = event.target as Node | null;
      if (!target) {
        return;
      }

      if (overlayRootRef.value?.contains(target) || triggerRef.value?.contains(target)) {
        return;
      }

      setOpen(false);
    };

    onMounted(() => {
      if (typeof document !== "undefined") {
        document.addEventListener("mousedown", onDocumentMouseDown, true);
      }
    });

    onBeforeUnmount(() => {
      if (typeof document !== "undefined") {
        document.removeEventListener("mousedown", onDocumentMouseDown, true);
      }
    });

    watch(
      isOpen,
      (nextIsOpen) => {
        if (nextIsOpen) {
          restoreFocusRef.value = triggerRef.value;
          void nextTick(() => {
            focusOverlay();
          });
          return;
        }

        const focusTarget = restoreFocusRef.value;
        if (focusTarget) {
          void nextTick(() => {
            focusTarget.focus();
          });
        }
      }
    );

    const onOverlayKeydown = (event: KeyboardEvent): void => {
      if (event.key !== "Escape" || props.isKeyboardDismissDisabled) {
        return;
      }

      event.preventDefault();
      setOpen(false);
    };

    const toggle = (): void => {
      setOpen(!isOpen.value);
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

      const renderedContent = cloneVNode(contentNode, {
        close,
        onClose: close,
      }, true);

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
                      `spectrum-DialogOverlay--${overlayType}`
                    ),
                    "data-testid": overlayType,
                    tabIndex: -1,
                    onKeydown: onOverlayKeydown,
                  },
                  [
                    renderedContent,
                  ]
                ),
            }
          ),
        ]
      );
    };
  },
});
