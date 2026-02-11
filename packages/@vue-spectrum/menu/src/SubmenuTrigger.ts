import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  type PropType,
} from "vue";
import { useId } from "@vue-aria/ssr";
import { filterDOMProps } from "@vue-aria/utils";
import { classNames, useStyleProps, type ClassValue } from "@vue-spectrum/utils";
import { Menu } from "./Menu";
import type {
  MenuKey,
  SpectrumMenuBaseProps,
  SpectrumMenuItemData,
  SpectrumMenuSectionData,
  SpectrumMenuSelectionMode,
} from "./types";

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
    const rootRef = ref<HTMLLIElement | null>(null);
    const buttonRef = ref<HTMLButtonElement | null>(null);
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
    };

    const closeMenu = (restoreFocus = false) => {
      setOpen(false);
      props.onClose?.();

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

      const label = slots.default?.() ?? props.label ?? "More";
      const ariaLabel =
        props.ariaLabel ??
        props["aria-label"] ??
        (attrsRecord["aria-label"] as string | undefined);
      const ariaLabelledby =
        props.ariaLabelledby ??
        props["aria-labelledby"] ??
        (attrsRecord["aria-labelledby"] as string | undefined);
      const closeOnSelect = props.closeOnSelect ?? props.selectionMode !== "multiple";

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
              disabled: props.isDisabled,
              "aria-label": ariaLabel,
              "aria-labelledby": ariaLabelledby,
              "aria-haspopup": "menu",
              "aria-expanded": isOpen.value ? "true" : "false",
              "aria-controls": isOpen.value ? menuId.value : undefined,
              onClick: () => {
                if (props.isDisabled) {
                  return;
                }
                setOpen(!isOpen.value);
              },
              onKeydown: (event: KeyboardEvent) => {
                if (props.isDisabled) {
                  return;
                }

                switch (event.key) {
                  case "ArrowRight":
                  case "Enter":
                  case " ":
                    event.preventDefault();
                    setOpen(true);
                    break;
                  case "ArrowLeft":
                  case "Escape":
                    event.preventDefault();
                    closeMenu(true);
                    break;
                  default:
                    break;
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
                id: menuId.value,
                items: props.items,
                sections: props.sections,
                selectionMode: props.selectionMode,
                selectedKeys: props.selectedKeys,
                defaultSelectedKeys: props.defaultSelectedKeys,
                disabledKeys: props.disabledKeys,
                isDisabled: props.isDisabled,
                closeOnSelect: props.closeOnSelect,
                shouldFocusWrap: props.shouldFocusWrap,
                ariaLabel: props.ariaLabel,
                ariaLabelledby:
                  props.ariaLabelledby ?? props["aria-labelledby"] ?? triggerId.value,
                onAction: (key) => {
                  props.onAction?.(key);
                  if (closeOnSelect) {
                    closeMenu(true);
                  }
                },
                onSelectionChange: props.onSelectionChange,
                onClose: () => {
                  closeMenu(true);
                },
              })
            : null,
        ]
      );
    };
  },
});
