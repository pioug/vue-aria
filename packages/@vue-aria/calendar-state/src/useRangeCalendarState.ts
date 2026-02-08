import { computed, ref, shallowRef, toValue, watch } from "vue";
import { isSameDay } from "@internationalized/date";
import { useCalendarState } from "./useCalendarState";
import type {
  CalendarRangeValue,
  DateValue,
  UseRangeCalendarStateOptions,
  UseRangeCalendarStateResult,
} from "./types";
import {
  constrainDateValue,
  convertDateValue,
  isDateInvalid,
  maxBound,
  minBound,
  previousAvailableDate,
  resolveBoolean,
  resolveRangeValue,
  toDisplayDate,
} from "./utils";

function makeRange(
  start: DateValue | null | undefined,
  end: DateValue | null | undefined
): CalendarRangeValue<DateValue> | null {
  if (!start || !end) {
    return null;
  }

  let startDate = toDisplayDate(start, start.calendar);
  let endDate = toDisplayDate(end, end.calendar);

  if (!startDate || !endDate) {
    return null;
  }

  if (endDate.compare(startDate) < 0) {
    [startDate, endDate] = [endDate, startDate];
  }

  return {
    start: startDate,
    end: endDate,
  };
}

function nextUnavailableDate(
  anchorDate: DateValue,
  state: ReturnType<typeof useCalendarState>,
  direction: 1 | -1
): DateValue | undefined {
  let nextDate = anchorDate.add({ days: direction });
  const visibleRange = state.visibleRange.value;

  while (
    (direction < 0
      ? nextDate.compare(visibleRange.start) >= 0
      : nextDate.compare(visibleRange.end) <= 0) &&
    !state.isCellUnavailable(nextDate)
  ) {
    nextDate = nextDate.add({ days: direction });
  }

  if (state.isCellUnavailable(nextDate)) {
    return nextDate.add({ days: -direction });
  }

  return undefined;
}

