import { computed, defineComponent, h, ref } from "vue";
import { useRangeCalendar } from "@vue-aria/calendar";
import {
  useRangeCalendarState,
  type DateValue,
} from "@vue-aria/calendar-state";
import { useLocale } from "@vue-aria/i18n";
import { useId } from "@vue-aria/ssr";
import { filterDOMProps } from "@vue-aria/utils";
import { CalendarBase } from "./CalendarBase";
import { rangeCalendarPropOptions } from "./types";

export const RangeCalendar = defineComponent({
  name: "RangeCalendar",
  inheritAttrs: false,
  props: {
    ...rangeCalendarPropOptions,
  },
  setup(props, { attrs, expose }) {
    const locale = useLocale();
    const labelId = useId(undefined, "v-spectrum-range-calendar-label");
    const calendarRef = ref<HTMLElement | null>(null);

    const resolvedLocale = computed(() => props.locale ?? locale.value.locale);
    const visibleMonths = computed(() => Math.max(props.visibleMonths ?? 1, 1));

    const state = useRangeCalendarState<DateValue>({
      locale: resolvedLocale,
      visibleDuration: computed(() => ({ months: visibleMonths.value })),
      selectionAlignment: props.selectionAlignment,
      pageBehavior: props.pageBehavior,
      value: props.value,
      defaultValue: props.defaultValue,
      onChange: props.onChange,
      minValue: props.minValue,
      maxValue: props.maxValue,
      isDateUnavailable: props.isDateUnavailable,
      firstDayOfWeek: props.firstDayOfWeek,
      validationState: props.validationState,
      isInvalid: props.isInvalid,
      isDisabled: props.isDisabled,
      isReadOnly: props.isReadOnly,
      autoFocus: props.autoFocus,
      allowsNonContiguousRanges: props.allowsNonContiguousRanges,
    });

    const { calendarProps, prevButtonProps, nextButtonProps, errorMessageProps, title } =
      useRangeCalendar(
        {
          id: props.id,
          isDisabled: props.isDisabled,
          isInvalid: props.isInvalid,
          validationState: props.validationState,
          errorMessage: props.errorMessage,
          "aria-label":
            props["aria-label"] ??
            props.ariaLabel ??
            (props.label ? undefined : "Range calendar"),
          "aria-labelledby":
            props["aria-labelledby"] ??
            props.ariaLabelledby ??
            (props.label ? labelId.value : undefined),
          "aria-describedby": props["aria-describedby"] ?? props.ariaDescribedby,
          "aria-details": props["aria-details"],
        },
        state as unknown as Parameters<typeof useRangeCalendar>[1],
        calendarRef
      );

    const domProps = computed(() =>
      filterDOMProps(attrs as Record<string, unknown>, {
        labelable: true,
      })
    );

    expose({
      UNSAFE_getDOMNode: () => calendarRef.value,
      focus: () => {
        state.setFocused(true);
      },
    });

    return () =>
      h(CalendarBase, {
        state,
        calendarRef,
        calendarProps: calendarProps.value,
        prevButtonProps: prevButtonProps.value,
        nextButtonProps: nextButtonProps.value,
        errorMessageProps: errorMessageProps.value,
        title: title.value,
        visibleMonths: visibleMonths.value,
        locale: resolvedLocale.value,
        label: props.label,
        labelId: labelId.value,
        description: props.description,
        errorMessage: props.errorMessage,
        isDisabled: props.isDisabled,
        isReadOnly: props.isReadOnly,
        isHidden: props.isHidden,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
        domProps: domProps.value,
      });
  },
});
