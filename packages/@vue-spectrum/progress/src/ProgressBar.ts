import { defineComponent, h, ref, type PropType } from "vue";
import { useProgressBar } from "@vue-aria/progress";
import { classNames, type ClassValue } from "@vue-spectrum/utils";
import { ProgressBarBase } from "./ProgressBarBase";
import type { SpectrumProgressBarProps } from "./types";

export const ProgressBar = defineComponent({
  name: "ProgressBar",
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
    label: {
      type: String as PropType<string | undefined>,
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
    isIndeterminate: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    size: {
      type: String as PropType<"S" | "L" | undefined>,
      default: undefined,
    },
    labelPosition: {
      type: String as PropType<"top" | "side" | undefined>,
      default: undefined,
    },
    showValueLabel: {
      type: Boolean as PropType<boolean | undefined>,
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
    const baseRef = ref<{ UNSAFE_getDOMNode: () => HTMLElement | null } | null>(
      null
    );
    const resolvedAriaLabel =
      props.ariaLabel ??
      ((attrs as Record<string, unknown>)["aria-label"] as string | undefined) ??
      ((attrs as Record<string, unknown>).ariaLabel as string | undefined);
    const resolvedAriaLabelledby =
      props.ariaLabelledby ??
      ((attrs as Record<string, unknown>)["aria-labelledby"] as string | undefined) ??
      ((attrs as Record<string, unknown>).ariaLabelledby as string | undefined);

    const { progressBarProps, labelProps } = useProgressBar({
      ...props,
      ...(attrs as Record<string, unknown>),
      "aria-label": resolvedAriaLabel,
      "aria-labelledby": resolvedAriaLabelledby,
    });

    expose({
      UNSAFE_getDOMNode: () => baseRef.value?.UNSAFE_getDOMNode() ?? null,
    });

    return () =>
      h(ProgressBarBase, {
        ...(attrs as Record<string, unknown>),
        ...props,
        ref: baseRef,
        barProps: progressBarProps.value,
        labelProps: labelProps.value,
        barClassName: classNames({
          "spectrum-BarLoader--overBackground": props.variant === "overBackground",
          "spectrum-BarLoader--staticWhite": props.staticColor === "white",
          "spectrum-BarLoader--staticBlack": props.staticColor === "black",
        } as Record<string, boolean>) as ClassValue,
      } satisfies SpectrumProgressBarProps & Record<string, unknown>);
  },
});
