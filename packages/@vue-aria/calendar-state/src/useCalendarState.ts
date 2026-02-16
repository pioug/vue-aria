import {
  GregorianCalendar,
  type DateDuration,
  type CalendarDate,
  type CalendarIdentifier,
  DateFormatter,
  endOfMonth,
  endOfWeek,
  getDayOfWeek,
  isEqualCalendar,
  isSameDay,
  startOfMonth,
  startOfWeek,
  toCalendar,
  toCalendarDate,
  today,
} from "@internationalized/date";
import { useControlledState } from "@vue-stately/utils";
import { computed, ref, watch, watchEffect } from "vue";
import {
  alignCenter,
  alignEnd,
  alignStart,
  constrainStart,
  constrainValue,
  isInvalid,
  previousAvailableDate,
} from "./utils";
import type {
  CalendarState,
  CalendarStateOptions,
  DateValue,
  MappedDateValue,
  ValidationState,
} from "./types";

function unitDuration(duration: DateDuration): DateDuration {
  const unit: DateDuration = { ...duration };
  for (const key of Object.keys(duration) as Array<keyof DateDuration>) {
    unit[key] = 1;
  }

  return unit;
}

function hasTime(value: DateValue): value is DateValue & { set(value: CalendarDate): DateValue } {
  return "hour" in value && typeof value.set === "function";
}

/**
 * Provides state management for a calendar component.
 */
