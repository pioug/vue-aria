import {
  Fragment,
  computed,
  defineComponent,
  h,
  isVNode,
  onBeforeUnmount,
  onMounted,
  ref,
  type PropType,
  type VNode,
} from "vue";
import { useLocale } from "@vue-aria/i18n";
import { useId } from "@vue-aria/ssr";
import { filterDOMProps } from "@vue-aria/utils";
import { classNames, useStyleProps, type ClassValue } from "@vue-spectrum/utils";
import { Menu } from "./Menu";
import type {
  MenuCloseReason,
  MenuKey,
  SpectrumMenuBaseProps,
  SpectrumMenuItemData,
  SpectrumMenuSectionData,
  SpectrumMenuSelectionMode,
} from "./types";

const SUBMENU_OPEN_EVENT = "v-spectrum-submenu-open";

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

function extractTextContent(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => extractTextContent(entry)).join("");
  }

  if (!isVNode(value)) {
    return "";
  }

  if (typeof value.children === "string") {
    return value.children;
  }

  if (Array.isArray(value.children)) {
    return extractTextContent(value.children);
  }

  if (value.children && typeof value.children === "object") {
    const maybeDefault = (value.children as { default?: (() => unknown) | undefined })
      .default;
    if (typeof maybeDefault === "function") {
      return extractTextContent(maybeDefault());
    }
  }

  return "";
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

export interface SpectrumSubmenuTriggerProps extends SpectrumMenuBaseProps {
  id?: string | undefined;
  label?: string | undefined;
  isOpen?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((isOpen: boolean) => void) | undefined;
}

