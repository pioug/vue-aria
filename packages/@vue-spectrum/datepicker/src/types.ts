import type {
  DatePickerGranularity,
  TimeValue,
} from "@vue-aria/datepicker-state";
import type { DateValue, DayOfWeek, PageBehavior } from "@vue-aria/calendar-state";
import type { PropType } from "vue";

export interface SpectrumDateRangeValue<T = DateValue> {
  start?: T | null | undefined;
  end?: T | null | undefined;
}

export interface SpectrumDateFieldBaseProps {
  id?: string | undefined;
  label?: string | undefined;
  description?: string | undefined;
  errorMessage?: string | undefined;
  isDisabled?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  isRequired?: boolean | undefined;
  isInvalid?: boolean | undefined;
  validationState?: "valid" | "invalid" | undefined;
  autoFocus?: boolean | undefined;
  name?: string | undefined;
  form?: string | undefined;
  locale?: string | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  ariaDescribedby?: string | undefined;
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
  "aria-describedby"?: string | undefined;
  slot?: string | undefined;
  isHidden?: boolean | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export interface SpectrumDateFieldProps extends SpectrumDateFieldBaseProps {
  value?: DateValue | null | undefined;
  defaultValue?: DateValue | null | undefined;
  onChange?: ((value: DateValue | null) => void) | undefined;
  minValue?: DateValue | null | undefined;
  maxValue?: DateValue | null | undefined;
}

export interface SpectrumTimeFieldProps extends SpectrumDateFieldBaseProps {
  value?: TimeValue | null | undefined;
  defaultValue?: TimeValue | null | undefined;
  onChange?: ((value: TimeValue | null) => void) | undefined;
  granularity?: DatePickerGranularity | undefined;
}

export interface SpectrumDatePickerProps extends SpectrumDateFieldProps {
  isOpen?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((isOpen: boolean) => void) | undefined;
  shouldCloseOnSelect?: boolean | (() => boolean) | undefined;
  granularity?: DatePickerGranularity | undefined;
  placeholderValue?: DateValue | null | undefined;
  hideTimeZone?: boolean | undefined;
  hourCycle?: 12 | 24 | undefined;
  shouldForceLeadingZeros?: boolean | undefined;
  isDateUnavailable?: ((value: DateValue) => boolean) | undefined;
  firstDayOfWeek?: DayOfWeek | number | undefined;
  pageBehavior?: PageBehavior | undefined;
  calendarAriaLabel?: string | undefined;
  onFocus?: ((event: FocusEvent) => void) | undefined;
  onBlur?: ((event: FocusEvent) => void) | undefined;
  onFocusChange?: ((isFocused: boolean) => void) | undefined;
  onKeydown?: ((event: KeyboardEvent) => void) | undefined;
  onKeyup?: ((event: KeyboardEvent) => void) | undefined;
}

export interface SpectrumDateRangePickerProps extends SpectrumDateFieldBaseProps {
  value?: SpectrumDateRangeValue<DateValue> | null | undefined;
  defaultValue?: SpectrumDateRangeValue<DateValue> | null | undefined;
  onChange?: ((value: SpectrumDateRangeValue<DateValue> | null) => void) | undefined;
  minValue?: DateValue | null | undefined;
  maxValue?: DateValue | null | undefined;
  isOpen?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((isOpen: boolean) => void) | undefined;
  shouldCloseOnSelect?: boolean | (() => boolean) | undefined;
  granularity?: DatePickerGranularity | undefined;
  placeholderValue?: DateValue | null | undefined;
  hideTimeZone?: boolean | undefined;
  hourCycle?: 12 | 24 | undefined;
  shouldForceLeadingZeros?: boolean | undefined;
  firstDayOfWeek?: DayOfWeek | number | undefined;
  pageBehavior?: PageBehavior | undefined;
  isDateUnavailable?: ((value: DateValue) => boolean) | undefined;
  calendarAriaLabel?: string | undefined;
  allowsNonContiguousRanges?: boolean | undefined;
  startAriaLabel?: string | undefined;
  endAriaLabel?: string | undefined;
  startName?: string | undefined;
  endName?: string | undefined;
  onFocus?: ((event: FocusEvent) => void) | undefined;
  onBlur?: ((event: FocusEvent) => void) | undefined;
  onFocusChange?: ((isFocused: boolean) => void) | undefined;
  onKeydown?: ((event: KeyboardEvent) => void) | undefined;
  onKeyup?: ((event: KeyboardEvent) => void) | undefined;
}

export const dateFieldBasePropOptions = {
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
  isDisabled: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  isReadOnly: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  isRequired: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  isInvalid: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  validationState: {
    type: String as PropType<"valid" | "invalid" | undefined>,
    default: undefined,
  },
  autoFocus: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  name: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  form: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  locale: {
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

export const dateFieldPropOptions = {
  ...dateFieldBasePropOptions,
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
  minValue: {
    type: Object as PropType<DateValue | null | undefined>,
    default: undefined,
  },
  maxValue: {
    type: Object as PropType<DateValue | null | undefined>,
    default: undefined,
  },
} as const;

export const timeFieldPropOptions = {
  ...dateFieldBasePropOptions,
  value: {
    type: Object as PropType<TimeValue | null | undefined>,
    default: undefined,
  },
  defaultValue: {
    type: Object as PropType<TimeValue | null | undefined>,
    default: undefined,
  },
  onChange: {
    type: Function as PropType<((value: TimeValue | null) => void) | undefined>,
    default: undefined,
  },
  granularity: {
    type: String as PropType<DatePickerGranularity | undefined>,
    default: undefined,
  },
} as const;

export const datePickerPropOptions = {
  ...dateFieldPropOptions,
  isOpen: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  defaultOpen: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  onOpenChange: {
    type: Function as PropType<((isOpen: boolean) => void) | undefined>,
    default: undefined,
  },
  shouldCloseOnSelect: {
    type: [Boolean, Function] as PropType<boolean | (() => boolean) | undefined>,
    default: undefined,
  },
  granularity: {
    type: String as PropType<DatePickerGranularity | undefined>,
    default: undefined,
  },
  placeholderValue: {
    type: Object as PropType<DateValue | null | undefined>,
    default: undefined,
  },
  hideTimeZone: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  hourCycle: {
    type: Number as PropType<12 | 24 | undefined>,
    default: undefined,
  },
  shouldForceLeadingZeros: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  isDateUnavailable: {
    type: Function as PropType<((value: DateValue) => boolean) | undefined>,
    default: undefined,
  },
  firstDayOfWeek: {
    type: [String, Number] as PropType<DayOfWeek | number | undefined>,
    default: undefined,
  },
  pageBehavior: {
    type: String as PropType<PageBehavior | undefined>,
    default: undefined,
  },
  calendarAriaLabel: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  onFocus: {
    type: Function as PropType<((event: FocusEvent) => void) | undefined>,
    default: undefined,
  },
  onBlur: {
    type: Function as PropType<((event: FocusEvent) => void) | undefined>,
    default: undefined,
  },
  onFocusChange: {
    type: Function as PropType<((isFocused: boolean) => void) | undefined>,
    default: undefined,
  },
  onKeydown: {
    type: Function as PropType<((event: KeyboardEvent) => void) | undefined>,
    default: undefined,
  },
  onKeyup: {
    type: Function as PropType<((event: KeyboardEvent) => void) | undefined>,
    default: undefined,
  },
} as const;

export const dateRangePickerPropOptions = {
  ...dateFieldBasePropOptions,
  value: {
    type: Object as PropType<SpectrumDateRangeValue<DateValue> | null | undefined>,
    default: undefined,
  },
  defaultValue: {
    type: Object as PropType<SpectrumDateRangeValue<DateValue> | null | undefined>,
    default: undefined,
  },
  onChange: {
    type: Function as PropType<
      ((value: SpectrumDateRangeValue<DateValue> | null) => void) | undefined
    >,
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
  isOpen: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  defaultOpen: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  onOpenChange: {
    type: Function as PropType<((isOpen: boolean) => void) | undefined>,
    default: undefined,
  },
  shouldCloseOnSelect: {
    type: [Boolean, Function] as PropType<boolean | (() => boolean) | undefined>,
    default: undefined,
  },
  granularity: {
    type: String as PropType<DatePickerGranularity | undefined>,
    default: undefined,
  },
  placeholderValue: {
    type: Object as PropType<DateValue | null | undefined>,
    default: undefined,
  },
  hideTimeZone: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  hourCycle: {
    type: Number as PropType<12 | 24 | undefined>,
    default: undefined,
  },
  shouldForceLeadingZeros: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  firstDayOfWeek: {
    type: [String, Number] as PropType<DayOfWeek | number | undefined>,
    default: undefined,
  },
  pageBehavior: {
    type: String as PropType<PageBehavior | undefined>,
    default: undefined,
  },
  isDateUnavailable: {
    type: Function as PropType<((value: DateValue) => boolean) | undefined>,
    default: undefined,
  },
  calendarAriaLabel: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  allowsNonContiguousRanges: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  startAriaLabel: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  endAriaLabel: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  startName: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  endName: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  onFocus: {
    type: Function as PropType<((event: FocusEvent) => void) | undefined>,
    default: undefined,
  },
  onBlur: {
    type: Function as PropType<((event: FocusEvent) => void) | undefined>,
    default: undefined,
  },
  onFocusChange: {
    type: Function as PropType<((isFocused: boolean) => void) | undefined>,
    default: undefined,
  },
  onKeydown: {
    type: Function as PropType<((event: KeyboardEvent) => void) | undefined>,
    default: undefined,
  },
  onKeyup: {
    type: Function as PropType<((event: KeyboardEvent) => void) | undefined>,
    default: undefined,
  },
} as const;
