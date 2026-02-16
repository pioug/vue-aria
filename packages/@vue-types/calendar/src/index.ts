import type { CalendarDate, CalendarDateTime, CalendarIdentifier, Calendar as ICalendar, ZonedDateTime } from "@internationalized/date";

import type {
  AriaLabelingProps,
  DOMProps,
  RangeValue,
  StyleProps,
  ValidationState,
  ValueBase
} from "@vue-types/shared";

export type DateValue = CalendarDate | CalendarDateTime | ZonedDateTime;

type MappedDateValue<T> =
  T extends ZonedDateTime ? ZonedDateTime :
  T extends CalendarDateTime ? CalendarDateTime :
  T extends CalendarDate ? CalendarDate :
  never;

export interface CalendarPropsBase {
  /** The minimum allowed date that a user may select. */
  minValue?: DateValue | null,
  /** The maximum allowed date that a user may select. */
  maxValue?: DateValue | null,
  /** Callback that is called for each date of the calendar. If it returns true, then the date is unavailable. */
  isDateUnavailable?: (date: DateValue) => boolean,
  /**
   * Whether the calendar is disabled.
   * @default false
   */
  isDisabled?: boolean,
  /**
   * Whether the calendar value is immutable.
   * @default false
   */
  isReadOnly?: boolean,
  /**
   * Whether to automatically focus the calendar when it mounts.
   * @default false
   */
  autoFocus?: boolean,
  /** Controls the currently focused date within the calendar. */
  focusedValue?: DateValue | null,
  /** The date that is focused when the calendar first mounts (uncontrolled). */
  defaultFocusedValue?: DateValue | null,
  /** Handler that is called when the focused date changes. */
  onFocusChange?: (date: CalendarDate) => void,
  /**
   * Whether the current selection is valid or invalid according to application logic.
   * @deprecated Use `isInvalid` instead.
   */
  validationState?: ValidationState,
  /** Whether the current selection is invalid according to application logic. */
  isInvalid?: boolean,
  /** An error message to display when the selected value is invalid. */
  errorMessage?: string,
  /**
   * Controls the behavior of paging.
   * @default visible
   */
  pageBehavior?: PageBehavior,
  /**
   * The day that starts the week.
   */
  firstDayOfWeek?: "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat",
  /**
   * Determines the alignment of the visible months on initial render.
   * @default 'center'
   */
  selectionAlignment?: "start" | "center" | "end"
}

export type DateRange = RangeValue<DateValue> | null;
export interface CalendarProps<T extends DateValue> extends CalendarPropsBase, ValueBase<T | null, MappedDateValue<T>> {}
export interface RangeCalendarProps<T extends DateValue> extends CalendarPropsBase, ValueBase<RangeValue<T> | null, RangeValue<MappedDateValue<T>>> {
  /**
   * When combined with `isDateUnavailable`, determines whether non-contiguous ranges,
   * i.e. ranges containing unavailable dates, may be selected.
   */
  allowsNonContiguousRanges?: boolean
}

export interface AriaCalendarProps<T extends DateValue> extends CalendarProps<T>, DOMProps, AriaLabelingProps {}

export interface AriaRangeCalendarProps<T extends DateValue> extends RangeCalendarProps<T>, DOMProps, AriaLabelingProps {}

export type PageBehavior = "single" | "visible";

export interface SpectrumCalendarProps<T extends DateValue> extends AriaCalendarProps<T>, StyleProps {
  /**
   * The number of months to display at once. Up to 3 months are supported.
   * @default 1
   */
  visibleMonths?: number,

  /**
   * A function to create a new Calendar object for a given calendar identifier.
   */
  createCalendar?: (identifier: CalendarIdentifier) => ICalendar
}

export interface SpectrumRangeCalendarProps<T extends DateValue> extends AriaRangeCalendarProps<T>, StyleProps {
  /**
   * The number of months to display at once. Up to 3 months are supported.
   * @default 1
   */
  visibleMonths?: number,

  /**
   * A function to create a new Calendar object for a given calendar identifier.
   */
  createCalendar?: (identifier: CalendarIdentifier) => ICalendar
}
