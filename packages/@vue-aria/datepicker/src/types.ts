import type { DateValue as CalendarDateValue, RangeValue } from "@vue-aria/calendar-state";
import type {
  DatePickerProps,
  DateRangePickerProps,
  TimePickerProps,
  TimeValue as PickerTimeValue,
} from "@vue-aria/datepicker-state";
import type { ValidationResult } from "@vue-aria/form-state";

export type RefObject<T> = { current: T | null };
export type DOMAttributes = Record<string, unknown>;
export type GroupDOMAttributes = Record<string, unknown>;

type ErrorMessageLike =
  | string
  | ((validation: ValidationResult) => string);

interface AriaBaseProps {
  id?: string;
  label?: string;
  description?: string;
  errorMessage?: ErrorMessageLike;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onFocusChange?: (isFocused: boolean) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
  autoFocus?: boolean;
  form?: string;
  [key: string]: unknown;
}

export type DateValue = CalendarDateValue;
export type DateRange = RangeValue<DateValue>;
export type TimeValue = PickerTimeValue;

export interface AriaDatePickerProps<T extends DateValue = DateValue>
  extends DatePickerProps<T>,
    AriaBaseProps {}

export interface AriaDateRangePickerProps<T extends DateValue = DateValue>
  extends DateRangePickerProps<T>,
    AriaBaseProps {}

export interface AriaDateFieldProps<T extends DateValue = DateValue>
  extends DatePickerProps<T>,
    AriaBaseProps {}

export interface AriaTimeFieldProps<T extends TimeValue = TimeValue>
  extends TimePickerProps<T>,
    AriaBaseProps {}
