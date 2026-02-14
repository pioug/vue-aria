import { createCalendar as defaultCreateCalendar, type CalendarDate } from "@internationalized/date";
import { useButton } from "@vue-aria/button";
import { useCalendar, useCalendarCell, useCalendarGrid, useRangeCalendar } from "@vue-aria/calendar";
import { useCalendarState, useRangeCalendarState, type CalendarState, type RangeCalendarState } from "@vue-aria/calendar-state";
import { useLocale } from "@vue-aria/i18n";
import { defineComponent, h, computed, ref, useAttrs, type PropType, type Ref } from "vue";

type DateValue = any;
type DateRangeValue = { start: DateValue; end: DateValue } | null;

export interface SpectrumCalendarProps {
  value?: DateValue | null | undefined;
  defaultValue?: DateValue | null | undefined;
  onChange?: ((value: DateValue | null) => void) | undefined;
  focusedValue?: DateValue | undefined;
  defaultFocusedValue?: DateValue | undefined;
  onFocusChange?: ((value: DateValue) => void) | undefined;
  isDisabled?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  minValue?: DateValue | null | undefined;
  maxValue?: DateValue | null | undefined;
  isDateUnavailable?: ((date: DateValue) => boolean) | undefined;
  autoFocus?: boolean | undefined;
  isInvalid?: boolean | undefined;
  validationState?: "valid" | "invalid" | null | undefined;
  firstDayOfWeek?: "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | undefined;
  pageBehavior?: "visible" | "single" | undefined;
  visibleMonths?: number | undefined;
  selectionAlignment?: "start" | "center" | "end" | undefined;
  locale?: string | undefined;
  createCalendar?: ((name: string) => any) | undefined;
  errorMessage?: string | undefined;
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
  "aria-describedby"?: string | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  ariaDescribedby?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, unknown> | undefined;
}

export interface SpectrumRangeCalendarProps extends Omit<SpectrumCalendarProps, "value" | "defaultValue" | "onChange"> {
  value?: DateRangeValue | undefined;
  defaultValue?: DateRangeValue | undefined;
  onChange?: ((value: DateRangeValue) => void) | undefined;
  allowsNonContiguousRanges?: boolean | undefined;
}

const CalendarCellView = defineComponent({
  name: "SpectrumCalendarCellView",
  props: {
    date: {
      type: Object as PropType<CalendarDate>,
      required: true,
    },
    state: {
      type: Object as PropType<CalendarState | RangeCalendarState>,
      required: true,
    },
  },
  setup(props) {
    const cellRef = ref<HTMLElement | null>(null);
    const domRef = {
      get current() {
        return cellRef.value;
      },
      set current(value: HTMLElement | null) {
        cellRef.value = value;
      },
    };

    const cellAria = useCalendarCell(
      {
        get date() {
          return props.date;
        },
      },
      props.state,
      domRef
    );

    return () =>
      h(
        "td",
        {
          ...cellAria.cellProps,
          class: [
            "react-spectrum-Calendar-cell",
            {
              "is-selected": cellAria.isSelected,
              "is-focused": cellAria.isFocused,
              "is-disabled": cellAria.isDisabled,
              "is-unavailable": cellAria.isUnavailable,
              "is-invalid": cellAria.isInvalid,
            },
          ],
        },
        [
          h(
            "div",
            {
              ...cellAria.buttonProps,
              ref: cellRef,
              class: "react-spectrum-Calendar-date",
            },
            cellAria.formattedDate
          ),
        ]
      );
  },
});

function createNavButton(props: Record<string, unknown>) {
  const elementRef = ref<HTMLElement | null>(null);
  const domRef = {
    get current() {
      return elementRef.value;
    },
    set current(value: HTMLElement | null) {
      elementRef.value = value;
    },
  };

  const { buttonProps } = useButton(
    {
      ...(props as any),
      elementType: "button",
    },
    domRef as any
  );

  return {
    elementRef,
    buttonProps,
  };
}

