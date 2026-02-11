import clsx from "clsx";
import type { PressEvent } from "@vue-aria/types";
import { computed, defineComponent, h, type PropType } from "vue";
import {
  ToggleButton as SpectrumToggleButton,
  type SpectrumToggleButtonProps,
} from "@vue-spectrum/button";
import { useProviderProps } from "@vue-spectrum/provider";
import type { ActionButtonSize } from "./ActionButton";

export interface S2ToggleButtonProps
  extends Omit<SpectrumToggleButtonProps, "staticColor"> {
  size?: ActionButtonSize | undefined;
  staticColor?: "white" | "black" | "auto" | undefined;
}

export const ToggleButton = defineComponent({
  name: "S2ToggleButton",
  inheritAttrs: false,
  props: {
    size: {
      type: String as PropType<ActionButtonSize | undefined>,
      default: undefined,
    },
    isQuiet: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isEmphasized: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    staticColor: {
      type: String as PropType<"white" | "black" | "auto" | undefined>,
      default: undefined,
    },
    isSelected: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    defaultSelected: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    onChange: {
      type: Function as PropType<((isSelected: boolean) => void) | undefined>,
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
        isQuiet: props.isQuiet,
        isEmphasized: props.isEmphasized,
        staticColor: props.staticColor === "auto" ? undefined : props.staticColor,
        isSelected: props.isSelected,
        defaultSelected: props.defaultSelected,
        onChange: props.onChange,
        isDisabled: props.isDisabled,
        autoFocus: props.autoFocus,
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
        UNSAFE_className: clsx("s2-ToggleButton", merged.UNSAFE_className),
        "data-s2-size": props.size,
      };
    });

    return () =>
      h(SpectrumToggleButton, forwardedProps.value as Record<string, unknown>, {
        default: () => slots.default?.() ?? [],
      });
  },
});
