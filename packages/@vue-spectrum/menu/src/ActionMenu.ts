import { defineComponent, h, type PropType } from "vue";
import { classNames, type ClassValue } from "@vue-spectrum/utils";
import { MenuTrigger, type SpectrumMenuTriggerProps } from "./MenuTrigger";

export interface SpectrumActionMenuProps extends SpectrumMenuTriggerProps {
  align?: "start" | "end" | undefined;
}

export const ActionMenu = defineComponent({
  name: "ActionMenu",
  inheritAttrs: false,
  props: {
    id: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    items: {
      type: Array as PropType<SpectrumActionMenuProps["items"]>,
      default: undefined,
    },
    selectionMode: {
      type: String as PropType<SpectrumActionMenuProps["selectionMode"]>,
      default: undefined,
    },
    selectedKeys: {
      type: [Array, Set] as unknown as PropType<SpectrumActionMenuProps["selectedKeys"]>,
      default: undefined,
    },
    defaultSelectedKeys: {
      type: [Array, Set] as unknown as PropType<SpectrumActionMenuProps["defaultSelectedKeys"]>,
      default: undefined,
    },
    disabledKeys: {
      type: [Array, Set] as unknown as PropType<SpectrumActionMenuProps["disabledKeys"]>,
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
      type: Function as PropType<SpectrumActionMenuProps["onAction"]>,
      default: undefined,
    },
    onSelectionChange: {
      type: Function as PropType<SpectrumActionMenuProps["onSelectionChange"]>,
      default: undefined,
    },
    onClose: {
      type: Function as PropType<SpectrumActionMenuProps["onClose"]>,
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
      type: Function as PropType<SpectrumActionMenuProps["onOpenChange"]>,
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
    align: {
      type: String as PropType<"start" | "end" | undefined>,
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
  setup(props, { attrs, slots }) {
    return () =>
      h(
        MenuTrigger,
        {
          ...(attrs as Record<string, unknown>),
          ...props,
          triggerLabel: props.triggerLabel ?? "Actions",
          UNSAFE_className: classNames(
            "spectrum-ActionMenu",
            props.UNSAFE_className as ClassValue | undefined
          ),
        },
        slots
      );
  },
});
