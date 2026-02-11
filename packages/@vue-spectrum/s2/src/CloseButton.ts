import clsx from "clsx";
import type { PressEvent } from "@vue-aria/types";
import { computed, defineComponent, h, type PropType } from "vue";
import { ActionButton, type ActionButtonSize } from "./ActionButton";

export interface S2CloseButtonProps {
  size?: Exclude<ActionButtonSize, "XS"> | undefined;
  staticColor?: "white" | "black" | "auto" | undefined;
  isDisabled?: boolean | undefined;
  autoFocus?: boolean | undefined;
  onPressStart?: ((event: PressEvent) => void) | undefined;
  onPressEnd?: ((event: PressEvent) => void) | undefined;
  onPressChange?: ((isPressed: boolean) => void) | undefined;
  onPressUp?: ((event: PressEvent) => void) | undefined;
  onPress?: ((event: PressEvent) => void) | undefined;
  ariaLabel?: string | undefined;
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export const CloseButton = defineComponent({
  name: "S2CloseButton",
  inheritAttrs: false,
  props: {
    size: {
      type: String as PropType<Exclude<ActionButtonSize, "XS"> | undefined>,
      default: undefined,
    },
    staticColor: {
      type: String as PropType<"white" | "black" | "auto" | undefined>,
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
    ariaLabel: {
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
  setup(props, { attrs, slots }) {
    const forwardedProps = computed(() => ({
      ...(attrs as Record<string, unknown>),
      size: props.size,
      staticColor: props.staticColor === "auto" ? undefined : props.staticColor,
      isDisabled: props.isDisabled,
      autoFocus: props.autoFocus,
      onPressStart: props.onPressStart,
      onPressEnd: props.onPressEnd,
      onPressChange: props.onPressChange,
      onPressUp: props.onPressUp,
      onPress: props.onPress,
      "aria-label":
        props.ariaLabel ??
        ((attrs as Record<string, unknown>)["aria-label"] as string | undefined) ??
        "Dismiss",
      slot: props.slot ?? "close",
      UNSAFE_className: clsx("s2-CloseButton", props.UNSAFE_className),
      UNSAFE_style: props.UNSAFE_style,
    }));

    return () =>
      h(ActionButton, forwardedProps.value, {
        default: () =>
          slots.default?.() ?? [h("span", { "aria-hidden": "true" }, "×")],
      });
  },
});
