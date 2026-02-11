import {
  Fragment,
  cloneVNode,
  computed,
  defineComponent,
  h,
  isVNode,
  mergeProps,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  type PropType,
  type VNode,
} from "vue";
import { useOverlayPosition, type Placement } from "@vue-aria/overlays";
import { useId } from "@vue-aria/ssr";
import { filterDOMProps } from "@vue-aria/utils";
import { classNames, useStyleProps, type ClassValue } from "@vue-spectrum/utils";
import { Overlay } from "@vue-spectrum/overlays";
import {
  normalizeKeySet,
  type MenuKey,
  type SpectrumMenuBaseProps,
  type SpectrumMenuItemData,
  type SpectrumMenuSelectionMode,
} from "./types";
import { Menu } from "./Menu";

function getComponentName(node: VNode): string | undefined {
  if (typeof node.type === "string") {
    return node.type;
  }

  if (typeof node.type === "symbol") {
    return undefined;
  }

  const componentType = node.type as { name?: string | undefined };
  return componentType.name;
}

function flattenVNodeChildren(input: unknown): VNode[] {
  if (input === null || input === undefined) {
    return [];
  }

  if (Array.isArray(input)) {
    return input.flatMap((entry) => flattenVNodeChildren(entry));
  }

  if (!isVNode(input)) {
    return [];
  }

  if (input.type === Fragment) {
    return flattenVNodeChildren(input.children);
  }

  return [input];
}

function callHandler(
  handler: unknown,
  ...args: readonly unknown[]
): void {
  if (typeof handler === "function") {
    handler(...args);
    return;
  }

  if (Array.isArray(handler)) {
    for (const candidate of handler) {
      if (typeof candidate === "function") {
        candidate(...args);
      }
    }
  }
}

function toHTMLElement(value: unknown): HTMLElement | null {
  if (!value) {
    return null;
  }

  if (value instanceof HTMLElement) {
    return value;
  }

  if (typeof value === "object" && "$el" in value) {
    const element = (value as { $el?: unknown }).$el;
    if (element instanceof HTMLElement) {
      return element;
    }
  }

  return null;
}

export interface SpectrumMenuTriggerProps
  extends Omit<SpectrumMenuBaseProps, "autoFocus"> {
  id?: string | undefined;
  isOpen?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((isOpen: boolean) => void) | undefined;
  triggerLabel?: string | undefined;
  triggerAriaLabel?: string | undefined;
  triggerAriaLabelledby?: string | undefined;
  autoFocus?: boolean | undefined;
  placement?: Placement | undefined;
}

