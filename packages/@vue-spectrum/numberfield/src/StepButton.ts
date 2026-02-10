import {
  computed,
  defineComponent,
  h,
  type PropType,
} from "vue";
import { useFocusRing } from "@vue-aria/focus";
import { useHover, usePress } from "@vue-aria/interactions";
import type { PressEvent } from "@vue-aria/types";
import { mergeProps } from "@vue-aria/utils";
import { useProviderContext } from "@vue-spectrum/provider";
import { classNames, type ClassValue } from "@vue-spectrum/utils";

export interface SpectrumStepButtonProps {
  direction: "up" | "down";
  isQuiet?: boolean | undefined;
  isDisabled?: boolean | undefined;
  excludeFromTabOrder?: boolean | undefined;
  onPressStart?: ((event: PressEvent) => void) | undefined;
  onPressEnd?: ((event: PressEvent) => void) | undefined;
  onPressChange?: ((isPressed: boolean) => void) | undefined;
  onPressUp?: ((event: PressEvent) => void) | undefined;
  onPress?: ((event: PressEvent) => void) | undefined;
  onFocus?: ((event: FocusEvent) => void) | undefined;
  onBlur?: ((event: FocusEvent) => void) | undefined;
  "aria-label"?: string | undefined;
  "aria-controls"?: string | undefined;
  UNSAFE_className?: string | undefined;
}

export const StepButton = defineComponent({
  name: "StepButton",
  inheritAttrs: false,
  props: {
    direction: {
      type: String as PropType<"up" | "down">,
      required: true,
    },
    isQuiet: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    excludeFromTabOrder: {
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
    onFocus: {
      type: Function as PropType<((event: FocusEvent) => void) | undefined>,
      default: undefined,
    },
    onBlur: {
      type: Function as PropType<((event: FocusEvent) => void) | undefined>,
      default: undefined,
    },
    "aria-label": {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    "aria-controls": {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    UNSAFE_className: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs }) {
    const provider = useProviderContext();
    const scale = computed(() => provider?.value.scale ?? "medium");
    const isDisabled = computed(() => Boolean(props.isDisabled));

    const press = usePress({
      isDisabled,
      onPressStart: (event) => props.onPressStart?.(event),
      onPressEnd: (event) => props.onPressEnd?.(event),
      onPressChange: (next) => props.onPressChange?.(next),
      onPressUp: (event) => props.onPressUp?.(event),
      onPress: (event) => props.onPress?.(event),
    });

    const { hoverProps, isHovered } = useHover({
      isDisabled,
    });

    const focusRing = useFocusRing({
      onFocus: (event) => props.onFocus?.(event),
      onBlur: (event) => props.onBlur?.(event),
    });

    const tabIndex = computed(() =>
      props.excludeFromTabOrder === false ? 0 : -1
    );

    return () => {
      const directionClass =
        props.direction === "up"
          ? "spectrum-Stepper-button--stepUp"
          : "spectrum-Stepper-button--stepDown";
      const iconClass =
        props.direction === "up"
          ? "spectrum-Stepper-stepUpIcon"
          : "spectrum-Stepper-stepDownIcon";
      const iconText =
        props.direction === "up"
          ? scale.value === "large"
            ? "+"
            : "▴"
          : scale.value === "large"
            ? "-"
            : "▾";

      return h(
        "div",
        mergeProps(
          attrs as Record<string, unknown>,
          hoverProps,
          focusRing.focusProps,
          press.pressProps,
          {
            role: "button",
            tabindex: tabIndex.value,
            "aria-disabled": isDisabled.value || undefined,
            "aria-label": props["aria-label"],
            "aria-controls": props["aria-controls"],
            class: classNames(
              "spectrum-Stepper-button",
              directionClass,
              {
                "spectrum-Stepper-button--isQuiet": Boolean(props.isQuiet),
                "is-hovered": isHovered.value,
                "is-active": press.isPressed.value,
                "is-disabled": isDisabled.value,
                "focus-ring": focusRing.isFocusVisible.value,
              },
              props.UNSAFE_className as ClassValue | undefined,
              (attrs as Record<string, unknown>).class as ClassValue | undefined
            ),
          }
        ),
        [
          h(
            "span",
            {
              "aria-hidden": "true",
              class: classNames("spectrum-Stepper-button-icon", iconClass),
            },
            iconText
          ),
        ]
      );
    };
  },
});
