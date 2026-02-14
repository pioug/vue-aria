import { useProgressBar } from "@vue-aria/progress";
import { defineComponent, h } from "vue";
import { ProgressBarBase } from "./ProgressBarBase";
import type { SpectrumProgressBarProps } from "./types";

/**
 * ProgressBar shows operation progress in bar form.
 */
export const ProgressBar = defineComponent({
  name: "SpectrumProgressBar",
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
    isIndeterminate: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
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
      type: String as () => SpectrumProgressBarProps["size"],
      required: false,
      default: "L",
    },
    showValueLabel: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    labelPosition: {
      type: String as () => SpectrumProgressBarProps["labelPosition"],
      required: false,
      default: "top",
    },
    staticColor: {
      type: String as () => SpectrumProgressBarProps["staticColor"],
      required: false,
    },
    variant: {
      type: String as () => SpectrumProgressBarProps["variant"],
      required: false,
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
    } as SpectrumProgressBarProps & Record<string, unknown>;
    const { progressBarProps, labelProps } = useProgressBar(merged);
    const barClassName = [
      merged.variant === "overBackground" ? "spectrum-BarLoader--overBackground" : null,
      merged.staticColor === "white" ? "spectrum-BarLoader--staticWhite" : null,
      merged.staticColor === "black" ? "spectrum-BarLoader--staticBlack" : null,
    ]
      .filter(Boolean)
      .join(" ");

    return () =>
      h(ProgressBarBase as any, {
        ...merged,
        barProps: progressBarProps,
        labelProps,
        barClassName,
      });
  },
});