export function useCalendarState<T extends DateValue = DateValue>(
  props: CalendarStateOptions<T>
): CalendarState {
  const defaultFormatter = computed(() => new DateFormatter(props.locale));
  const resolvedOptions = computed(() => defaultFormatter.value.resolvedOptions());

  const visibleDuration = computed<DateDuration>(() => props.visibleDuration ?? { months: 1 });

  const calendar = computed(() =>
    props.createCalendar(resolvedOptions.value.calendar as CalendarIdentifier)
  );

  const [valueRef, setControlledValue] = useControlledState<DateValue | null, MappedDateValue<T> | null>(
    () => props.value as DateValue | null | undefined,
    () => (props.defaultValue ?? null) as DateValue | null,
    props.onChange as ((value: MappedDateValue<T> | null) => void) | undefined
  );

  const calendarDateValue = computed<CalendarDate | null>(() =>
    valueRef.value ? toCalendar(toCalendarDate(valueRef.value), calendar.value) : null
  );

  const timeZone = computed(() => {
    const value = valueRef.value as (DateValue & { timeZone?: string }) | null;
    if (value && "timeZone" in value && typeof value.timeZone === "string") {
      return value.timeZone;
    }

    return resolvedOptions.value.timeZone;
  });

  const focusedCalendarDate = computed<CalendarDate | undefined>(() =>
    props.focusedValue
      ? constrainValue(
        toCalendar(toCalendarDate(props.focusedValue), calendar.value),
        props.minValue,
        props.maxValue
      )
      : undefined
  );

  const defaultFocusedCalendarDate = computed<CalendarDate>(() =>
    constrainValue(
      props.defaultFocusedValue
        ? toCalendar(toCalendarDate(props.defaultFocusedValue), calendar.value)
        : calendarDateValue.value || toCalendar(today(timeZone.value), calendar.value),
      props.minValue,
      props.maxValue
    )
  );

  const [focusedDateRef, setFocusedDate] = useControlledState<CalendarDate, CalendarDate>(
    () => focusedCalendarDate.value,
    () => defaultFocusedCalendarDate.value,
    props.onFocusChange
  );

  const alignInitialStart = (date: CalendarDate): CalendarDate => {
    switch (props.selectionAlignment) {
      case "start":
        return alignStart(date, visibleDuration.value, props.locale, props.minValue, props.maxValue);
      case "end":
        return alignEnd(date, visibleDuration.value, props.locale, props.minValue, props.maxValue);
      case "center":
      default:
        return alignCenter(date, visibleDuration.value, props.locale, props.minValue, props.maxValue);
    }
  };

  const startDateRef = ref<CalendarDate>(alignInitialStart(focusedDateRef.value));
  const isFocusedRef = ref(Boolean(props.autoFocus));

  const endDate = computed(() => {
    const duration = { ...visibleDuration.value };
    if (duration.days) {
      duration.days -= 1;
    } else {
      duration.days = -1;
    }

    return startDateRef.value.add(duration);
  });

  const lastCalendar = ref(calendar.value);

  watch(
    calendar,
    (nextCalendar) => {
      if (!isEqualCalendar(nextCalendar, lastCalendar.value)) {
        const newFocusedDate = toCalendar(focusedDateRef.value, nextCalendar);
        startDateRef.value = alignCenter(
          newFocusedDate,
          visibleDuration.value,
          props.locale,
          props.minValue,
          props.maxValue
        );
        setFocusedDate(newFocusedDate);
        lastCalendar.value = nextCalendar;
      }
    },
    { immediate: true }
  );

  watchEffect(() => {
    const focusedDate = focusedDateRef.value;

    if (isInvalid(focusedDate, props.minValue, props.maxValue)) {
      const constrained = constrainValue(focusedDate, props.minValue, props.maxValue);
      if (!isSameDay(constrained, focusedDate)) {
        setFocusedDate(constrained);
      }
      return;
    }

    if (focusedDate.compare(startDateRef.value) < 0) {
      startDateRef.value = alignEnd(
        focusedDate,
        visibleDuration.value,
        props.locale,
        props.minValue,
        props.maxValue
      );
    } else if (focusedDate.compare(endDate.value) > 0) {
      startDateRef.value = alignStart(
        focusedDate,
        visibleDuration.value,
        props.locale,
        props.minValue,
        props.maxValue
      );
    }
  });

  const focusCell = (date: any) => {
    setFocusedDate(constrainValue(date, props.minValue, props.maxValue));
  };

  const setValue = (newValue: CalendarDate | null) => {
    if (props.isDisabled || props.isReadOnly) {
      return;
    }

    if (newValue == null) {
      setControlledValue(null);
      return;
    }

    let localValue: CalendarDate | null = constrainValue(newValue, props.minValue, props.maxValue);
    localValue = previousAvailableDate(localValue, startDateRef.value, props.isDateUnavailable);

    if (!localValue) {
      return;
    }

    localValue = toCalendar(localValue, valueRef.value?.calendar || new GregorianCalendar());

    if (valueRef.value && hasTime(valueRef.value)) {
      setControlledValue(valueRef.value.set(localValue) as MappedDateValue<T>);
      return;
    }

    setControlledValue(localValue as MappedDateValue<T>);
  };

  const isUnavailable = computed(() => {
    const value = calendarDateValue.value;
    if (!value) {
      return false;
    }

    if (props.isDateUnavailable?.(value)) {
      return true;
    }

    return isInvalid(value, props.minValue, props.maxValue);
  });

  const isValueInvalid = computed(
    () => Boolean(props.isInvalid || props.validationState === "invalid" || isUnavailable.value)
  );

  const validationState = computed<ValidationState | null>(() =>
    isValueInvalid.value ? "invalid" : null
  );

  const pageDuration = computed(() => {
    if ((props.pageBehavior ?? "visible") === "visible") {
      return visibleDuration.value;
    }

    return unitDuration(visibleDuration.value);
  });

  const state: CalendarState = {
    get isDisabled() {
      return props.isDisabled ?? false;
    },
    get isReadOnly() {
      return props.isReadOnly ?? false;
    },
    get value() {
      return calendarDateValue.value;
    },
    setValue,
    get visibleRange() {
      return {
        start: startDateRef.value,
        end: endDate.value,
      };
    },
    get minValue() {
      return props.minValue;
    },
    get maxValue() {
      return props.maxValue;
    },
    get focusedDate() {
      return focusedDateRef.value;
    },
    get timeZone() {
      return timeZone.value;
    },
    get validationState() {
      return validationState.value;
    },
    get isValueInvalid() {
      return isValueInvalid.value;
    },
    setFocusedDate(date) {
      focusCell(date);
    },
    focusNextDay() {
      focusCell(focusedDateRef.value.add({ days: 1 }));
    },
    focusPreviousDay() {
      focusCell(focusedDateRef.value.subtract({ days: 1 }));
    },
    focusNextRow() {
      if (visibleDuration.value.days) {
        state.focusNextPage();
      } else if (visibleDuration.value.weeks || visibleDuration.value.months || visibleDuration.value.years) {
        focusCell(focusedDateRef.value.add({ weeks: 1 }));
      }
    },
    focusPreviousRow() {
      if (visibleDuration.value.days) {
        state.focusPreviousPage();
      } else if (visibleDuration.value.weeks || visibleDuration.value.months || visibleDuration.value.years) {
        focusCell(focusedDateRef.value.subtract({ weeks: 1 }));
      }
    },
    focusNextPage() {
      const start = startDateRef.value.add(pageDuration.value);
      setFocusedDate(constrainValue(focusedDateRef.value.add(pageDuration.value), props.minValue, props.maxValue));
      startDateRef.value = alignStart(
        constrainStart(
          focusedDateRef.value,
          start,
          pageDuration.value,
          props.locale,
          props.minValue,
          props.maxValue
        ),
        pageDuration.value,
        props.locale
      );
    },
    focusPreviousPage() {
      const start = startDateRef.value.subtract(pageDuration.value);
      setFocusedDate(constrainValue(focusedDateRef.value.subtract(pageDuration.value), props.minValue, props.maxValue));
      startDateRef.value = alignStart(
        constrainStart(
          focusedDateRef.value,
          start,
          pageDuration.value,
          props.locale,
          props.minValue,
          props.maxValue
        ),
        pageDuration.value,
        props.locale
      );
    },
    focusSectionStart() {
      if (visibleDuration.value.days) {
        focusCell(startDateRef.value);
      } else if (visibleDuration.value.weeks) {
        focusCell(startOfWeek(focusedDateRef.value, props.locale));
      } else if (visibleDuration.value.months || visibleDuration.value.years) {
        focusCell(startOfMonth(focusedDateRef.value));
      }
    },
    focusSectionEnd() {
      if (visibleDuration.value.days) {
        focusCell(endDate.value);
      } else if (visibleDuration.value.weeks) {
        focusCell(endOfWeek(focusedDateRef.value, props.locale));
      } else if (visibleDuration.value.months || visibleDuration.value.years) {
        focusCell(endOfMonth(focusedDateRef.value));
      }
    },
    focusNextSection(larger) {
      if (!larger && !visibleDuration.value.days) {
        focusCell(focusedDateRef.value.add(unitDuration(visibleDuration.value)));
        return;
      }

      if (visibleDuration.value.days) {
        state.focusNextPage();
      } else if (visibleDuration.value.weeks) {
        focusCell(focusedDateRef.value.add({ months: 1 }));
      } else if (visibleDuration.value.months || visibleDuration.value.years) {
        focusCell(focusedDateRef.value.add({ years: 1 }));
      }
    },
    focusPreviousSection(larger) {
      if (!larger && !visibleDuration.value.days) {
        focusCell(focusedDateRef.value.subtract(unitDuration(visibleDuration.value)));
        return;
      }

      if (visibleDuration.value.days) {
        state.focusPreviousPage();
      } else if (visibleDuration.value.weeks) {
        focusCell(focusedDateRef.value.subtract({ months: 1 }));
      } else if (visibleDuration.value.months || visibleDuration.value.years) {
        focusCell(focusedDateRef.value.subtract({ years: 1 }));
      }
    },
    selectFocusedDate() {
      if (!(props.isDateUnavailable && props.isDateUnavailable(focusedDateRef.value))) {
        setValue(focusedDateRef.value);
      }
    },
    selectDate(date) {
      setValue(date);
    },
    get isFocused() {
      return isFocusedRef.value;
    },
    setFocused(value) {
      isFocusedRef.value = value;
    },
    isInvalid(date) {
      return isInvalid(date, props.minValue, props.maxValue);
    },
    isSelected(date) {
      return Boolean(
        calendarDateValue.value
        && isSameDay(date, calendarDateValue.value)
        && !state.isCellDisabled(date)
        && !state.isCellUnavailable(date)
      );
    },
    isCellFocused(date) {
      return state.isFocused && isSameDay(date, focusedDateRef.value);
    },
    isCellDisabled(date) {
      return Boolean(
        props.isDisabled
        || date.compare(startDateRef.value) < 0
        || date.compare(endDate.value) > 0
        || state.isInvalid(date)
      );
    },
    isCellUnavailable(date) {
      return props.isDateUnavailable ? props.isDateUnavailable(date) : false;
    },
    isPreviousVisibleRangeInvalid() {
      const prev = startDateRef.value.subtract({ days: 1 });
      return isSameDay(prev as any, startDateRef.value as any) || state.isInvalid(prev as any);
    },
    isNextVisibleRangeInvalid() {
      const next = endDate.value.add({ days: 1 });
      return isSameDay(next as any, endDate.value as any) || state.isInvalid(next as any);
    },
    getDatesInWeek(weekIndex, from = startDateRef.value) {
      let date = from.add({ weeks: weekIndex });
      const dates: Array<any | null> = [];

      date = startOfWeek(date, props.locale, props.firstDayOfWeek);

      const dayOfWeek = getDayOfWeek(date, props.locale, props.firstDayOfWeek);
      for (let i = 0; i < dayOfWeek; i++) {
        dates.push(null);
      }

      while (dates.length < 7) {
        dates.push(date);
        const nextDate = date.add({ days: 1 });
        if (isSameDay(date, nextDate)) {
          break;
        }

        date = nextDate;
      }

      while (dates.length < 7) {
        dates.push(null);
      }

      return dates;
    },
  };

  return state;
}
