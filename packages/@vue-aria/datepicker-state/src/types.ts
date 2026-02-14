import type {
  Calendar,
  CalendarIdentifier,
  DateFormatter,
  Time,
} from "@internationalized/date";
import type {
  DateValue,
  RangeValue,
  ValidationState,
} from "@vue-aria/calendar-state";
import type { FormValidationState } from "@vue-aria/form-state";
import type { OverlayTriggerProps, OverlayTriggerState } from "@vue-aria/overlays-state";

export type Granularity =
  | "year"
  | "month"
  | "day"
  | "hour"
  | "minute"
  | "second";

export type TimeValue = any;
export type DateRange = RangeValue<DateValue>;
export type MappedDateValue<T extends DateValue> = T;
export type MappedTimeValue<T extends TimeValue> = T;

export interface FieldOptions {
  year?: Intl.DateTimeFormatOptions["year"];
  month?: Intl.DateTimeFormatOptions["month"];
  day?: Intl.DateTimeFormatOptions["day"];
  hour?: Intl.DateTimeFormatOptions["hour"];
  minute?: Intl.DateTimeFormatOptions["minute"];
  second?: Intl.DateTimeFormatOptions["second"];
}

export interface FormatterOptions {
  timeZone?: string;
  hideTimeZone?: boolean;
  granularity?: Granularity;
  maxGranularity?: "year" | "month" | Granularity;
  hourCycle?: 12 | 24;
  showEra?: boolean;
  shouldForceLeadingZeros?: boolean;
}

export interface DatePickerProps<T extends DateValue = DateValue>
  extends OverlayTriggerProps {
  value?: T | null;
  defaultValue?: T | null;
  placeholderValue?: DateValue | null;
  onChange?: (value: T | null) => void;
  minValue?: DateValue | null;
  maxValue?: DateValue | null;
  isDateUnavailable?: (value: DateValue) => boolean;
  granularity?: Granularity;
  hideTimeZone?: boolean;
  hourCycle?: 12 | 24;
  shouldForceLeadingZeros?: boolean;
  validationState?: ValidationState | null;
  isInvalid?: boolean;
  validate?: ((value: T | null) => boolean | string | string[] | null | undefined) | undefined;
  validationBehavior?: "aria" | "native";
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  name?: string;
}

export interface DateRangePickerProps<T extends DateValue = DateValue>
  extends OverlayTriggerProps {
  value?: RangeValue<T> | null;
  defaultValue?: RangeValue<T> | null;
  placeholderValue?: DateValue | null;
  onChange?: (value: RangeValue<T> | null) => void;
  minValue?: DateValue | null;
  maxValue?: DateValue | null;
  isDateUnavailable?: (value: DateValue) => boolean;
  granularity?: Granularity;
  hideTimeZone?: boolean;
  hourCycle?: 12 | 24;
  shouldForceLeadingZeros?: boolean;
  validationState?: ValidationState | null;
  isInvalid?: boolean;
  validate?: ((value: RangeValue<T> | null) => boolean | string | string[] | null | undefined) | undefined;
  validationBehavior?: "aria" | "native";
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  startName?: string;
  endName?: string;
}

export interface TimePickerProps<T extends TimeValue = TimeValue> {
  value?: T | null;
  defaultValue?: T | null;
  placeholderValue?: TimeValue | null;
  onChange?: (value: MappedTimeValue<T> | null) => void;
  minValue?: TimeValue | null;
  maxValue?: TimeValue | null;
  granularity?: "hour" | "minute" | "second";
  hourCycle?: 12 | 24;
  shouldForceLeadingZeros?: boolean;
  validationState?: ValidationState | null;
  isInvalid?: boolean;
  validate?: ((value: T | null) => boolean | string | string[] | null | undefined) | undefined;
  validationBehavior?: "aria" | "native";
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  name?: string;
}

export type SegmentType =
  | "era"
  | "year"
  | "month"
  | "day"
  | "hour"
  | "minute"
  | "second"
  | "dayPeriod"
  | "literal"
  | "timeZoneName";

