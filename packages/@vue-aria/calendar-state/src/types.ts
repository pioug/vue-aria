import type {
  AnyCalendarDate,
  Calendar,
  CalendarIdentifier,
  DateDuration,
} from "@internationalized/date";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";

export type DayOfWeek = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
export interface DateValue {
  readonly calendar: Calendar;
  readonly era: string;
  readonly year: number;
  readonly month: number;
  readonly day: number;
  add: (duration: DateDuration) => DateValue;
  subtract: (duration: DateDuration) => DateValue;
  compare: (other: AnyCalendarDate) => number;
  toDate: (timeZone: string) => Date;
  toString: () => string;
  copy: () => DateValue;
  set?: (fields: {
    era?: string;
    year?: number;
    month?: number;
    day?: number;
    hour?: number;
    minute?: number;
    second?: number;
    millisecond?: number;
  }) => DateValue;
  hour?: number;
  minute?: number;
  second?: number;
  millisecond?: number;
  timeZone?: string;
}
export type SelectionAlignment = "start" | "center" | "end";
export type PageBehavior = "single" | "visible";

export interface CalendarRangeValue<T extends DateValue = DateValue> {
  start: T;
  end: T;
}

export interface UseCalendarStateOptions<T extends DateValue = DateValue> {
  locale?: MaybeReactive<string | undefined>;
  createCalendar?: (name: CalendarIdentifier) => Calendar;
  visibleDuration?: MaybeReactive<DateDuration | undefined>;
  selectionAlignment?: MaybeReactive<SelectionAlignment | undefined>;
  pageBehavior?: MaybeReactive<PageBehavior | undefined>;
  value?: MaybeReactive<T | null | undefined>;
  defaultValue?: MaybeReactive<T | null | undefined>;
  onChange?: (value: T | null) => void;
  focusedValue?: MaybeReactive<T | undefined>;
  defaultFocusedValue?: MaybeReactive<T | undefined>;
  onFocusChange?: (value: DateValue) => void;
  minValue?: MaybeReactive<T | null | undefined>;
  maxValue?: MaybeReactive<T | null | undefined>;
  isDateUnavailable?: (date: DateValue) => boolean;
  firstDayOfWeek?: MaybeReactive<DayOfWeek | number | undefined>;
  validationState?: MaybeReactive<"valid" | "invalid" | undefined>;
  isInvalid?: MaybeReactive<boolean | undefined>;
  isDisabled?: MaybeReactive<boolean | undefined>;
  isReadOnly?: MaybeReactive<boolean | undefined>;
  autoFocus?: MaybeReactive<boolean | undefined>;
}

export interface UseCalendarStateResult {
  isDisabled: ReadonlyRef<boolean>;
  isReadOnly: ReadonlyRef<boolean>;
  value: ReadonlyRef<DateValue | null>;
  setValue: (value: DateValue | null) => void;
  visibleRange: ReadonlyRef<CalendarRangeValue<DateValue>>;
  minValue: ReadonlyRef<DateValue | null>;
  maxValue: ReadonlyRef<DateValue | null>;
  focusedDate: ReadonlyRef<DateValue>;
  timeZone: ReadonlyRef<string>;
  validationState: ReadonlyRef<"invalid" | null>;
  isValueInvalid: ReadonlyRef<boolean>;
  setFocusedDate: (value: DateValue) => void;
  focusNextDay: () => void;
  focusPreviousDay: () => void;
  focusNextRow: () => void;
  focusPreviousRow: () => void;
  focusNextPage: () => void;
  focusPreviousPage: () => void;
  focusSectionStart: () => void;
  focusSectionEnd: () => void;
  focusNextSection: (larger?: boolean) => void;
  focusPreviousSection: (larger?: boolean) => void;
  selectFocusedDate: () => void;
  selectDate: (date: DateValue) => void;
  isFocused: ReadonlyRef<boolean>;
  setFocused: (isFocused: boolean) => void;
  isInvalid: (date: DateValue) => boolean;
  isSelected: (date: DateValue) => boolean;
  isCellFocused: (date: DateValue) => boolean;
  isCellDisabled: (date: DateValue) => boolean;
  isCellUnavailable: (date: DateValue) => boolean;
  isPreviousVisibleRangeInvalid: () => boolean;
  isNextVisibleRangeInvalid: () => boolean;
  getDatesInWeek: (weekIndex: number, startDate?: DateValue) => Array<DateValue | null>;
}

export interface UseRangeCalendarStateOptions<T extends DateValue = DateValue>
  extends Omit<
    UseCalendarStateOptions<T>,
    "value" | "defaultValue" | "onChange"
  > {
  value?: MaybeReactive<CalendarRangeValue<T> | null | undefined>;
  defaultValue?: MaybeReactive<CalendarRangeValue<T> | null | undefined>;
  onChange?: (value: CalendarRangeValue<T> | null) => void;
  allowsNonContiguousRanges?: MaybeReactive<boolean | undefined>;
}

export interface UseRangeCalendarStateResult<T extends DateValue = DateValue>
  extends Omit<UseCalendarStateResult, "value" | "setValue" | "selectDate" | "selectFocusedDate"> {
  value: ReadonlyRef<CalendarRangeValue<T> | null>;
  setValue: (value: CalendarRangeValue<T> | null) => void;
  anchorDate: ReadonlyRef<DateValue | null>;
  setAnchorDate: (date: DateValue | null) => void;
  highlightedRange: ReadonlyRef<CalendarRangeValue<DateValue> | null>;
  selectFocusedDate: () => void;
  selectDate: (date: DateValue) => void;
  highlightDate: (date: DateValue) => void;
  isDragging: ReadonlyRef<boolean>;
  setDragging: (isDragging: boolean) => void;
}
