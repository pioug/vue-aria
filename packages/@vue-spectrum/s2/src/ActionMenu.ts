import clsx from "clsx";
import { computed, defineComponent, h, type PropType } from "vue";
import {
  ActionMenu as SpectrumActionMenu,
  type SpectrumActionMenuProps,
} from "@vue-spectrum/menu";
import { useProviderProps } from "@vue-spectrum/provider";
import type { ActionButtonSize } from "./ActionButton";

export interface S2ActionMenuProps extends SpectrumActionMenuProps {
  size?: ActionButtonSize | undefined;
  menuSize?: "S" | "M" | "L" | "XL" | undefined;
  isQuiet?: boolean | undefined;
}

export const ActionMenu = defineComponent({
  name: "S2ActionMenu",
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
    size: {
      type: String as PropType<ActionButtonSize | undefined>,
      default: undefined,
    },
    menuSize: {
      type: String as PropType<"S" | "M" | "L" | "XL" | undefined>,
      default: undefined,
    },
    isQuiet: {
      type: Boolean as PropType<boolean | undefined>,
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
    const forwardedProps = computed(() => {
      const merged = useProviderProps({
        ...(attrs as Record<string, unknown>),
        id: props.id,
        items: props.items,
        selectionMode: props.selectionMode,
        selectedKeys: props.selectedKeys,
        defaultSelectedKeys: props.defaultSelectedKeys,
        disabledKeys: props.disabledKeys,
        isDisabled: props.isDisabled,
        closeOnSelect: props.closeOnSelect,
        shouldFocusWrap: props.shouldFocusWrap,
        onAction: props.onAction,
        onSelectionChange: props.onSelectionChange,
        onClose: props.onClose,
        isOpen: props.isOpen,
        defaultOpen: props.defaultOpen,
        onOpenChange: props.onOpenChange,
        triggerLabel: props.triggerLabel,
        triggerAriaLabel: props.triggerAriaLabel ?? "More actions",
        ariaLabel: props.ariaLabel,
        ariaLabelledby: props.ariaLabelledby,
        "aria-label": props["aria-label"],
        "aria-labelledby": props["aria-labelledby"],
        align: props.align,
        slot: props.slot,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      });

      return {
        ...merged,
        UNSAFE_className: clsx("s2-ActionMenu", merged.UNSAFE_className),
        "data-s2-size": props.size,
        "data-s2-menu-size": props.menuSize,
        "data-s2-quiet": props.isQuiet ? "true" : undefined,
      };
    });

    return () =>
      h(SpectrumActionMenu, forwardedProps.value as Record<string, unknown>, slots);
  },
});
