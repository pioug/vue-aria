import { computed, defineComponent, h, ref, type PropType } from "vue";
import { useProgressBar } from "@vue-aria/progress";
import { mergeProps } from "@vue-aria/utils";
import { classNames, useStyleProps, type ClassValue } from "@vue-spectrum/utils";
import type { SpectrumProgressCircleProps } from "./types";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export const ProgressCircle = defineComponent({
  name: "ProgressCircle",
  inheritAttrs: false,
  props: {
    value: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
    minValue: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
    maxValue: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
    isIndeterminate: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    size: {
      type: String as PropType<"S" | "M" | "L" | undefined>,
      default: undefined,
    },
    staticColor: {
      type: String as PropType<"white" | "black" | undefined>,
      default: undefined,
    },
    variant: {
      type: String as PropType<"overBackground" | undefined>,
      default: undefined,
    },
    formatOptions: {
      type: Object as PropType<Intl.NumberFormatOptions | undefined>,
      default: undefined,
    },
    valueLabel: {
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
    UNSAFE_className: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    UNSAFE_style: {
      type: Object as PropType<Record<string, string | number> | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs, expose }) {
    const elementRef = ref<HTMLElement | null>(null);
    const isProduction =
      typeof process !== "undefined" && process.env.NODE_ENV === "production";

    const resolvedValue = computed(() =>
      clamp(props.value ?? 0, props.minValue ?? 0, props.maxValue ?? 100)
    );

    const resolvedAriaLabel = computed<string | undefined>(() =>
      props.ariaLabel ??
      ((attrs as Record<string, unknown>)["aria-label"] as string | undefined) ??
      ((attrs as Record<string, unknown>).ariaLabel as string | undefined)
    );
    const resolvedAriaLabelledby = computed<string | undefined>(() =>
      props.ariaLabelledby ??
      ((attrs as Record<string, unknown>)["aria-labelledby"] as string | undefined) ??
      ((attrs as Record<string, unknown>).ariaLabelledby as string | undefined)
    );

    const progressOptions = computed(() => ({
      ...props,
      ...(attrs as Record<string, unknown>),
      value: resolvedValue.value,
      "aria-label": resolvedAriaLabel.value,
      "aria-labelledby": resolvedAriaLabelledby.value,
    }));

    const { progressBarProps } = useProgressBar(progressOptions.value);
    const { styleProps } = useStyleProps(progressOptions.value);

    const subMask1Style = computed<Record<string, string>>(() => {
      const style: Record<string, string> = {};
      if (props.isIndeterminate) {
        return style;
      }

      const minValue = props.minValue ?? 0;
      const maxValue = props.maxValue ?? 100;
      const denominator = maxValue - minValue;
      if (denominator <= 0) {
        return style;
      }

      const percentage = ((resolvedValue.value - minValue) / denominator) * 100;
      if (percentage > 0 && percentage <= 50) {
        const angle = -180 + (percentage / 50) * 180;
        style.transform = `rotate(${angle}deg)`;
        return style;
      }

      if (percentage > 50) {
        style.transform = "rotate(0deg)";
        return style;
      }

      return style;
    });

    const subMask2Style = computed<Record<string, string>>(() => {
      const style: Record<string, string> = {};
      if (props.isIndeterminate) {
        return style;
      }

      const minValue = props.minValue ?? 0;
      const maxValue = props.maxValue ?? 100;
      const denominator = maxValue - minValue;
      if (denominator <= 0) {
        return style;
      }

      const percentage = ((resolvedValue.value - minValue) / denominator) * 100;
      if (percentage > 0 && percentage <= 50) {
        style.transform = "rotate(-180deg)";
        return style;
      }

      if (percentage > 50) {
        const angle = -180 + ((percentage - 50) / 50) * 180;
        style.transform = `rotate(${angle}deg)`;
        return style;
      }

      return style;
    });

    expose({
      UNSAFE_getDOMNode: () => elementRef.value,
    });

    return () => {
      if (!isProduction && !resolvedAriaLabel.value && !resolvedAriaLabelledby.value) {
        console.warn(
          "ProgressCircle requires an aria-label or aria-labelledby attribute for accessibility"
        );
      }

      const className = classNames(
        "spectrum-CircleLoader",
        {
          "spectrum-CircleLoader--indeterminate": Boolean(props.isIndeterminate),
          "spectrum-CircleLoader--small": props.size === "S",
          "spectrum-CircleLoader--large": props.size === "L",
          "spectrum-CircleLoader--overBackground": props.variant === "overBackground",
          "spectrum-CircleLoader--staticWhite": props.staticColor === "white",
          "spectrum-CircleLoader--staticBlack": props.staticColor === "black",
        },
        styleProps.class as ClassValue | undefined,
        props.UNSAFE_className as ClassValue | undefined
      );

      return h(
        "div",
        mergeProps(styleProps, progressBarProps.value, {
          ref: elementRef,
          class: className,
          style: {
            ...(styleProps.style ?? {}),
            ...(props.UNSAFE_style ?? {}),
          },
        }),
        [
          h("div", { class: classNames("spectrum-CircleLoader-track") }),
          h("div", { class: classNames("spectrum-CircleLoader-fills") }, [
            h("div", { class: classNames("spectrum-CircleLoader-fillMask1") }, [
              h(
                "div",
                {
                  class: classNames("spectrum-CircleLoader-fillSubMask1"),
                  "data-testid": "fillSubMask1",
                  style:
                    Object.keys(subMask1Style.value).length > 0
                      ? subMask1Style.value
                      : undefined,
                },
                [h("div", { class: classNames("spectrum-CircleLoader-fill") })]
              ),
            ]),
            h("div", { class: classNames("spectrum-CircleLoader-fillMask2") }, [
              h(
                "div",
                {
                  class: classNames("spectrum-CircleLoader-fillSubMask2"),
                  "data-testid": "fillSubMask2",
                  style:
                    Object.keys(subMask2Style.value).length > 0
                      ? subMask2Style.value
                      : undefined,
                },
                [h("div", { class: classNames("spectrum-CircleLoader-fill") })]
              ),
            ]),
          ]),
        ]
      );
    };
  },
});