export const SubmenuTrigger = defineComponent({
  name: "SubmenuTrigger",
  inheritAttrs: false,
  props: {
    id: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    label: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    items: {
      type: Array as PropType<SpectrumMenuItemData[] | undefined>,
      default: undefined,
    },
    sections: {
      type: Array as PropType<SpectrumMenuSectionData[] | undefined>,
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
    const locale = useLocale();
    const rootRef = ref<HTMLLIElement | null>(null);
    const buttonRef = ref<HTMLButtonElement | null>(null);
    const openedByHover = ref(false);
    const menuId = useId(undefined, "v-spectrum-submenu");
    const triggerId = useId(undefined, "v-spectrum-submenu-trigger-button");

    const uncontrolledOpen = ref(Boolean(props.defaultOpen));
    const isOpen = computed<boolean>(() =>
      props.isOpen !== undefined ? props.isOpen : uncontrolledOpen.value
    );

    const setOpen = (nextOpen: boolean) => {
      if (props.isOpen === undefined) {
        uncontrolledOpen.value = nextOpen;
      }

      props.onOpenChange?.(nextOpen);

      if (nextOpen && typeof document !== "undefined") {
        document.dispatchEvent(
          new CustomEvent(SUBMENU_OPEN_EVENT, {
            detail: { triggerId: triggerId.value },
          })
        );
      }

      if (!nextOpen) {
        openedByHover.value = false;
      }
    };

    const closeMenu = (restoreFocus = false, shouldNotify = true) => {
      setOpen(false);
      if (shouldNotify) {
        props.onClose?.();
      }

      if (restoreFocus) {
        buttonRef.value?.focus();
      }
    };

    const onDocumentMouseDown = (event: MouseEvent) => {
      if (!isOpen.value) {
        return;
      }

      const target = event.target as Node | null;
      if (target && rootRef.value?.contains(target)) {
        return;
      }

      closeMenu();
    };

    const onSiblingSubmenuOpen = (event: Event) => {
      if (!isOpen.value) {
        return;
      }

      const detail = (event as CustomEvent<{ triggerId?: string }>).detail;
      if (detail?.triggerId === triggerId.value) {
        return;
      }

      closeMenu();
    };

    onMounted(() => {
      if (typeof document !== "undefined") {
        document.addEventListener("mousedown", onDocumentMouseDown, true);
        document.addEventListener(SUBMENU_OPEN_EVENT, onSiblingSubmenuOpen as EventListener);
      }
    });

    onBeforeUnmount(() => {
      if (typeof document !== "undefined") {
        document.removeEventListener("mousedown", onDocumentMouseDown, true);
        document.removeEventListener(
          SUBMENU_OPEN_EVENT,
          onSiblingSubmenuOpen as EventListener
        );
      }
    });

    expose({
      UNSAFE_getDOMNode: () => rootRef.value,
      focus: () => {
        buttonRef.value?.focus();
      },
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
      const slottedTriggerProps = (slottedTriggerNode?.props ?? {}) as Record<string, unknown>;
      const slottedTriggerLabel = slottedTriggerNode
        ? extractTextContent(slottedTriggerNode).trim()
        : "";
      const label =
        slottedTriggerLabel ||
        (!slottedMenuNode && defaultSlotNodes && defaultSlotNodes.length > 0
          ? defaultSlotNodes
          : props.label ?? "More");
      const ariaLabel =
        props.ariaLabel ??
        props["aria-label"] ??
        (slottedTriggerProps["aria-label"] as string | undefined) ??
        (attrsRecord["aria-label"] as string | undefined);
      const ariaLabelledby =
        props.ariaLabelledby ??
        props["aria-labelledby"] ??
        (attrsRecord["aria-labelledby"] as string | undefined);
      const slottedMenuProps = (slottedMenuNode?.props ?? {}) as Record<string, unknown>;
      const slottedMenuSlots =
        slottedMenuNode && slottedMenuNode.children && !Array.isArray(slottedMenuNode.children)
          ? (slottedMenuNode.children as Record<string, unknown>)
          : undefined;
      const triggerKey =
        slottedTriggerNode?.key ??
        (slottedTriggerProps.id as MenuKey | undefined) ??
        undefined;
      const disabledKeySet = new Set(
        Array.from(props.disabledKeys ?? [], (key) => String(key))
      );
      const closeOnSelect =
        (slottedMenuProps.closeOnSelect as boolean | undefined) ??
        props.closeOnSelect ??
        ((slottedMenuProps.selectionMode as SpectrumMenuSelectionMode | undefined) ??
          props.selectionMode) !==
          "multiple";
      const triggerDisabled =
        props.isDisabled ??
        (Boolean(slottedTriggerProps.isDisabled) ||
          (triggerKey !== undefined &&
            triggerKey !== null &&
            disabledKeySet.has(String(triggerKey))));

      return h(
        "li",
        {
          ...domProps,
          id: props.id,
          ref: (value: unknown) => {
            rootRef.value = value as HTMLLIElement | null;
          },
          role: "none",
          class: classNames(
            "spectrum-SubmenuTrigger",
            styleProps.class as ClassValue | undefined,
            domProps.class as ClassValue | undefined,
            props.UNSAFE_className as ClassValue | undefined
          ),
          style: {
            ...(styleProps.style ?? {}),
            ...(props.UNSAFE_style ?? {}),
          },
          onMouseleave: (event: MouseEvent) => {
            if (!isOpen.value) {
              return;
            }

            const nextTarget = event.relatedTarget as Node | null;
            if (nextTarget && rootRef.value?.contains(nextTarget)) {
              return;
            }

            closeMenu(false, false);
          },
          onFocusout: (event: FocusEvent) => {
            if (!isOpen.value) {
              return;
            }

            const nextTarget = event.relatedTarget as Node | null;
            if (nextTarget && rootRef.value?.contains(nextTarget)) {
              return;
            }

            closeMenu(false, false);
          },
        },
        [
          h(
            "button",
            {
              id: triggerId.value,
              ref: (value: unknown) => {
                buttonRef.value = value as HTMLButtonElement | null;
              },
              type: "button",
              role: "menuitem",
              class: classNames("spectrum-Menu-item"),
              disabled: triggerDisabled,
              "aria-disabled": triggerDisabled ? "true" : undefined,
              "aria-label": ariaLabel,
              "aria-labelledby": ariaLabelledby,
              "aria-haspopup": "menu",
              "aria-expanded": isOpen.value ? "true" : "false",
              "aria-controls": isOpen.value ? menuId.value : undefined,
              onClick: () => {
                if (triggerDisabled) {
                  return;
                }
                if (!isOpen.value) {
                  setOpen(true);
                  return;
                }

                if (openedByHover.value) {
                  openedByHover.value = false;
                  return;
                }

                setOpen(false);
              },
              onMouseenter: () => {
                if (triggerDisabled) {
                  return;
                }

                openedByHover.value = true;
                setOpen(true);
              },
              onMouseleave: (event: MouseEvent) => {
                if (!isOpen.value) {
                  return;
                }

                const nextTarget = event.relatedTarget as Node | null;
                if (nextTarget && rootRef.value?.contains(nextTarget)) {
                  return;
                }

                closeMenu(false, false);
              },
              onKeydown: (event: KeyboardEvent) => {
                if (triggerDisabled) {
                  return;
                }

                const openKey =
                  locale.value.direction === "rtl" ? "ArrowLeft" : "ArrowRight";
                const closeKey =
                  locale.value.direction === "rtl" ? "ArrowRight" : "ArrowLeft";

                if (event.key === openKey || event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setOpen(true);
                  return;
                }

                if (event.key === closeKey || event.key === "Escape") {
                  event.preventDefault();
                  closeMenu(true, false);
                }
              },
            },
            [
              h("span", { class: classNames("spectrum-Menu-itemLabel") }, label),
              h(
                "span",
                {
                  class: classNames("spectrum-Menu-submenuIcon"),
                  "aria-hidden": "true",
                },
                "▸"
              ),
            ]
          ),
          isOpen.value
            ? h(Menu, {
                id:
                  (slottedMenuProps.id as string | undefined) ??
                  menuId.value,
                items:
                  (slottedMenuProps.items as SpectrumMenuItemData[] | undefined) ??
                  props.items,
                sections:
                  (slottedMenuProps.sections as SpectrumMenuSectionData[] | undefined) ??
                  props.sections,
                selectionMode:
                  (slottedMenuProps.selectionMode as SpectrumMenuSelectionMode | undefined) ??
                  props.selectionMode,
                selectedKeys:
                  (slottedMenuProps.selectedKeys as Iterable<MenuKey> | undefined) ??
                  props.selectedKeys,
                defaultSelectedKeys:
                  (slottedMenuProps.defaultSelectedKeys as Iterable<MenuKey> | undefined) ??
                  props.defaultSelectedKeys,
                disabledKeys:
                  (slottedMenuProps.disabledKeys as Iterable<MenuKey> | undefined) ??
                  props.disabledKeys,
                isDisabled:
                  (slottedMenuProps.isDisabled as boolean | undefined) ?? props.isDisabled,
                closeOnSelect:
                  (slottedMenuProps.closeOnSelect as boolean | undefined) ??
                  props.closeOnSelect,
                shouldFocusWrap:
                  (slottedMenuProps.shouldFocusWrap as boolean | undefined) ??
                  props.shouldFocusWrap,
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
                closeOnEscape: false,
                onEscapeKeyDown: () => {
                  closeMenu(true, false);
                },
                onAction: (key) => {
                  callHandler(slottedMenuProps.onAction, key);
                  props.onAction?.(key);
                  if (closeOnSelect) {
                    closeMenu(true);
                  }
                },
                onSelectionChange: (keys) => {
                  callHandler(slottedMenuProps.onSelectionChange, keys);
                  props.onSelectionChange?.(keys);
                },
                onClose: (reason?: MenuCloseReason) => {
                  const shouldNotify = reason !== "escape";
                  if (shouldNotify) {
                    callHandler(slottedMenuProps.onClose);
                  }
                  closeMenu(true, shouldNotify);
                },
              }, slottedMenuSlots)
            : null,
        ]
      );
    };
  },
});
