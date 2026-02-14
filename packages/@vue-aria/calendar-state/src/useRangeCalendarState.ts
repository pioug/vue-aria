import {
  type CalendarDate,
  type DateDuration,
  GregorianCalendar,
  isEqualDay,
  maxDate,
  minDate,
  toCalendar,
  toCalendarDate,
} from "@internationalized/date";
import { useControlledState } from "@vue-aria/utils-state";
import { computed, ref, watchEffect } from "vue";
import { useCalendarState } from "./useCalendarState";
import { alignCenter, constrainValue, isInvalid, previousAvailableDate } from "./utils";
import type {
  CalendarState,
  DateValue,
  MappedDateValue,
  RangeCalendarState,
  RangeCalendarStateOptions,
  RangeValue,
  ValidationState,
} from "./types";

function makeRange(start: DateValue, end: DateValue): RangeValue<CalendarDate> | null {
  if (!start || !end) {
    return null;
  }

  if (end.compare(start) < 0) {
    [start, end] = [end, start];
  }

  return {
    start: toCalendarDate(start),
    end: toCalendarDate(end),
  };
}

function convertValue(newValue: CalendarDate, oldValue?: DateValue): DateValue {
  newValue = toCalendar(newValue, oldValue?.calendar || new GregorianCalendar());

  if (oldValue && "hour" in oldValue && typeof oldValue.set === "function") {
    return oldValue.set(newValue);
  }

  return newValue;
}

function nextUnavailableDate(
  anchorDate: CalendarDate,
  state: CalendarState,
  direction: number
): CalendarDate | undefined {
  let nextDate = anchorDate.add({ days: direction });
  while (
    (direction < 0
      ? nextDate.compare(state.visibleRange.start) >= 0
      : nextDate.compare(state.visibleRange.end) <= 0)
    && !state.isCellUnavailable(nextDate)
  ) {
    nextDate = nextDate.add({ days: direction });
  }

  if (state.isCellUnavailable(nextDate)) {
    return nextDate.add({ days: -direction });
  }

  return undefined;
}

/**
 * Provides state management for a range calendar component.
 */