export interface DateSegment {
  type: SegmentType;
  text: string;
  value?: number | null;
  minValue?: number;
  maxValue?: number;
  isPlaceholder: boolean;
  placeholder: string;
  isEditable: boolean;
}

export interface DateFieldState extends FormValidationState {
  readonly value: DateValue | null;
  readonly defaultValue: DateValue | null;
  readonly dateValue: Date;
  readonly calendar: Calendar;
  setValue(value: DateValue | null): void;
  readonly segments: DateSegment[];
  readonly dateFormatter: DateFormatter;
  readonly validationState: ValidationState | null;
  readonly isInvalid: boolean;
  readonly granularity: Granularity;
  readonly maxGranularity: "year" | "month" | Granularity;
  readonly isDisabled: boolean;
  readonly isReadOnly: boolean;
  readonly isRequired: boolean;
  increment(type: SegmentType): void;
  decrement(type: SegmentType): void;
  incrementPage(type: SegmentType): void;
  decrementPage(type: SegmentType): void;
  incrementToMax(type: SegmentType): void;
  decrementToMin(type: SegmentType): void;
  setSegment(type: "era", value: string): void;
  setSegment(type: SegmentType, value: number): void;
  confirmPlaceholder(): void;
  clearSegment(type: SegmentType): void;
  formatValue(fieldOptions: FieldOptions): string;
  getDateFormatter(locale: string, formatOptions: FormatterOptions): DateFormatter;
}

export interface DateFieldStateOptions<T extends DateValue = DateValue>
  extends DatePickerProps<T> {
  maxGranularity?: "year" | "month" | Granularity;
  locale: string;
  createCalendar: (name: CalendarIdentifier) => Calendar;
}

export interface TimeFieldState extends DateFieldState {
  readonly timeValue: Time | null;
}

export interface TimeFieldStateOptions<T extends TimeValue = TimeValue>
  extends TimePickerProps<T> {
  locale: string;
}

export interface DatePickerState extends OverlayTriggerState, FormValidationState {
  readonly value: DateValue | null;
  readonly defaultValue: DateValue | null;
  setValue(value: DateValue | null): void;
  readonly dateValue: DateValue | null;
  setDateValue(value: DateValue): void;
  readonly timeValue: TimeValue | null;
  setTimeValue(value: TimeValue): void;
  readonly granularity: Granularity;
  readonly hasTime: boolean;
  readonly validationState: ValidationState | null;
  readonly isInvalid: boolean;
  formatValue(locale: string, fieldOptions: FieldOptions): string;
  getDateFormatter(locale: string, formatOptions: FormatterOptions): DateFormatter;
}

export interface DateRangePickerState
  extends OverlayTriggerState,
    FormValidationState {
  readonly value: RangeValue<DateValue | null>;
  readonly defaultValue: DateRange | null;
  setValue(value: DateRange | null): void;
  readonly dateRange: RangeValue<DateValue | null> | null;
  setDateRange(value: DateRange): void;
  readonly timeRange: RangeValue<TimeValue | null> | null;
  setTimeRange(value: RangeValue<TimeValue | null>): void;
  setDate(part: "start" | "end", value: DateValue | null): void;
  setTime(part: "start" | "end", value: TimeValue | null): void;
  setDateTime(part: "start" | "end", value: DateValue | null): void;
  readonly granularity: Granularity;
  readonly hasTime: boolean;
  readonly validationState: ValidationState | null;
  readonly isInvalid: boolean;
  formatValue(locale: string, fieldOptions: FieldOptions): { start: string; end: string } | null;
  getDateFormatter(locale: string, formatOptions: FormatterOptions): DateFormatter;
}

export interface DatePickerStateOptions<T extends DateValue = DateValue>
  extends DatePickerProps<T> {
  shouldCloseOnSelect?: boolean | (() => boolean);
}

export interface DateRangePickerStateOptions<T extends DateValue = DateValue>
  extends DateRangePickerProps<T> {
  shouldCloseOnSelect?: boolean | (() => boolean);
}
