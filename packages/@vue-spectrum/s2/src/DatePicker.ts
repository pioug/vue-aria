import clsx from "clsx";
import { computed, defineComponent, h, type PropType } from "vue";
import {
  DatePicker as SpectrumDatePicker,
  DateRangePicker as SpectrumDateRangePicker,
  TimeField as SpectrumTimeField,
  type SpectrumDatePickerProps,
  type SpectrumDateRangePickerProps,
  type SpectrumTimeFieldProps,
} from "@vue-spectrum/datepicker";
import { useProviderProps } from "@vue-spectrum/provider";

export type DatePickerSize = "S" | "M" | "L" | "XL";

export interface S2DatePickerProps extends SpectrumDatePickerProps {
  size?: DatePickerSize | undefined;
}

export interface S2DateRangePickerProps extends SpectrumDateRangePickerProps {
  size?: DatePickerSize | undefined;
}

export interface S2TimeFieldProps extends SpectrumTimeFieldProps {
  size?: DatePickerSize | undefined;
}

function useDatePickerForwardedProps(
  attrs: Record<string, unknown>,
  className: string,
  size: DatePickerSize | undefined,
  props: {
    UNSAFE_className?: string | undefined;
    UNSAFE_style?: Record<string, string | number> | undefined;
  }
) {
  const attrsClassName =
    typeof attrs.UNSAFE_className === "string" ? (attrs.UNSAFE_className as string) : undefined;
  const attrsStyle =
    (attrs.UNSAFE_style as Record<string, string | number> | undefined) ?? undefined;

  return useProviderProps({
    ...attrs,
    UNSAFE_className: clsx(
      className,
      size ? `${className}--${size}` : null,
      attrsClassName,
      props.UNSAFE_className
    ),
    UNSAFE_style: {
      ...(attrsStyle ?? {}),
      ...(props.UNSAFE_style ?? {}),
    },
  });
}

const baseDatePickerProps = {
  size: {
    type: String as PropType<DatePickerSize | undefined>,
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
} as const;

export const DatePicker = defineComponent({
  name: "S2DatePicker",
  inheritAttrs: false,
  props: baseDatePickerProps,
  setup(props, { attrs }) {
    const forwardedProps = computed(() =>
      useDatePickerForwardedProps(
        attrs as Record<string, unknown>,
        "s2-DatePicker",
        props.size,
        props
      )
    );

    return () =>
      h(SpectrumDatePicker, forwardedProps.value as Record<string, unknown>);
  },
});

export const DateRangePicker = defineComponent({
  name: "S2DateRangePicker",
  inheritAttrs: false,
  props: baseDatePickerProps,
  setup(props, { attrs }) {
    const forwardedProps = computed(() =>
      useDatePickerForwardedProps(
        attrs as Record<string, unknown>,
        "s2-DateRangePicker",
        props.size,
        props
      )
    );

    return () =>
      h(SpectrumDateRangePicker, forwardedProps.value as Record<string, unknown>);
  },
});

export const TimeField = defineComponent({
  name: "S2TimeField",
  inheritAttrs: false,
  props: baseDatePickerProps,
  setup(props, { attrs }) {
    const forwardedProps = computed(() =>
      useDatePickerForwardedProps(
        attrs as Record<string, unknown>,
        "s2-TimeField",
        props.size,
        props
      )
    );

    return () =>
      h(SpectrumTimeField, forwardedProps.value as Record<string, unknown>);
  },
});