export const MenuTrigger = defineComponent({
  name: "MenuTrigger",
  inheritAttrs: false,
  props: {
    id: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    items: {
      type: Array as PropType<SpectrumMenuItemData[] | undefined>,
      default: undefined,
    },
    sections: {
      type: Array as PropType<SpectrumMenuTriggerProps["sections"]>,
      default: undefined,
    },
    selectionMode: {
      type: String as PropType<SpectrumMenuSelectionMode | undefined>,
      default: undefined,
    },
    selectedKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<MenuKey> | undefined>,
      default: undefined,
    },
    defaultSelectedKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<MenuKey> | undefined>,
      default: undefined,
    },
    disabledKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<MenuKey> | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    closeOnSelect: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    shouldFocusWrap: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    onAction: {
      type: Function as PropType<((key: MenuKey) => void) | undefined>,
      default: undefined,
    },
    onSelectionChange: {
      type: Function as PropType<((keys: Set<MenuKey>) => void) | undefined>,
      default: undefined,
    },
    onClose: {
      type: Function as PropType<(() => void) | undefined>,
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
    triggerLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    triggerAriaLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    triggerAriaLabelledby: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    autoFocus: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    placement: {
      type: String as PropType<Placement | undefined>,
      default: undefined,
    },
    ariaLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaLabelledby: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    "aria-label": {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    "aria-labelledby": {
      type: String as PropType<string | undefined>,
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
    UNSAFE_style: {
      type: Object as PropType<Record<string, string | number> | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots, expose }) {
    const rootRef = ref<HTMLDivElement | null>(null);
    const triggerRef = ref<HTMLElement | null>(null);
    const menuOverlayRef = ref<HTMLElement | null>(null);
    const triggerId = useId(undefined, "v-spectrum-menu-trigger-button");

    const uncontrolledOpen = ref(Boolean(props.defaultOpen));
    const focusStrategy = ref<"first" | "last" | undefined>(undefined);

    const uncontrolledSelectedKeys = ref<Set<string>>(
      normalizeKeySet(props.defaultSelectedKeys)
    );

    const selectedKeys = computed<Set<string>>(() =>
      props.selectedKeys !== undefined
        ? normalizeKeySet(props.selectedKeys)
        : uncontrolledSelectedKeys.value
    );

    const isOpen = computed<boolean>(() =>
      props.isOpen !== undefined ? props.isOpen : uncontrolledOpen.value
    );

    const menuId = computed(() => `${props.id ?? "v-spectrum-menu-trigger"}-menu`);
    const overlayPosition = useOverlayPosition({
      targetRef: computed(() => triggerRef.value),
      overlayRef: computed(() => menuOverlayRef.value),
      placement: computed(() => props.placement ?? "bottom start"),
      offset: 8,
      isOpen,
      shouldUpdatePosition: isOpen,
    });

    const setOpen = (nextOpen: boolean) => {
      if (props.isOpen === undefined) {
        uncontrolledOpen.value = nextOpen;
      }

      props.onOpenChange?.(nextOpen);
    };

    const openMenu = (strategy: "first" | "last" = "first") => {
      if (props.isDisabled) {
        return;
      }

      focusStrategy.value = strategy;
      setOpen(true);
    };

    const closeMenu = (restoreFocus = false) => {
      setOpen(false);
      props.onClose?.();

      if (restoreFocus) {
        void nextTick(() => {
          triggerRef.value?.focus();
        });
      }
    };

    const onDocumentMouseDown = (event: MouseEvent) => {
      if (!isOpen.value) {
        return;
      }

      const target = event.target as Node | null;
      if (
        target &&
        (rootRef.value?.contains(target) || menuOverlayRef.value?.contains(target))
      ) {
        return;
      }

      closeMenu();
    };

    onMounted(() => {
      if (typeof document !== "undefined") {
        document.addEventListener("mousedown", onDocumentMouseDown, true);
      }

      if (props.autoFocus && !props.isDisabled) {
        triggerRef.value?.focus();
        void nextTick(() => {
          triggerRef.value?.focus();
        });
      }
    });

    onBeforeUnmount(() => {
      if (typeof document !== "undefined") {
        document.removeEventListener("mousedown", onDocumentMouseDown, true);
      }
    });

    expose({
      UNSAFE_getDOMNode: () => triggerRef.value,
    });

    return () => {
      const attrsRecord = attrs as Record<string, unknown>;
      const styleInput = {
        ...attrsRecord,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      } as Record<string, unknown>;
      const { styleProps } = useStyleProps(styleInput);
      const domProps = filterDOMProps(attrsRecord, { labelable: false });

      const defaultSlotNodes = slots.default?.();
      const flattenedDefaultSlotNodes = flattenVNodeChildren(defaultSlotNodes);
      const slottedMenuNode =
        flattenedDefaultSlotNodes.find((node) => getComponentName(node) === "Menu") ??
        null;
      const slottedTriggerNode = slottedMenuNode
        ? (flattenedDefaultSlotNodes.find((node) => node !== slottedMenuNode) ?? null)
        : null;
      const triggerLabel =
        !slottedMenuNode && defaultSlotNodes && defaultSlotNodes.length > 0
          ? defaultSlotNodes
          : props.triggerLabel ?? "Menu";
      const resolvedPlacement = overlayPosition.placement.value ?? null;

      const toggleMenu = () => {
        if (isOpen.value) {
          closeMenu();
        } else {
          openMenu("first");
        }
      };

      const onTriggerKeydown = (event: KeyboardEvent) => {
        if (props.isDisabled) {
          return;
        }

        switch (event.key) {
          case "ArrowDown":
            event.preventDefault();
            openMenu("first");
            break;
          case "ArrowUp":
            event.preventDefault();
            openMenu("last");
            break;
          case "Enter":
          case " ":
            event.preventDefault();
            openMenu("first");
            break;
          default:
            break;
        }
      };

      const defaultTriggerNode = h(
        "button",
        {
          id: triggerId.value,
          ref: (value: unknown) => {
            triggerRef.value = toHTMLElement(value);
          },
          type: "button",
          class: classNames("spectrum-ActionButton"),
          disabled: props.isDisabled,
          autofocus: props.autoFocus,
          "aria-label": props.triggerAriaLabel,
          "aria-labelledby": props.triggerAriaLabelledby,
          "aria-haspopup": "menu",
          "aria-expanded": isOpen.value ? "true" : "false",
          "aria-controls": isOpen.value ? menuId.value : undefined,
          onClick: toggleMenu,
          onKeydown: onTriggerKeydown,
        },
        triggerLabel
      );

      const renderedTriggerNode = (() => {
        if (!slottedTriggerNode) {
          return defaultTriggerNode;
        }

        const triggerNodeProps = (slottedTriggerNode.props ?? {}) as Record<string, unknown>;
        const mergedDisabled = props.isDisabled ?? (triggerNodeProps.disabled as
          | boolean
          | undefined);

        return cloneVNode(
          slottedTriggerNode,
          mergeProps(triggerNodeProps, {
            id:
              (triggerNodeProps.id as string | undefined) ??
              triggerId.value,
            ref: (value: unknown) => {
              triggerRef.value = toHTMLElement(value);
            },
            disabled: mergedDisabled,
            isDisabled:
              props.isDisabled ?? (triggerNodeProps.isDisabled as boolean | undefined),
            "aria-label":
              props.triggerAriaLabel ??
              (triggerNodeProps["aria-label"] as string | undefined),
            "aria-labelledby":
              props.triggerAriaLabelledby ??
              (triggerNodeProps["aria-labelledby"] as string | undefined),
            "aria-haspopup": "menu",
            "aria-expanded": isOpen.value ? "true" : "false",
            "aria-controls": isOpen.value ? menuId.value : undefined,
            onClick: toggleMenu,
            onKeydown: onTriggerKeydown,
          }),
          true
        );
      })();

      const renderedMenuNode = (() => {
        const slottedMenuProps = (slottedMenuNode?.props ?? {}) as Record<string, unknown>;
        const slottedMenuSlots =
          slottedMenuNode && slottedMenuNode.children && !Array.isArray(slottedMenuNode.children)
            ? (slottedMenuNode.children as Record<string, unknown>)
            : undefined;

        const slottedSelectedKeys = slottedMenuProps.selectedKeys as
          | Iterable<MenuKey>
          | undefined;
        const slottedOnAction = slottedMenuProps.onAction;
        const slottedOnSelectionChange = slottedMenuProps.onSelectionChange;
        const slottedOnClose = slottedMenuProps.onClose;

        return h(
          Menu,
          {
            id:
              (slottedMenuProps.id as string | undefined) ??
              menuId.value,
            items:
              (slottedMenuProps.items as SpectrumMenuItemData[] | undefined) ?? props.items,
            sections:
              (slottedMenuProps.sections as SpectrumMenuTriggerProps["sections"]) ??
              props.sections,
            selectionMode:
              (slottedMenuProps.selectionMode as SpectrumMenuSelectionMode | undefined) ??
              props.selectionMode,
            selectedKeys: slottedSelectedKeys ?? selectedKeys.value,
            disabledKeys:
              (slottedMenuProps.disabledKeys as Iterable<MenuKey> | undefined) ??
              props.disabledKeys,
            closeOnSelect:
              (slottedMenuProps.closeOnSelect as boolean | undefined) ?? props.closeOnSelect,
            shouldFocusWrap:
              (slottedMenuProps.shouldFocusWrap as boolean | undefined) ??
              props.shouldFocusWrap,
            autoFocus: focusStrategy.value ?? "first",
            ariaLabel:
              (slottedMenuProps.ariaLabel as string | undefined) ??
              (slottedMenuProps["aria-label"] as string | undefined) ??
              props.ariaLabel ??
              props["aria-label"],
            ariaLabelledby:
              (slottedMenuProps.ariaLabelledby as string | undefined) ??
              (slottedMenuProps["aria-labelledby"] as string | undefined) ??
              props.ariaLabelledby ??
              props["aria-labelledby"] ??
              triggerId.value,
            onAction: (key: MenuKey) => {
              callHandler(slottedOnAction, key);
              props.onAction?.(key);
            },
            onSelectionChange: (keys: Set<MenuKey>) => {
              if (props.selectedKeys === undefined && slottedSelectedKeys === undefined) {
                uncontrolledSelectedKeys.value = normalizeKeySet(keys);
              }

              callHandler(slottedOnSelectionChange, keys);
              props.onSelectionChange?.(keys);
            },
            onClose: () => {
              callHandler(slottedOnClose);
              closeMenu(true);
            },
          },
          slottedMenuSlots
        );
      })();

      return h(
        "div",
        {
          ...domProps,
          id: props.id,
          ref: (value: unknown) => {
            rootRef.value = value as HTMLDivElement | null;
          },
          class: classNames(
            "spectrum-MenuTrigger",
            styleProps.class as ClassValue | undefined,
            domProps.class as ClassValue | undefined,
            props.UNSAFE_className as ClassValue | undefined
          ),
          style: {
            ...(styleProps.style ?? {}),
            ...(props.UNSAFE_style ?? {}),
          },
        },
        [
          renderedTriggerNode,
          isOpen.value
            ? h(
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
                        menuOverlayRef.value = value as HTMLElement | null;
                      },
                      class: classNames(
                        "spectrum-MenuTrigger-popover",
                        resolvedPlacement
                          ? `spectrum-MenuTrigger-popover--${resolvedPlacement}`
                          : undefined
                      ),
                      "data-testid": "menu-trigger-popover",
                      "data-placement": resolvedPlacement ?? undefined,
                      style: overlayPosition.overlayProps.value.style as
                        | Record<string, unknown>
                        | undefined,
                    },
                    [
                      renderedMenuNode,
                    ]
                  ),
              }
            )
            : null,
        ]
      );
    };
  },
});
