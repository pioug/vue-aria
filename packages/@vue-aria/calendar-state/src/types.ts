import type {
  Calendar,
  CalendarIdentifier,
  DateDuration,
} from "@internationalized/date";

export type DateValue = any;
export type CalendarDateLike = any;

export type MappedDateValue<T extends DateValue> = T;

export type ValidationState = "valid" | "invalid";

export type CalendarPageBehavior = "visible" | "single";

export type CalendarSelectionAlignment = "start" | "center" | "end";

export type FirstDayOfWeek =
  | "sun"
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat";

export interface RangeValue<T> {
  start: T;
  end: T;
}

export interface CalendarPropsBase {
  isDisabled?: boolean;
  isReadOnly?: boolean;
  minValue?: DateValue | null;
  maxValue?: DateValue | null;
  isDateUnavailable?: (date: CalendarDateLike) => boolean;
  autoFocus?: boolean;
  isInvalid?: boolean;
  validationState?: ValidationState | null;
  firstDayOfWeek?: FirstDayOfWeek;
  pageBehavior?: CalendarPageBehavior;
}

export interface CalendarProps<T extends DateValue = DateValue>
  extends CalendarPropsBase {
  value?: T | null;
  defaultValue?: T | null;
  onChange?: (value: MappedDateValue<T> | null) => void;
  focusedValue?: DateValue;
  defaultFocusedValue?: DateValue;
  onFocusChange?: (value: CalendarDateLike) => void;
}

export interface RangeCalendarProps<T extends DateValue = DateValue>
  extends CalendarPropsBase {
  value?: RangeValue<T> | null;
  defaultValue?: RangeValue<T> | null;
  onChange?: (value: RangeValue<MappedDateValue<T>> | null) => void;
  focusedValue?: DateValue;
  defaultFocusedValue?: DateValue;
  onFocusChange?: (value: CalendarDateLike) => void;
  allowsNonContiguousRanges?: boolean;
}

export interface CalendarStateBase {
  readonly isDisabled: boolean;
  readonly isReadOnly: boolean;
  readonly visibleRange: RangeValue<CalendarDateLike>;
  readonly minValue?: DateValue | null;
  readonly maxValue?: DateValue | null;
  readonly timeZone: string;
  readonly validationState: ValidationState | null;
  readonly isValueInvalid: boolean;
  readonly focusedDate: CalendarDateLike;
  setFocusedDate(value: CalendarDateLike): void;
  focusNextDay(): void;
  focusPreviousDay(): void;
  focusNextRow(): void;
  focusPreviousRow(): void;
  focusNextPage(): void;
  focusPreviousPage(): void;
  focusSectionStart(): void;
  focusSectionEnd(): void;
  focusNextSection(larger?: boolean): void;
  focusPreviousSection(larger?: boolean): void;
  selectFocusedDate(): void;
  selectDate(date: CalendarDateLike): void;
  readonly isFocused: boolean;
  setFocused(value: boolean): void;
  isInvalid(date: CalendarDateLike): boolean;
  isSelected(date: CalendarDateLike): boolean;
  isCellFocused(date: CalendarDateLike): boolean;
  isCellDisabled(date: CalendarDateLike): boolean;
  isCellUnavailable(date: CalendarDateLike): boolean;
  isPreviousVisibleRangeInvalid(): boolean;
  isNextVisibleRangeInvalid(): boolean;
  getDatesInWeek(weekIndex: number, startDate?: CalendarDateLike): Array<CalendarDateLike | null>;
}

export interface CalendarState extends CalendarStateBase {
  readonly value: CalendarDateLike | null;
  setValue(value: CalendarDateLike | null): void;
}

export interface RangeCalendarState<T extends DateValue = DateValue>
  extends CalendarStateBase {
  readonly value: RangeValue<T> | null;
  setValue(value: RangeValue<T> | null): void;
  highlightDate(date: CalendarDateLike): void;
  readonly anchorDate: CalendarDateLike | null;
  setAnchorDate(date: CalendarDateLike | null): void;
  readonly highlightedRange: RangeValue<CalendarDateLike> | null;
  readonly isDragging: boolean;
  setDragging(isDragging: boolean): void;
}

export interface CalendarStateOptions<T extends DateValue = DateValue>
  extends CalendarProps<T> {
  locale: string;
  createCalendar: (name: CalendarIdentifier) => Calendar;
  visibleDuration?: DateDuration;
  selectionAlignment?: CalendarSelectionAlignment;
}

export interface RangeCalendarStateOptions<T extends DateValue = DateValue>
  extends RangeCalendarProps<T> {
  locale: string;
  createCalendar: (name: CalendarIdentifier) => Calendar;
  visibleDuration?: DateDuration;
  selectionAlignment?: CalendarSelectionAlignment;
}
