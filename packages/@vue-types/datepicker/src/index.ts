import type {
  CalendarDate,
  CalendarDateTime,
  CalendarIdentifier,
  Calendar as ICalendar,
  Time,
  ZonedDateTime
} from "@internationalized/date";

import type { AriaLabelingProps, DOMProps, FocusableProps, HelpTextProps, InputBase, InputDOMProps, LabelableProps, RangeValue, SpectrumFieldValidation, SpectrumLabelableProps, StyleProps, Validation, ValueBase } from "@vue-types/shared";
import type { OverlayTriggerProps } from "@vue-types/overlays";
import type { PageBehavior, DateValue } from "@vue-types/calendar";

export type MappedDateValue<T> =
  T extends ZonedDateTime ? ZonedDateTime :
  T extends CalendarDateTime ? CalendarDateTime :
  T extends CalendarDate ? CalendarDate :
  never;

export type Granularity = "day" | "hour" | "minute" | "second";

interface DateFieldBase<T extends DateValue> extends InputBase, Validation<MappedDateValue<T>>, FocusableProps, LabelableProps, HelpTextProps {
  minValue?: DateValue | null;
  maxValue?: DateValue | null;
  isDateUnavailable?: (date: DateValue) => boolean;
  placeholderValue?: T | null;
  hourCycle?: 12 | 24;
  granularity?: Granularity;
  hideTimeZone?: boolean;
  shouldForceLeadingZeros?: boolean;
}

interface AriaDateFieldBaseProps<T extends DateValue> extends DateFieldBase<T>, AriaLabelingProps, DOMProps {}

export interface DateFieldProps<T extends DateValue> extends DateFieldBase<T>, ValueBase<T | null, MappedDateValue<T> | null> {}

export interface AriaDateFieldProps<T extends DateValue> extends DateFieldProps<T>, AriaDateFieldBaseProps<T>, InputDOMProps {
  autoComplete?: string;
}

interface DatePickerBase<T extends DateValue> extends DateFieldBase<T>, OverlayTriggerProps {
  pageBehavior?: PageBehavior;
  firstDayOfWeek?: "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
}

export interface AriaDatePickerBaseProps<T extends DateValue> extends DatePickerBase<T>, AriaLabelingProps, InputDOMProps, DOMProps {}

export interface DatePickerProps<T extends DateValue> extends DatePickerBase<T>, ValueBase<T | null, MappedDateValue<T> | null> {}

export interface AriaDatePickerProps<T extends DateValue> extends DatePickerProps<T>, AriaDatePickerBaseProps<T>, InputDOMProps {
  autoComplete?: string;
}

export type DateRange = RangeValue<DateValue>;

export interface DateRangePickerProps<T extends DateValue> extends Omit<DatePickerBase<T>, "validate">, Validation<RangeValue<MappedDateValue<T>>>, ValueBase<RangeValue<T> | null, RangeValue<MappedDateValue<T>> | null> {
  allowsNonContiguousRanges?: boolean;
  startName?: string;
  endName?: string;
}

export interface AriaDateRangePickerProps<T extends DateValue> extends Omit<AriaDatePickerBaseProps<T>, "validate" | "name">, DateRangePickerProps<T> {}

interface SpectrumDateFieldBase<T extends DateValue> extends SpectrumLabelableProps, HelpTextProps, SpectrumFieldValidation<MappedDateValue<T>>, StyleProps {
  isQuiet?: boolean;
  showFormatHelpText?: boolean;
}

interface SpectrumDatePickerBase<T extends DateValue> extends SpectrumDateFieldBase<T>, SpectrumLabelableProps, StyleProps {
  maxVisibleMonths?: number;
  shouldFlip?: boolean;
  createCalendar?: (identifier: CalendarIdentifier) => ICalendar;
}

export interface SpectrumDatePickerProps<T extends DateValue> extends Omit<AriaDatePickerProps<T>, "isInvalid" | "validationState" | "autoComplete">, SpectrumDatePickerBase<T> {}

export interface SpectrumDateRangePickerProps<T extends DateValue> extends Omit<AriaDateRangePickerProps<T>, "isInvalid" | "validationState">, Omit<SpectrumDatePickerBase<T>, "validate"> {}

export interface SpectrumDateFieldProps<T extends DateValue> extends Omit<AriaDateFieldProps<T>, "isInvalid" | "validationState" | "autoComplete">, SpectrumDateFieldBase<T> {}

export type TimeValue = Time | CalendarDateTime | ZonedDateTime;

export type MappedTimeValue<T> =
  T extends ZonedDateTime ? ZonedDateTime :
  T extends CalendarDateTime ? CalendarDateTime :
  T extends Time ? Time :
  never;

export interface TimePickerProps<T extends TimeValue> extends InputBase, Validation<MappedTimeValue<T>>, FocusableProps, LabelableProps, HelpTextProps, ValueBase<T | null, MappedTimeValue<T> | null> {
  hourCycle?: 12 | 24;
  granularity?: "hour" | "minute" | "second";
  hideTimeZone?: boolean;
  shouldForceLeadingZeros?: boolean;
  placeholderValue?: T;
  minValue?: TimeValue | null;
  maxValue?: TimeValue | null;
}

export interface AriaTimeFieldProps<T extends TimeValue> extends TimePickerProps<T>, AriaLabelingProps, DOMProps, InputDOMProps {}

export interface SpectrumTimeFieldProps<T extends TimeValue> extends Omit<AriaTimeFieldProps<T>, "isInvalid" | "validationState">, SpectrumFieldValidation<MappedTimeValue<T>>, SpectrumLabelableProps, StyleProps, InputDOMProps {
  isQuiet?: boolean;
}

export type SpectrumTimePickerProps<T extends TimeValue> = SpectrumTimeFieldProps<T>;
