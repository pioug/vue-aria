import { useMeter } from "@vue-aria/meter";
import { ProgressBarBase } from "@vue-spectrum/progress";
import { defineComponent, h } from "vue";
import type { SpectrumMeterProps } from "./types";

/**
 * Meter is a visual representation of a quantity or achievement.
 */
export const Meter = defineComponent({
  name: "SpectrumMeter",
  inheritAttrs: false,
  props: {
    value: {
      type: Number as () => number | undefined,
      required: false,
      default: undefined,
    },
    minValue: {
      type: Number as () => number | undefined,
      required: false,
      default: undefined,
    },
    maxValue: {
      type: Number as () => number | undefined,
      required: false,
      default: undefined,
    },
    valueLabel: {
      type: String,
      required: false,
    },
    formatOptions: {
      type: Object as () => Intl.NumberFormatOptions | undefined,
      required: false,
    },
    label: {
      type: String,
      required: false,
    },
    size: {
      type: String as () => SpectrumMeterProps["size"],
      required: false,
      default: "L",
    },
    showValueLabel: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    labelPosition: {
      type: String as () => SpectrumMeterProps["labelPosition"],
      required: false,
      default: "top",
    },
    variant: {
      type: String as () => SpectrumMeterProps["variant"],
      required: false,
      default: "informative",
    },
    UNSAFE_className: {
      type: String,
      required: false,
    },
    UNSAFE_style: {
      type: Object,
      required: false,
    },
  },
  setup(props, { attrs }) {
    const merged = {
      ...props,
      ...attrs,
    } as SpectrumMeterProps & Record<string, unknown>;
    const { meterProps, labelProps } = useMeter(merged);
    const barClassName = [
      merged.variant === "positive" ? "is-positive" : null,
      merged.variant === "warning" ? "is-warning" : null,
      merged.variant === "critical" ? "is-critical" : null,
    ]
      .filter(Boolean)
      .join(" ");

    return () =>
      h(ProgressBarBase as any, {
        ...merged,
        barProps: meterProps,
        labelProps,
        barClassName,
      });
  },
});
