import { computed, defineComponent, h, type PropType, type Ref } from "vue";
import type {
  DateValue,
  UseCalendarStateResult,
  UseRangeCalendarStateResult,
} from "@vue-aria/calendar-state";
import { mergeProps } from "@vue-aria/utils";
import {
  classNames,
  useStyleProps,
  type ClassValue,
} from "@vue-spectrum/utils";
import { CalendarCell } from "./CalendarCell";

function formatWeekday(
  date: DateValue | null,
  formatter: Intl.DateTimeFormat,
  dayIndex: number
): string {
  if (date) {
    return formatter.format(date.toDate("UTC"));
  }

  return formatter.format(new Date(Date.UTC(2024, 0, dayIndex + 7)));
}

function mergeClass(
  original: unknown,
  added: string | undefined
): ClassValue | undefined {
  if (original === undefined) {
    return added;
  }
  return [original as ClassValue, added];
}

interface CalendarBaseButtonProps {
  "aria-label"?: string | undefined;
  isDisabled?: boolean | undefined;
  onPress?: (() => void) | undefined;
  onFocusChange?: ((isFocused: boolean) => void) | undefined;
}

interface CalendarBaseProps {
  state: UseCalendarStateResult | UseRangeCalendarStateResult;
  calendarRef: Ref<HTMLElement | null>;
  calendarProps: Record<string, unknown>;
  prevButtonProps: CalendarBaseButtonProps;
  nextButtonProps: CalendarBaseButtonProps;
  errorMessageProps: Record<string, unknown>;
  title: string;
  visibleMonths: number;
  locale: string;
  label?: string | undefined;
  labelId?: string | undefined;
  description?: string | undefined;
  errorMessage?: string | undefined;
  isDisabled?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  isHidden?: boolean | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
  domProps?: Record<string, unknown> | undefined;
}