export function useRangeCalendarState<T extends DateValue = DateValue>(
  props: RangeCalendarStateOptions<T>
): RangeCalendarState<T> {
  const {
    value: valueProp,
    defaultValue,
    onChange,
    createCalendar,
    locale,
    visibleDuration = { months: 1 },
    minValue,
    maxValue,
    ...calendarProps
  } = props;

  const [valueRef, setControlledValue] = useControlledState<
    RangeValue<any> | null,
    RangeValue<any> | null
  >(
    () => valueProp as RangeValue<any> | null | undefined,
    () => (defaultValue ?? null) as RangeValue<any> | null,
    onChange as ((value: RangeValue<any> | null) => void) | undefined
  );

  const anchorDateRef = ref<any>(null);

  let alignment: "center" | "start" = "center";
  if (valueRef.value?.start && valueRef.value.end) {
    const start = alignCenter(
      toCalendarDate(valueRef.value.start),
      visibleDuration,
      locale,
      minValue,
      maxValue
    );
    const end = start.add(visibleDuration).subtract({ days: 1 });

    if ((valueRef.value.end as any).compare(end) > 0) {
      alignment = "start";
    }
  }

  const availableRangeRef = ref<Partial<RangeValue<DateValue>> | null>(null);
  const availableRange = ref<Partial<RangeValue<DateValue>> | null>(null);

  const min = computed(() => maxDate(minValue, availableRange.value?.start));
  const max = computed(() => minDate(maxValue, availableRange.value?.end));

  const calendar = useCalendarState({
    ...calendarProps,
    get value() {
      return valueRef.value?.start ?? null;
    },
    createCalendar,
    locale,
    visibleDuration,
    get minValue() {
      return min.value;
    },
    get maxValue() {
      return max.value;
    },
    selectionAlignment: props.selectionAlignment || alignment,
  } as any);

  const updateAvailableRange = (date: any) => {
    if (date && props.isDateUnavailable && !props.allowsNonContiguousRanges) {
      const nextAvailableStartDate = nextUnavailableDate(date, calendar, -1);
      const nextAvailableEndDate = nextUnavailableDate(date, calendar, 1);
      availableRangeRef.value = {
        start: nextAvailableStartDate,
        end: nextAvailableEndDate,
      };
      availableRange.value = availableRangeRef.value;
    } else {
      availableRangeRef.value = null;
      availableRange.value = null;
    }
  };

  const lastVisibleRange = ref(calendar.visibleRange);
  watchEffect(() => {
    const visibleRange = calendar.visibleRange;
    if (
      !isEqualDay(visibleRange.start, lastVisibleRange.value.start)
      || !isEqualDay(visibleRange.end, lastVisibleRange.value.end)
    ) {
      updateAvailableRange(anchorDateRef.value);
      lastVisibleRange.value = visibleRange;
    }
  });

  const setAnchorDate = (date: any) => {
    anchorDateRef.value = date;
    updateAvailableRange(date);
  };

  const highlightedRange = computed(() => {
    if (anchorDateRef.value) {
      return makeRange(anchorDateRef.value, calendar.focusedDate);
    }

    if (valueRef.value?.start && valueRef.value.end) {
      return makeRange(valueRef.value.start, valueRef.value.end);
    }

    return null;
  });

  const selectDate = (date: any) => {
    if (props.isReadOnly) {
      return;
    }

    const constrainedDate = constrainValue(date, min.value, max.value);
    const previousAvailableConstrainedDate = previousAvailableDate(
      constrainedDate,
      calendar.visibleRange.start,
      props.isDateUnavailable
    );

    if (!previousAvailableConstrainedDate) {
      return;
    }

    if (!anchorDateRef.value) {
      setAnchorDate(previousAvailableConstrainedDate);
      return;
    }

    const range = makeRange(anchorDateRef.value, previousAvailableConstrainedDate);
    if (range) {
      setControlledValue({
        start: convertValue(range.start, valueRef.value?.start) as any,
        end: convertValue(range.end, valueRef.value?.end) as any,
      });
    }

    setAnchorDate(null);
  };

  const isDraggingRef = ref(false);

  const isInvalidSelection = computed(() => {
    const value = valueRef.value;
    if (!value || anchorDateRef.value) {
      return false;
    }

    if (props.isDateUnavailable && (props.isDateUnavailable(value.start) || props.isDateUnavailable(value.end))) {
      return true;
    }

    return isInvalid(value.start, minValue, maxValue) || isInvalid(value.end, minValue, maxValue);
  });

  const isValueInvalid = computed(
    () => Boolean(props.isInvalid || props.validationState === "invalid" || isInvalidSelection.value)
  );

  const validationState = computed<ValidationState | null>(() =>
    isValueInvalid.value ? "invalid" : null
  );

  const state: RangeCalendarState<T> = {
    get isDisabled() {
      return calendar.isDisabled;
    },
    get isReadOnly() {
      return calendar.isReadOnly;
    },
    get visibleRange() {
      return calendar.visibleRange;
    },
    get minValue() {
      return calendar.minValue;
    },
    get maxValue() {
      return calendar.maxValue;
    },
    get timeZone() {
      return calendar.timeZone;
    },
    get focusedDate() {
      return calendar.focusedDate;
    },
    setFocusedDate(value) {
      calendar.setFocusedDate(value);
    },
    focusNextDay() {
      calendar.focusNextDay();
    },
    focusPreviousDay() {
      calendar.focusPreviousDay();
    },
    focusNextRow() {
      calendar.focusNextRow();
    },
    focusPreviousRow() {
      calendar.focusPreviousRow();
    },
    focusNextPage() {
      calendar.focusNextPage();
    },
    focusPreviousPage() {
      calendar.focusPreviousPage();
    },
    focusSectionStart() {
      calendar.focusSectionStart();
    },
    focusSectionEnd() {
      calendar.focusSectionEnd();
    },
    focusNextSection(larger) {
      calendar.focusNextSection(larger);
    },
    focusPreviousSection(larger) {
      calendar.focusPreviousSection(larger);
    },
    get value() {
      return valueRef.value;
    },
    setValue(value) {
      setControlledValue(value as any);
    },
    get anchorDate() {
      return anchorDateRef.value;
    },
    setAnchorDate,
    get highlightedRange() {
      return highlightedRange.value;
    },
    get validationState() {
      return validationState.value;
    },
    get isValueInvalid() {
      return isValueInvalid.value;
    },
    selectFocusedDate() {
      selectDate(calendar.focusedDate);
    },
    selectDate,
    highlightDate(date) {
      if (anchorDateRef.value) {
        calendar.setFocusedDate(date);
      }
    },
    isSelected(date) {
      const range = highlightedRange.value;
      return Boolean(
        range
        && date.compare(range.start) >= 0
        && date.compare(range.end) <= 0
        && !calendar.isCellDisabled(date)
        && !calendar.isCellUnavailable(date)
      );
    },
    isInvalid(date) {
      return calendar.isInvalid(date)
        || isInvalid(date, availableRangeRef.value?.start, availableRangeRef.value?.end);
    },
    get isFocused() {
      return calendar.isFocused;
    },
    setFocused(value) {
      calendar.setFocused(value);
    },
    isCellFocused(date) {
      return calendar.isCellFocused(date);
    },
    isCellDisabled(date) {
      return calendar.isCellDisabled(date);
    },
    isCellUnavailable(date) {
      return calendar.isCellUnavailable(date);
    },
    isPreviousVisibleRangeInvalid() {
      return calendar.isPreviousVisibleRangeInvalid();
    },
    isNextVisibleRangeInvalid() {
      return calendar.isNextVisibleRangeInvalid();
    },
    getDatesInWeek(weekIndex, startDate) {
      return calendar.getDatesInWeek(weekIndex, startDate);
    },
    get isDragging() {
      return isDraggingRef.value;
    },
    setDragging(isDragging) {
      isDraggingRef.value = isDragging;
    },
  };

  return state;
}
