import type {
  CalendarRangeValue,
  DateValue,
  DayOfWeek,
  PageBehavior,
  SelectionAlignment,
} from "@vue-aria/calendar-state";
import type { PropType } from "vue";

export interface SpectrumCalendarBaseProps {
  id?: string | undefined;
  label?: string | undefined;
  description?: string | undefined;
  errorMessage?: string | undefined;
  locale?: string | undefined;
  visibleMonths?: number | undefined;
  selectionAlignment?: SelectionAlignment | undefined;
  pageBehavior?: PageBehavior | undefined;
  minValue?: DateValue | null | undefined;
  maxValue?: DateValue | null | undefined;
  isDateUnavailable?: ((date: DateValue) => boolean) | undefined;
  firstDayOfWeek?: DayOfWeek | number | undefined;
  validationState?: "valid" | "invalid" | undefined;
  isInvalid?: boolean | undefined;
  isDisabled?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  autoFocus?: boolean | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  ariaDescribedby?: string | undefined;
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
  "aria-describedby"?: string | undefined;
  "aria-details"?: string | undefined;
  slot?: string | undefined;
  isHidden?: boolean | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export interface SpectrumCalendarProps extends SpectrumCalendarBaseProps {
  value?: DateValue | null | undefined;
  defaultValue?: DateValue | null | undefined;
  onChange?: ((value: DateValue | null) => void) | undefined;
}

export interface SpectrumRangeCalendarProps extends SpectrumCalendarBaseProps {
  value?: CalendarRangeValue<DateValue> | null | undefined;
  defaultValue?: CalendarRangeValue<DateValue> | null | undefined;
  onChange?: ((value: CalendarRangeValue<DateValue> | null) => void) | undefined;
  allowsNonContiguousRanges?: boolean | undefined;
}

export const calendarBasePropOptions = {
  id: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  label: {
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
  locale: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  visibleMonths: {
    type: Number as PropType<number | undefined>,
    default: undefined,
  },
  selectionAlignment: {
    type: String as PropType<SelectionAlignment | undefined>,
    default: undefined,
  },
  pageBehavior: {
    type: String as PropType<PageBehavior | undefined>,
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
  firstDayOfWeek: {
    type: [String, Number] as PropType<DayOfWeek | number | undefined>,
    default: undefined,
  },
  validationState: {
    type: String as PropType<"valid" | "invalid" | undefined>,
    default: undefined,
  },
  isInvalid: {
    type: Boolean as PropType<boolean | undefined>,
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
  autoFocus: {
    type: Boolean as PropType<boolean | undefined>,
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
  "aria-details": {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  slot: {
    type: String as PropType<string | undefined>,
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
} as const;

export const calendarPropOptions = {
  ...calendarBasePropOptions,
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
} as const;

export const rangeCalendarPropOptions = {
  ...calendarBasePropOptions,
  value: {
    type: Object as PropType<CalendarRangeValue<DateValue> | null | undefined>,
    default: undefined,
  },
  defaultValue: {
    type: Object as PropType<CalendarRangeValue<DateValue> | null | undefined>,
    default: undefined,
  },
  onChange: {
    type: Function as PropType<
      ((value: CalendarRangeValue<DateValue> | null) => void) | undefined
    >,
    default: undefined,
  },
  allowsNonContiguousRanges: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
} as const;
