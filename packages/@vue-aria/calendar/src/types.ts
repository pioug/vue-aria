import type { MaybeReactive } from "@vue-aria/types";

export interface CalendarDateLike {
  toString: () => string;
  compare?: (other: CalendarDateLike) => number;
  add?: (duration: { days?: number }) => CalendarDateLike;
  subtract?: (duration: { days?: number }) => CalendarDateLike;
  day?: number;
}

export interface CalendarVisibleRange {
  start: CalendarDateLike;
  end: CalendarDateLike;
}

export interface CalendarRangeValue {
  start: CalendarDateLike;
  end: CalendarDateLike;
}

export interface CalendarHookData {
  ariaLabel?: string;
  ariaLabelledBy?: string;
  errorMessageId?: string;
  selectedDateDescription?: string;
}

export interface UseCalendarBaseOptions {
  id?: MaybeReactive<string | undefined>;
  isDisabled?: MaybeReactive<boolean | undefined>;
  isInvalid?: MaybeReactive<boolean | undefined>;
  validationState?: MaybeReactive<"valid" | "invalid" | undefined>;
  errorMessage?: MaybeReactive<string | undefined>;
  "aria-label"?: MaybeReactive<string | undefined>;
  "aria-labelledby"?: MaybeReactive<string | undefined>;
  "aria-describedby"?: MaybeReactive<string | undefined>;
  "aria-details"?: MaybeReactive<string | undefined>;
  class?: MaybeReactive<string | undefined>;
  style?: MaybeReactive<Record<string, unknown> | string | undefined>;
  [key: string]: unknown;
}

export interface UseCalendarBaseState {
  visibleRange: MaybeReactive<CalendarVisibleRange>;
  timeZone?: MaybeReactive<string | undefined>;
  isFocused?: MaybeReactive<boolean | undefined>;
  value?: MaybeReactive<CalendarDateLike | CalendarRangeValue | null | undefined>;
  highlightedRange?: MaybeReactive<CalendarRangeValue | null | undefined>;
  isNextVisibleRangeInvalid: () => boolean;
  isPreviousVisibleRangeInvalid: () => boolean;
  focusNextPage: () => void;
  focusPreviousPage: () => void;
  setFocused: (isFocused: boolean) => void;
}

export interface UseCalendarState extends UseCalendarBaseState {
  focusedDate: MaybeReactive<CalendarDateLike>;
  minValue?: MaybeReactive<CalendarDateLike | undefined>;
  maxValue?: MaybeReactive<CalendarDateLike | undefined>;
  isReadOnly?: MaybeReactive<boolean | undefined>;
  isDragging?: MaybeReactive<boolean | undefined>;
  anchorDate?: MaybeReactive<CalendarDateLike | null | undefined>;
  highlightedRange?: MaybeReactive<CalendarRangeValue | null | undefined>;
  isValueInvalid?: MaybeReactive<boolean | undefined>;
  isSelected: (date: CalendarDateLike) => boolean;
  isCellFocused: (date: CalendarDateLike) => boolean;
  isCellDisabled: (date: CalendarDateLike) => boolean;
  isCellUnavailable: (date: CalendarDateLike) => boolean;
  selectDate: (date: CalendarDateLike) => void;
  setFocusedDate: (date: CalendarDateLike) => void;
  highlightDate?: (date: CalendarDateLike) => void;
  setAnchorDate?: (date: CalendarDateLike | null) => void;
  setDragging?: (isDragging: boolean) => void;
  selectFocusedDate?: () => void;
  isInvalid?: (date: CalendarDateLike) => boolean;
}

export interface UseRangeCalendarState extends UseCalendarBaseState {
  anchorDate?: MaybeReactive<CalendarDateLike | null | undefined>;
  isDragging?: MaybeReactive<boolean | undefined>;
  selectFocusedDate?: () => void;
  setDragging?: (isDragging: boolean) => void;
}