const CalendarMonthView = defineComponent({
  name: "SpectrumCalendarMonthView",
  props: {
    monthStart: {
      type: Object as PropType<CalendarDate>,
      required: true,
    },
    firstDayOfWeek: {
      type: String as PropType<SpectrumCalendarProps["firstDayOfWeek"]>,
      required: false,
      default: undefined,
    },
    locale: {
      type: String as PropType<string | undefined>,
      required: false,
      default: undefined,
    },
    state: {
      type: Object as PropType<CalendarState | RangeCalendarState>,
      required: true,
    },
  },
  setup(props) {
    const grid = useCalendarGrid(
      {
        get startDate() {
          return props.monthStart;
        },
        get firstDayOfWeek() {
          return props.firstDayOfWeek;
        },
        get locale() {
          return props.locale;
        },
      },
      props.state
    );

    return () =>
      h(
        "table",
        {
          ...grid.gridProps,
          class: "react-spectrum-Calendar-table",
        },
        [
          h(
            "thead",
            {
              ...grid.headerProps,
            },
            [
              h(
                "tr",
                grid.weekDays.map((day) =>
                  h(
                    "th",
                    {
                      key: day,
                      class: "react-spectrum-Calendar-weekday",
                    },
                    day
                  )
                )
              ),
            ]
          ),
          h(
            "tbody",
            Array.from({ length: grid.weeksInMonth }, (_, weekIndex) => {
              const dates = props.state.getDatesInWeek(weekIndex, props.monthStart);
              return h(
                "tr",
                {
                  key: `week-${weekIndex}`,
                },
                dates.map((date, dateIndex) => {
                  if (!date) {
                    return h(
                      "td",
                      {
                        key: `empty-${dateIndex}`,
                        class: "react-spectrum-Calendar-emptyCell",
                      },
                      ""
                    );
                  }

                  return h(CalendarCellView, {
                    key: String(date),
                    date,
                    state: props.state,
                  });
                })
              );
            })
          ),
        ]
      );
  },
});

const CalendarBaseView = defineComponent({
  name: "SpectrumCalendarBaseView",
  props: {
    visibleMonths: {
      type: Number,
      required: true,
    },
    firstDayOfWeek: {
      type: String as PropType<SpectrumCalendarProps["firstDayOfWeek"]>,
      required: false,
      default: undefined,
    },
    locale: {
      type: String as PropType<string | undefined>,
      required: false,
      default: undefined,
    },
    title: {
      type: String,
      required: true,
    },
    calendarProps: {
      type: Object as PropType<Record<string, unknown>>,
      required: true,
    },
    prevButtonProps: {
      type: Object as PropType<Record<string, unknown>>,
      required: true,
    },
    nextButtonProps: {
      type: Object as PropType<Record<string, unknown>>,
      required: true,
    },
    errorMessageProps: {
      type: Object as PropType<Record<string, unknown>>,
      required: true,
    },
    state: {
      type: Object as PropType<CalendarState | RangeCalendarState>,
      required: true,
    },
    errorMessage: {
      type: String as PropType<string | undefined>,
      required: false,
      default: undefined,
    },
    className: {
      type: String as PropType<string | undefined>,
      required: false,
      default: undefined,
    },
    rootElementRef: {
      type: Object as PropType<Ref<HTMLElement | null> | undefined>,
      required: false,
      default: undefined,
    },
    style: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      required: false,
      default: undefined,
    },
  },
  setup(props) {
    const prevButton = createNavButton(props.prevButtonProps);
    const nextButton = createNavButton(props.nextButtonProps);

    return () =>
      h(
        "div",
        {
          ...props.calendarProps,
          class: ["react-spectrum-Calendar", props.className],
          ref: props.rootElementRef as any,
          style: props.style,
        },
        [
          h("div", { class: "react-spectrum-Calendar-header" }, [
            h(
              "button",
              {
                ...prevButton.buttonProps,
                ref: prevButton.elementRef,
                class: "react-spectrum-Calendar-navButton",
              },
              "‹"
            ),
            h(
              "h2",
              {
                class: "react-spectrum-Calendar-title",
              },
              props.title
            ),
            h(
              "button",
              {
                ...nextButton.buttonProps,
                ref: nextButton.elementRef,
                class: "react-spectrum-Calendar-navButton",
              },
              "›"
            ),
          ]),
          h(
            "div",
            {
              class: "react-spectrum-Calendar-grids",
            },
            Array.from({ length: props.visibleMonths }, (_, index) =>
              h(CalendarMonthView, {
                key: String(props.state.visibleRange.start.add({ months: index })),
                monthStart: props.state.visibleRange.start.add({ months: index }),
                firstDayOfWeek: props.firstDayOfWeek,
                locale: props.locale,
                state: props.state,
              })
            )
          ),
          props.errorMessage
            ? h(
              "div",
              {
                ...props.errorMessageProps,
                class: "react-spectrum-Calendar-errorMessage",
              },
              props.errorMessage
            )
            : null,
        ]
      );
  },
});

