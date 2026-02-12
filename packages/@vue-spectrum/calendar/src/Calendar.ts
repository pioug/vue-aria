import { computed, defineComponent, h, ref } from "vue";
import { useCalendar } from "@vue-aria/calendar";
import { useCalendarState, type DateValue } from "@vue-aria/calendar-state";
import { useLocale, useLocalizedStringFormatter } from "@vue-aria/i18n";
import { useId } from "@vue-aria/ssr";
import { filterDOMProps } from "@vue-aria/utils";
import { CalendarBase } from "./CalendarBase";
import { calendarPropOptions } from "./types";

const CALENDAR_INTL_MESSAGES = {
  "en-US": {
    calendar: "Calendar",
  },
  "fr-FR": {
    calendar: "Calendrier",
  },
} as const;

export const Calendar = defineComponent({
  name: "Calendar",
  inheritAttrs: false,
  props: {
    ...calendarPropOptions,
  },
  setup(props, { attrs, expose }) {
    const locale = useLocale();
    const stringFormatter = useLocalizedStringFormatter(
      CALENDAR_INTL_MESSAGES,
      "@vue-spectrum/calendar"
    );
    const labelId = useId(undefined, "v-spectrum-calendar-label");
    const calendarRef = ref<HTMLElement | null>(null);

    const resolvedLocale = computed(() => props.locale ?? locale.value.locale);
    const visibleMonths = computed(() => Math.max(props.visibleMonths ?? 1, 1));

    const state = useCalendarState<DateValue>({
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
    });

    const { calendarProps, prevButtonProps, nextButtonProps, errorMessageProps, title } =
      useCalendar(
        {
          id: props.id,
          isDisabled: props.isDisabled,
          isInvalid: props.isInvalid,
          validationState: props.validationState,
          errorMessage: props.errorMessage,
          "aria-label":
            props["aria-label"] ??
            props.ariaLabel ??
            (props.label ? undefined : stringFormatter.value.format("calendar")),
          "aria-labelledby":
            props["aria-labelledby"] ??
            props.ariaLabelledby ??
            (props.label ? labelId.value : undefined),
          "aria-describedby": props["aria-describedby"] ?? props.ariaDescribedby,
          "aria-details": props["aria-details"],
        },
        state as unknown as Parameters<typeof useCalendar>[1]
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
