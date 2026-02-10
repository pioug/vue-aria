import { defineComponent, h, ref, type PropType } from "vue";
import { useMeter } from "@vue-aria/meter";
import { classNames, type ClassValue } from "@vue-spectrum/utils";
import { ProgressBarBase } from "@vue-spectrum/progress";

export type MeterVariant = "informative" | "positive" | "warning" | "critical";

export interface SpectrumMeterProps {
  value?: number | undefined;
  minValue?: number | undefined;
  maxValue?: number | undefined;
  label?: string | undefined;
  formatOptions?: Intl.NumberFormatOptions | undefined;
  valueLabel?: string | undefined;
  size?: "S" | "L" | undefined;
  labelPosition?: "top" | "side" | undefined;
  showValueLabel?: boolean | undefined;
  variant?: MeterVariant | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export const Meter = defineComponent({
  name: "Meter",
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
    variant: {
      type: String as PropType<MeterVariant | undefined>,
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

    const { meterProps, labelProps } = useMeter({
      ...(attrs as Record<string, unknown>),
      ...props,
      "aria-label":
        props.ariaLabel ??
        ((attrs as Record<string, unknown>)["aria-label"] as string | undefined) ??
        ((attrs as Record<string, unknown>).ariaLabel as string | undefined),
      "aria-labelledby":
        props.ariaLabelledby ??
        ((attrs as Record<string, unknown>)["aria-labelledby"] as string | undefined) ??
        ((attrs as Record<string, unknown>).ariaLabelledby as string | undefined),
    });

    expose({
      UNSAFE_getDOMNode: () => baseRef.value?.UNSAFE_getDOMNode() ?? null,
    });

    return () =>
      h(ProgressBarBase, {
        ...(attrs as Record<string, unknown>),
        ...props,
        ref: baseRef,
        barProps: meterProps.value,
        labelProps: labelProps.value,
        barClassName: classNames({
          "is-positive": props.variant === "positive",
          "is-warning": props.variant === "warning",
          "is-critical": props.variant === "critical",
        } as Record<string, boolean>) as ClassValue,
      });
  },
});