export const Calendar = defineComponent({
  name: "SpectrumCalendar",
  props: {
    value: {
      type: Object as PropType<DateValue | null | undefined>,
      default: undefined,
    },
    defaultValue: {
      type: Object as PropType<DateValue | null | undefined>,
      default: undefined,
    },
    onChange: {
      type: Function as PropType<((value: DateValue | null) => void) | undefined>,
      default: undefined,
    },
    focusedValue: {
      type: Object as PropType<DateValue | undefined>,
      default: undefined,
    },
    defaultFocusedValue: {
      type: Object as PropType<DateValue | undefined>,
      default: undefined,
    },
    onFocusChange: {
      type: Function as PropType<((value: DateValue) => void) | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isReadOnly: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    minValue: {
      type: Object as PropType<DateValue | null | undefined>,
      default: undefined,
    },
    maxValue: {
      type: Object as PropType<DateValue | null | undefined>,
      default: undefined,
    },
    isDateUnavailable: {
      type: Function as PropType<((date: DateValue) => boolean) | undefined>,
      default: undefined,
    },
    autoFocus: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isInvalid: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    validationState: {
      type: String as PropType<"valid" | "invalid" | null | undefined>,
      default: undefined,
    },
    firstDayOfWeek: {
      type: String as PropType<SpectrumCalendarProps["firstDayOfWeek"]>,
      default: undefined,
    },
    pageBehavior: {
      type: String as PropType<"visible" | "single" | undefined>,
      default: undefined,
    },
    visibleMonths: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
    selectionAlignment: {
      type: String as PropType<"start" | "center" | "end" | undefined>,
      default: undefined,
    },
    locale: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    createCalendar: {
      type: Function as PropType<((name: string) => any) | undefined>,
      default: undefined,
    },
    errorMessage: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    UNSAFE_className: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    UNSAFE_style: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      default: undefined,
    },
    "aria-label": {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    "aria-labelledby": {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    "aria-describedby": {
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
    ariaDescribedby: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },
  setup(props) {
    const attrs = useAttrs();
    const locale = useLocale();
    const visibleMonths = computed(() => Math.max(props.visibleMonths ?? 1, 1));

    const state = useCalendarState({
      get value() {
        return props.value;
      },
      get defaultValue() {
        return props.defaultValue;
      },
      onChange: props.onChange,
      get focusedValue() {
        return props.focusedValue;
      },
      get defaultFocusedValue() {
        return props.defaultFocusedValue;
      },
      onFocusChange: props.onFocusChange,
      get isDisabled() {
        return props.isDisabled;
      },
      get isReadOnly() {
        return props.isReadOnly;
      },
      get minValue() {
        return props.minValue;
      },
      get maxValue() {
        return props.maxValue;
      },
      isDateUnavailable: props.isDateUnavailable,
      get autoFocus() {
        return props.autoFocus;
      },
      get isInvalid() {
        return props.isInvalid;
      },
      get validationState() {
        return props.validationState;
      },
      get firstDayOfWeek() {
        return props.firstDayOfWeek;
      },
      get pageBehavior() {
        return props.pageBehavior;
      },
      get selectionAlignment() {
        return props.selectionAlignment;
      },
      get locale() {
        return props.locale ?? locale.value.locale;
      },
      visibleDuration: computed(() => ({ months: visibleMonths.value })).value,
      createCalendar: props.createCalendar ?? defaultCreateCalendar,
    } as any);

    const calendarAria = useCalendar(
      {
        get "aria-label"() {
          return props["aria-label"] ?? props.ariaLabel ?? (attrs["aria-label"] as string | undefined);
        },
        get "aria-labelledby"() {
          return props["aria-labelledby"] ?? props.ariaLabelledby ?? (attrs["aria-labelledby"] as string | undefined);
        },
        get "aria-describedby"() {
          return props["aria-describedby"] ?? props.ariaDescribedby ?? (attrs["aria-describedby"] as string | undefined);
        },
        errorMessage: props.errorMessage,
      },
      state
    );

    return () =>
      h(CalendarBaseView, {
        visibleMonths: visibleMonths.value,
        firstDayOfWeek: props.firstDayOfWeek,
        locale: props.locale ?? locale.value.locale,
        title: calendarAria.title,
        calendarProps: calendarAria.calendarProps,
        prevButtonProps: calendarAria.prevButtonProps as any,
        nextButtonProps: calendarAria.nextButtonProps as any,
        errorMessageProps: calendarAria.errorMessageProps,
        state,
        errorMessage: props.errorMessage,
        className: props.UNSAFE_className,
        style: props.UNSAFE_style,
      });
  },
});

export const RangeCalendar = defineComponent({
  name: "SpectrumRangeCalendar",
  props: {
    value: {
      type: Object as PropType<DateRangeValue | undefined>,
      default: undefined,
    },
    defaultValue: {
      type: Object as PropType<DateRangeValue | undefined>,
      default: undefined,
    },
    onChange: {
      type: Function as PropType<((value: DateRangeValue) => void) | undefined>,
      default: undefined,
    },
    focusedValue: {
      type: Object as PropType<DateValue | undefined>,
      default: undefined,
    },
    defaultFocusedValue: {
      type: Object as PropType<DateValue | undefined>,
      default: undefined,
    },
    onFocusChange: {
      type: Function as PropType<((value: DateValue) => void) | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isReadOnly: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    minValue: {
      type: Object as PropType<DateValue | null | undefined>,
      default: undefined,
    },
    maxValue: {
      type: Object as PropType<DateValue | null | undefined>,
      default: undefined,
    },
    isDateUnavailable: {
      type: Function as PropType<((date: DateValue) => boolean) | undefined>,
      default: undefined,
    },
    autoFocus: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isInvalid: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    validationState: {
      type: String as PropType<"valid" | "invalid" | null | undefined>,
      default: undefined,
    },
    firstDayOfWeek: {
      type: String as PropType<SpectrumCalendarProps["firstDayOfWeek"]>,
      default: undefined,
    },
    pageBehavior: {
      type: String as PropType<"visible" | "single" | undefined>,
      default: undefined,
    },
    visibleMonths: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
    selectionAlignment: {
      type: String as PropType<"start" | "center" | "end" | undefined>,
      default: undefined,
    },
    locale: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    createCalendar: {
      type: Function as PropType<((name: string) => any) | undefined>,
      default: undefined,
    },
    allowsNonContiguousRanges: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    errorMessage: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    UNSAFE_className: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    UNSAFE_style: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      default: undefined,
    },
    "aria-label": {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    "aria-labelledby": {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    "aria-describedby": {
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
    ariaDescribedby: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },
  setup(props) {
    const attrs = useAttrs();
    const locale = useLocale();
    const visibleMonths = computed(() => Math.max(props.visibleMonths ?? 1, 1));
    const calendarElementRef = ref<HTMLElement | null>(null);
    const calendarDomRef = {
      get current() {
        return calendarElementRef.value;
      },
      set current(value: HTMLElement | null) {
        calendarElementRef.value = value;
      },
    };

    const state = useRangeCalendarState({
      get value() {
        return props.value as any;
      },
      get defaultValue() {
        return props.defaultValue as any;
      },
      onChange: props.onChange as any,
      get focusedValue() {
        return props.focusedValue;
      },
      get defaultFocusedValue() {
        return props.defaultFocusedValue;
      },
      onFocusChange: props.onFocusChange,
      get isDisabled() {
        return props.isDisabled;
      },
      get isReadOnly() {
        return props.isReadOnly;
      },
      get minValue() {
        return props.minValue;
      },
      get maxValue() {
        return props.maxValue;
      },
      isDateUnavailable: props.isDateUnavailable,
      get autoFocus() {
        return props.autoFocus;
      },
      get isInvalid() {
        return props.isInvalid;
      },
      get validationState() {
        return props.validationState;
      },
      get firstDayOfWeek() {
        return props.firstDayOfWeek;
      },
      get pageBehavior() {
        return props.pageBehavior;
      },
      get selectionAlignment() {
        return props.selectionAlignment;
      },
      get locale() {
        return props.locale ?? locale.value.locale;
      },
      visibleDuration: computed(() => ({ months: visibleMonths.value })).value,
      createCalendar: props.createCalendar ?? defaultCreateCalendar,
      get allowsNonContiguousRanges() {
        return props.allowsNonContiguousRanges;
      },
    } as any);

    const calendarAria = useRangeCalendar(
      {
        get "aria-label"() {
          return props["aria-label"] ?? props.ariaLabel ?? (attrs["aria-label"] as string | undefined);
        },
        get "aria-labelledby"() {
          return props["aria-labelledby"] ?? props.ariaLabelledby ?? (attrs["aria-labelledby"] as string | undefined);
        },
        get "aria-describedby"() {
          return props["aria-describedby"] ?? props.ariaDescribedby ?? (attrs["aria-describedby"] as string | undefined);
        },
        errorMessage: props.errorMessage,
      },
      state as any,
      calendarDomRef
    );

    return () =>
      h(CalendarBaseView, {
        visibleMonths: visibleMonths.value,
        firstDayOfWeek: props.firstDayOfWeek,
        locale: props.locale ?? locale.value.locale,
        title: calendarAria.title,
        calendarProps: calendarAria.calendarProps,
        prevButtonProps: calendarAria.prevButtonProps as any,
        nextButtonProps: calendarAria.nextButtonProps as any,
        errorMessageProps: calendarAria.errorMessageProps,
        state,
        errorMessage: props.errorMessage,
        className: props.UNSAFE_className,
        rootElementRef: calendarElementRef,
        style: props.UNSAFE_style,
      });
  },
});
