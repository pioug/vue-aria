import clsx from "clsx";
import { computed, defineComponent, h, type PropType } from "vue";
import {
  Menu as SpectrumMenu,
  MenuItem as SpectrumMenuItem,
  MenuTrigger as SpectrumMenuTrigger,
  type SpectrumMenuItemProps,
  type SpectrumMenuProps,
  type SpectrumMenuTriggerProps,
} from "@vue-spectrum/menu";
import { useProviderProps } from "@vue-spectrum/provider";

export type MenuSize = "S" | "M" | "L" | "XL";

export interface S2MenuProps extends SpectrumMenuProps {
  size?: MenuSize | undefined;
}

export interface S2MenuTriggerProps extends SpectrumMenuTriggerProps {
  size?: MenuSize | undefined;
  isQuiet?: boolean | undefined;
}

export interface S2MenuItemProps extends SpectrumMenuItemProps {}

export const Menu = defineComponent({
  name: "S2Menu",
  inheritAttrs: false,
  props: {
    size: {
      type: String as PropType<MenuSize | undefined>,
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
      const attrsRecord = attrs as Record<string, unknown>;
      const attrsClassName =
        typeof attrsRecord.UNSAFE_className === "string"
          ? (attrsRecord.UNSAFE_className as string)
          : undefined;
      const attrsStyle =
        (attrsRecord.UNSAFE_style as Record<string, string | number> | undefined) ??
        undefined;

      return useProviderProps({
        ...attrsRecord,
        UNSAFE_className: clsx(
          "s2-Menu",
          props.size ? `s2-Menu--${props.size}` : null,
          attrsClassName,
          props.UNSAFE_className
        ),
        UNSAFE_style: {
          ...(attrsStyle ?? {}),
          ...(props.UNSAFE_style ?? {}),
        },
        "data-s2-size": props.size,
      });
    });

    return () => h(SpectrumMenu, forwardedProps.value as Record<string, unknown>, slots);
  },
});

export const MenuTrigger = defineComponent({
  name: "S2MenuTrigger",
  inheritAttrs: false,
  props: {
    size: {
      type: String as PropType<MenuSize | undefined>,
      default: undefined,
    },
    isQuiet: {
      type: Boolean as PropType<boolean | undefined>,
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
      const attrsRecord = attrs as Record<string, unknown>;
      const attrsClassName =
        typeof attrsRecord.UNSAFE_className === "string"
          ? (attrsRecord.UNSAFE_className as string)
          : undefined;
      const attrsStyle =
        (attrsRecord.UNSAFE_style as Record<string, string | number> | undefined) ??
        undefined;

      return useProviderProps({
        ...attrsRecord,
        UNSAFE_className: clsx(
          "s2-MenuTrigger",
          props.size ? `s2-MenuTrigger--${props.size}` : null,
          attrsClassName,
          props.UNSAFE_className
        ),
        UNSAFE_style: {
          ...(attrsStyle ?? {}),
          ...(props.UNSAFE_style ?? {}),
        },
        "data-s2-size": props.size,
        "data-s2-quiet": props.isQuiet ? "true" : undefined,
      });
    });

    return () =>
      h(SpectrumMenuTrigger, forwardedProps.value as Record<string, unknown>, slots);
  },
});

export const MenuItem = SpectrumMenuItem;

export type {
  MenuKey as S2MenuKey,
  SpectrumMenuItemData as S2MenuItemData,
  SpectrumMenuSelectionMode as S2MenuSelectionMode,
} from "@vue-spectrum/menu";
