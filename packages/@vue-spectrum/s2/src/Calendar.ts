import clsx from "clsx";
import { computed, defineComponent, h, type PropType } from "vue";
import {
  Calendar as SpectrumCalendar,
  RangeCalendar as SpectrumRangeCalendar,
  type SpectrumCalendarProps,
  type SpectrumRangeCalendarProps,
} from "@vue-spectrum/calendar";
import { useProviderProps } from "@vue-spectrum/provider";

export interface S2CalendarProps extends SpectrumCalendarProps {}
export interface S2RangeCalendarProps extends SpectrumRangeCalendarProps {}

function useCalendarForwardedProps(
  attrs: Record<string, unknown>,
  className: string,
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
    UNSAFE_className: clsx(className, attrsClassName, props.UNSAFE_className),
    UNSAFE_style: {
      ...(attrsStyle ?? {}),
      ...(props.UNSAFE_style ?? {}),
    },
  });
}

const baseCalendarProps = {
  UNSAFE_className: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  UNSAFE_style: {
    type: Object as PropType<Record<string, string | number> | undefined>,
    default: undefined,
  },
} as const;

export const Calendar = defineComponent({
  name: "S2Calendar",
  inheritAttrs: false,
  props: baseCalendarProps,
  setup(props, { attrs }) {
    const forwardedProps = computed(() =>
      useCalendarForwardedProps(attrs as Record<string, unknown>, "s2-Calendar", props)
    );

    return () =>
      h(SpectrumCalendar, forwardedProps.value as Record<string, unknown>);
  },
});

export const RangeCalendar = defineComponent({
  name: "S2RangeCalendar",
  inheritAttrs: false,
  props: baseCalendarProps,
  setup(props, { attrs }) {
    const forwardedProps = computed(() =>
      useCalendarForwardedProps(attrs as Record<string, unknown>, "s2-RangeCalendar", props)
    );

    return () =>
      h(SpectrumRangeCalendar, forwardedProps.value as Record<string, unknown>);
  },
});