export const CalendarBase = defineComponent({
  name: "CalendarBase",
  props: {
    state: {
      type: Object as PropType<UseCalendarStateResult | UseRangeCalendarStateResult>,
      required: true,
    },
    calendarRef: {
      type: Object as PropType<Ref<HTMLElement | null>>,
      required: true,
    },
    calendarProps: {
      type: Object as PropType<Record<string, unknown>>,
      required: true,
    },
    prevButtonProps: {
      type: Object as PropType<CalendarBaseButtonProps>,
      required: true,
    },
    nextButtonProps: {
      type: Object as PropType<CalendarBaseButtonProps>,
      required: true,
    },
    errorMessageProps: {
      type: Object as PropType<Record<string, unknown>>,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    visibleMonths: {
      type: Number,
      required: true,
    },
    locale: {
      type: String,
      required: true,
    },
    label: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    labelId: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    description: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    errorMessage: {
      type: String as PropType<string | undefined>,
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
    isHidden: {
      type: Boolean as PropType<boolean | undefined>,
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
    domProps: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      default: undefined,
    },
  },
  setup(props) {
    const monthFormatter = computed(
      () =>
        new Intl.DateTimeFormat(props.locale, {
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        })
    );
    const weekdayFormatter = computed(
      () =>
        new Intl.DateTimeFormat(props.locale, {
          weekday: "short",
          timeZone: "UTC",
        })
    );

    const getMonthStart = (monthIndex: number): DateValue =>
      props.state.visibleRange.value.start.add({ months: monthIndex });

    const getMonthRows = (monthStart: DateValue): Array<Array<DateValue | null>> => {
      const weeks: Array<Array<DateValue | null>> = [];
      for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
        const week = props.state.getDatesInWeek(weekIndex, monthStart);
        if (week.every((date) => date === null)) {
          break;
        }
        weeks.push(week);
      }

      if (weeks.length === 0) {
        weeks.push(props.state.getDatesInWeek(0, monthStart));
      }

      return weeks;
    };

    const renderMonth = (monthIndex: number) => {
      const monthStart = getMonthStart(monthIndex);
      const monthRows = getMonthRows(monthStart);
      const firstRow = monthRows[0] ?? [];
      const weekdayHeaders = Array.from({ length: 7 }, (_, dayIndex) =>
        formatWeekday(firstRow[dayIndex] ?? null, weekdayFormatter.value, dayIndex)
      );
      const monthLabel = monthFormatter.value.format(monthStart.toDate("UTC"));

      return h(
        "div",
        {
          key: `month-${monthIndex}`,
          class: classNames("react-spectrum-Calendar-month"),
        },
        [
          h(
            "h3",
            {
              class: classNames("react-spectrum-Calendar-monthTitle"),
            },
            monthLabel
          ),
          h(
            "table",
            {
              role: "grid",
              "aria-label": monthLabel,
              class: classNames("react-spectrum-Calendar-grid"),
            },
            [
              h(
                "thead",
                h(
                  "tr",
                  { role: "row" },
                  weekdayHeaders.map((header, index) =>
                    h(
                      "th",
                      {
                        key: `header-${index}`,
                        role: "columnheader",
                        class: classNames("react-spectrum-Calendar-weekday"),
                      },
                      header
                    )
                  )
                )
              ),
              h(
                "tbody",
                monthRows.map((week, weekIndex) =>
                  h(
                    "tr",
                    {
                      key: `week-${weekIndex}`,
                      role: "row",
                    },
                    week.map((date, dayIndex) => {
                      if (date === null) {
                        return h(
                          "td",
                          {
                            key: `empty-${weekIndex}-${dayIndex}`,
                            role: "gridcell",
                            "aria-disabled": "true",
                            class: classNames("react-spectrum-CalendarCell", "is-empty"),
                          },
                          ""
                        );
                      }

                      return h(CalendarCell, {
                        key: date.toString(),
                        date,
                        state: props.state,
                      });
                    })
                  )
                )
              ),
            ]
          ),
        ]
      );
    };

    const previousButtonProps = computed(() => props.prevButtonProps);
    const nextButtonProps = computed(() => props.nextButtonProps);

    return () => {
      const { styleProps } = useStyleProps({
        isHidden: props.isHidden,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      });

      const prevFocusChange = previousButtonProps.value.onFocusChange;
      const nextFocusChange = nextButtonProps.value.onFocusChange;

      const mergedCalendarProps = mergeProps(props.domProps ?? {}, props.calendarProps, {
        ref: (value: unknown) => {
          props.calendarRef.value = value as HTMLElement | null;
        },
        class: mergeClass(
          props.calendarProps.class,
          classNames(
            "react-spectrum-Calendar",
            {
              "is-disabled": Boolean(props.isDisabled),
              "is-readOnly": Boolean(props.isReadOnly),
            },
            styleProps.class as ClassValue | undefined
          )
        ),
        style: props.calendarProps.style ?? styleProps.style,
        hidden: styleProps.hidden,
      });

      return h("div", { class: classNames("react-spectrum-Calendar-wrapper") }, [
        props.label
          ? h(
              "label",
              {
                id: props.labelId,
                class: classNames("spectrum-FieldLabel"),
              },
              props.label
            )
          : null,
        h("div", mergedCalendarProps, [
          h("div", { class: classNames("react-spectrum-Calendar-header") }, [
            h(
              "button",
              {
                type: "button",
                "aria-label": previousButtonProps.value["aria-label"] ?? "Previous",
                disabled: Boolean(previousButtonProps.value.isDisabled),
                class: classNames("react-spectrum-Calendar-navButton"),
                onClick: () => previousButtonProps.value.onPress?.(),
                onFocus: () => prevFocusChange?.(true),
                onBlur: () => prevFocusChange?.(false),
              },
              "◀"
            ),
            h(
              "h2",
              {
                role: "heading",
                class: classNames("react-spectrum-Calendar-title"),
              },
              props.title
            ),
            h(
              "button",
              {
                type: "button",
                "aria-label": nextButtonProps.value["aria-label"] ?? "Next",
                disabled: Boolean(nextButtonProps.value.isDisabled),
                class: classNames("react-spectrum-Calendar-navButton"),
                onClick: () => nextButtonProps.value.onPress?.(),
                onFocus: () => nextFocusChange?.(true),
                onBlur: () => nextFocusChange?.(false),
              },
              "▶"
            ),
          ]),
          h(
            "div",
            {
              class: classNames("react-spectrum-Calendar-body"),
            },
            Array.from({ length: props.visibleMonths }, (_, monthIndex) =>
              renderMonth(monthIndex)
            )
          ),
        ]),
        props.description
          ? h(
              "div",
              {
                class: classNames("spectrum-FieldDescription"),
              },
              props.description
            )
          : null,
        props.errorMessage
          ? h(
              "div",
              mergeProps(props.errorMessageProps, {
                class: classNames("spectrum-FieldError"),
              }),
              props.errorMessage
            )
          : null,
      ]);
    };
  },
});