export function useRangeCalendarState<TValue extends DateValue = DateValue>(
  options: UseRangeCalendarStateOptions<TValue> = {}
): UseRangeCalendarStateResult<TValue> {
  const uncontrolledValue = shallowRef<CalendarRangeValue<TValue> | null>(
    resolveRangeValue(options.defaultValue) as CalendarRangeValue<TValue> | null
  );
  const isValueControlled = computed(() => options.value !== undefined);
  const getRawValue = (): CalendarRangeValue<TValue> | null => {
    if (isValueControlled.value) {
      return resolveRangeValue(options.value) as CalendarRangeValue<TValue> | null;
    }

    return uncontrolledValue.value;
  };

  const anchorDate = ref<DateValue | null>(null);
  const isDragging = ref(false);
  const allowsNonContiguousRanges = computed(() =>
    resolveBoolean(options.allowsNonContiguousRanges)
  );

  const availableRange = ref<Partial<CalendarRangeValue<DateValue>> | null>(null);

  const selectionStart = computed<TValue | null>(
    () => (getRawValue()?.start as TValue | undefined) ?? null
  );

  const calendar = useCalendarState<TValue>({
    locale: options.locale,
    createCalendar: options.createCalendar,
    visibleDuration: options.visibleDuration,
    selectionAlignment: options.selectionAlignment,
    pageBehavior: options.pageBehavior,
    value: selectionStart,
    focusedValue: options.focusedValue,
    defaultFocusedValue: options.defaultFocusedValue,
    onFocusChange: options.onFocusChange,
    minValue: options.minValue,
    maxValue: options.maxValue,
    isDateUnavailable: options.isDateUnavailable,
    firstDayOfWeek: options.firstDayOfWeek,
    validationState: options.validationState,
    isInvalid: options.isInvalid,
    isDisabled: options.isDisabled,
    isReadOnly: options.isReadOnly,
    autoFocus: options.autoFocus,
  });

  const calendarCalendar = computed(() => calendar.focusedDate.value.calendar);

  const displayedValue = computed<CalendarRangeValue<TValue> | null>(() => getRawValue());
  const highlightedRange = computed<CalendarRangeValue<DateValue> | null>(() => {
    if (anchorDate.value) {
      return makeRange(anchorDate.value, calendar.focusedDate.value);
    }

    const currentValue = getRawValue();
    if (!currentValue) {
      return null;
    }

    return makeRange(
      toDisplayDate(currentValue.start, calendarCalendar.value),
      toDisplayDate(currentValue.end, calendarCalendar.value)
    );
  });

  const updateAvailableRange = (date: DateValue | null): void => {
    if (!date || !options.isDateUnavailable || allowsNonContiguousRanges.value) {
      availableRange.value = null;
      return;
    }

    availableRange.value = {
      start: nextUnavailableDate(date, calendar, -1),
      end: nextUnavailableDate(date, calendar, 1),
    };
  };

  const setAnchorDate = (date: DateValue | null): void => {
    anchorDate.value = date;
    updateAvailableRange(date);
  };

  watch(
    () => calendar.visibleRange.value,
    (nextRange, previousRange) => {
      if (!anchorDate.value || !previousRange) {
        return;
      }

      if (
        !isSameDay(nextRange.start as never, previousRange.start as never) ||
        !isSameDay(nextRange.end as never, previousRange.end as never)
      ) {
        updateAvailableRange(anchorDate.value);
      }
    }
  );

  const setValue = (nextValue: CalendarRangeValue<TValue> | null): void => {
    if (!isValueControlled.value) {
      uncontrolledValue.value = nextValue;
    }

    options.onChange?.(nextValue);
  };

  const selectDate = (date: DateValue): void => {
    if (calendar.isReadOnly.value) {
      return;
    }

    const minValue = maxBound(calendar.minValue.value, availableRange.value?.start ?? null);
    const maxValue = minBound(calendar.maxValue.value, availableRange.value?.end ?? null);
    const constrained = constrainDateValue(
      date,
      minValue,
      maxValue
    );
    const availableDate = previousAvailableDate(
      constrained,
      calendar.visibleRange.value.start,
      options.isDateUnavailable
    );
    if (!availableDate) {
      return;
    }

    if (!anchorDate.value) {
      setAnchorDate(availableDate);
      return;
    }

    const range = makeRange(anchorDate.value, availableDate);
    if (range) {
      const previousValue = getRawValue();
      setValue({
        start: convertDateValue(range.start, previousValue?.start) as TValue,
        end: convertDateValue(range.end, previousValue?.end) as TValue,
      });
    }
    setAnchorDate(null);
  };

  const selectFocusedDate = (): void => {
    selectDate(calendar.focusedDate.value);
  };

  const highlightDate = (date: DateValue): void => {
    if (!anchorDate.value) {
      return;
    }

    calendar.setFocusedDate(date);
  };

  const setDragging = (nextDragging: boolean): void => {
    isDragging.value = nextDragging;
  };

  const optionMinValue = computed(() =>
    toDisplayDate(
      options.minValue === undefined ? null : toValue(options.minValue),
      calendarCalendar.value
    )
  );
  const optionMaxValue = computed(() =>
    toDisplayDate(
      options.maxValue === undefined ? null : toValue(options.maxValue),
      calendarCalendar.value
    )
  );

  const isInvalidSelection = computed(() => {
    const current = getRawValue();
    if (!current || anchorDate.value) {
      return false;
    }

    const start = toDisplayDate(current.start, calendarCalendar.value);
    const end = toDisplayDate(current.end, calendarCalendar.value);
    if (!start || !end) {
      return false;
    }

    if (options.isDateUnavailable?.(start) || options.isDateUnavailable?.(end)) {
      return true;
    }

    return (
      isDateInvalid(start, optionMinValue.value, optionMaxValue.value) ||
      isDateInvalid(end, optionMinValue.value, optionMaxValue.value)
    );
  });
  const isValueInvalid = computed(
    () =>
      resolveBoolean(options.isInvalid) ||
      (options.validationState !== undefined &&
        toValue(options.validationState) === "invalid") ||
      isInvalidSelection.value
  );
  const validationState = computed<"invalid" | null>(() =>
    isValueInvalid.value ? "invalid" : null
  );

  const isSelected = (date: DateValue): boolean => {
    const range = highlightedRange.value;
    return Boolean(
      range &&
        date.compare(range.start) >= 0 &&
        date.compare(range.end) <= 0 &&
        !calendar.isCellDisabled(date) &&
        !calendar.isCellUnavailable(date)
    );
  };

  const isInvalid = (date: DateValue): boolean =>
    calendar.isInvalid(date) ||
    isDateInvalid(date, availableRange.value?.start, availableRange.value?.end);

  return {
    ...calendar,
    value: displayedValue,
    setValue,
    anchorDate,
    setAnchorDate,
    highlightedRange,
    validationState,
    isValueInvalid,
    selectFocusedDate,
    selectDate,
    highlightDate,
    isSelected,
    isInvalid,
    isDragging,
    setDragging,
  };
}
