import clsx from "clsx";
import type { PressEvent } from "@vue-aria/types";
import { computed, defineComponent, h, type PropType } from "vue";
import {
  ActionButton as SpectrumActionButton,
  type SpectrumActionButtonProps,
} from "@vue-spectrum/button";
import { useProviderProps } from "@vue-spectrum/provider";

export type ActionButtonSize = "XS" | "S" | "M" | "L" | "XL";

export interface S2ActionButtonProps extends SpectrumActionButtonProps {
  size?: ActionButtonSize | undefined;
  isPending?: boolean | undefined;
}

export const ActionButton = defineComponent({
  name: "S2ActionButton",
  inheritAttrs: false,
  props: {
    elementType: {
      type: String as PropType<"button" | "a" | undefined>,
      default: undefined,
    },
    size: {
      type: String as PropType<ActionButtonSize | undefined>,
      default: undefined,
    },
    isPending: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isQuiet: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    staticColor: {
      type: String as PropType<"white" | "black" | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    autoFocus: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    href: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    target: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    rel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    type: {
      type: String as PropType<"button" | "submit" | "reset" | undefined>,
      default: undefined,
    },
    holdAffordance: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    hideButtonText: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    onPressStart: {
      type: Function as PropType<((event: PressEvent) => void) | undefined>,
      default: undefined,
    },
    onPressEnd: {
      type: Function as PropType<((event: PressEvent) => void) | undefined>,
      default: undefined,
    },
    onPressChange: {
      type: Function as PropType<((isPressed: boolean) => void) | undefined>,
      default: undefined,
    },
    onPressUp: {
      type: Function as PropType<((event: PressEvent) => void) | undefined>,
      default: undefined,
    },
    onPress: {
      type: Function as PropType<((event: PressEvent) => void) | undefined>,
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
        elementType: props.elementType,
        isQuiet: props.isQuiet,
        staticColor: props.staticColor,
        isDisabled: Boolean(props.isDisabled) || Boolean(props.isPending),
        autoFocus: props.autoFocus,
        href: props.href,
        target: props.target,
        rel: props.rel,
        type: props.type,
        holdAffordance: props.holdAffordance,
        hideButtonText: props.hideButtonText,
        onPressStart: props.onPressStart,
        onPressEnd: props.onPressEnd,
        onPressChange: props.onPressChange,
        onPressUp: props.onPressUp,
        onPress: props.onPress,
        slot: props.slot,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      });

      return {
        ...merged,
        UNSAFE_className: clsx("s2-ActionButton", merged.UNSAFE_className),
        "data-s2-size": props.size,
        "data-s2-pending": props.isPending ? "true" : undefined,
      };
    });

    return () =>
      h(SpectrumActionButton, forwardedProps.value as Record<string, unknown>, {
        default: () => slots.default?.() ?? [],
      });
  },
});
