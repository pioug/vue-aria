import {
  DateFormatter,
  createCalendar as defaultCreateCalendar,
  endOfWeek,
  getDayOfWeek,
  isSameDay,
  startOfMonth,
  startOfWeek,
  today,
} from "@internationalized/date";
import { computed, ref, toValue, watch } from "vue";
import type { CalendarIdentifier, DateDuration } from "@internationalized/date";
import type { DateValue, UseCalendarStateOptions, UseCalendarStateResult } from "./types";
import {
  alignCenter,
  alignEnd,
  alignStart,
  constrainDateValue,
  convertDateValue,
  endOfSection,
  getVisibleRangeEnd,
  isDateInvalid,
  previousAvailableDate,
  resolveBoolean,
  resolveDateValue,
  resolveDuration,
  resolveFirstDayOfWeek,
  resolveLocale,
  resolveSelectionAlignment,
  toDisplayDate,
  unitDuration,
} from "./utils";

function resolveValidationState(
  value: UseCalendarStateOptions["validationState"]
): "valid" | "invalid" | undefined {
  if (value === undefined) {
    return undefined;
  }

  return toValue(value) ?? undefined;
}

function asDateValue(value: unknown): DateValue {
  return value as DateValue;
}

function selectionStartDate(
  alignment: "start" | "center" | "end",
  focusedDate: DateValue,
  visibleDuration: DateDuration,
  locale: string,
  minValue: DateValue | null,
  maxValue: DateValue | null
): DateValue {
  switch (alignment) {
    case "start":
      return alignStart(focusedDate, visibleDuration, locale, minValue, maxValue);
    case "end":
      return alignEnd(focusedDate, visibleDuration, locale, minValue, maxValue);
    default:
      return alignCenter(focusedDate, visibleDuration, locale, minValue, maxValue);
  }
}

export function useCalendarState<TValue extends DateValue = DateValue>(
  options: UseCalendarStateOptions<TValue> = {}
): UseCalendarStateResult {
  const locale = computed(() => resolveLocale(options.locale));
  const formatter = computed(() => new DateFormatter(locale.value));
  const resolvedOptions = computed(() => formatter.value.resolvedOptions());
  const createCalendar = computed(
    () => options.createCalendar ?? defaultCreateCalendar
  );
  const calendar = computed(() =>
    createCalendar.value(resolvedOptions.value.calendar as CalendarIdentifier)
  );

  const isDisabled = computed(() => resolveBoolean(options.isDisabled));
  const isReadOnly = computed(() => resolveBoolean(options.isReadOnly));

  const uncontrolledValue = ref<TValue | null>(resolveDateValue(options.defaultValue));
  const isValueControlled = computed(() => options.value !== undefined);
  const rawValue = computed<TValue | null>(() => {
    if (isValueControlled.value) {
      return resolveDateValue(options.value);
    }

    return uncontrolledValue.value;
  });

  const minValue = computed<DateValue | null>(() =>
    toDisplayDate(resolveDateValue(options.minValue), calendar.value)
  );
  const maxValue = computed<DateValue | null>(() =>
    toDisplayDate(resolveDateValue(options.maxValue), calendar.value)
  );

  const value = computed<DateValue | null>(() =>
    toDisplayDate(rawValue.value, calendar.value)
  );

  const timeZone = computed(() => {
    const selectedValue = rawValue.value;
    if (selectedValue && "timeZone" in selectedValue) {
      return selectedValue.timeZone ?? resolvedOptions.value.timeZone ?? "UTC";
    }

    return resolvedOptions.value.timeZone ?? "UTC";
  });

  const defaultFocusedDate = (): DateValue => {
    const focusedValue = toDisplayDate(resolveDateValue(options.defaultFocusedValue), calendar.value);
    if (focusedValue) {
      return constrainDateValue(focusedValue, minValue.value, maxValue.value);
    }

    if (value.value) {
      return constrainDateValue(value.value, minValue.value, maxValue.value);
    }

    return constrainDateValue(
      asDateValue(today(timeZone.value)),
      minValue.value,
      maxValue.value
    );
  };

  const uncontrolledFocusedDate = ref<DateValue>(defaultFocusedDate());
  const isFocusedValueControlled = computed(() => options.focusedValue !== undefined);
  const focusedDate = computed<DateValue>(() => {
    if (isFocusedValueControlled.value) {
      const controlled = toDisplayDate(resolveDateValue(options.focusedValue), calendar.value);
      if (controlled) {
        return constrainDateValue(controlled, minValue.value, maxValue.value);
      }
    }

    return uncontrolledFocusedDate.value;
  });

  const visibleDuration = computed(() => resolveDuration(options.visibleDuration));
  const selectionAlignment = computed(() =>
    resolveSelectionAlignment(options.selectionAlignment)
  );
  const firstDayOfWeek = computed(() =>
    resolveFirstDayOfWeek(options.firstDayOfWeek)
  );
  const pageBehavior = computed(() => {
    if (options.pageBehavior === undefined) {
      return "visible";
    }

    return toValue(options.pageBehavior) ?? "visible";
  });
  const pageDuration = computed<DateDuration>(() => {
    if (pageBehavior.value === "visible") {
      return visibleDuration.value;
    }

    return unitDuration(visibleDuration.value);
  });

  const startDate = ref<DateValue>(
    selectionStartDate(
      selectionAlignment.value,
      focusedDate.value,
      visibleDuration.value,
      locale.value,
      minValue.value,
      maxValue.value
    )
  );

  const visibleRange = computed(() => ({
    start: startDate.value,
    end: getVisibleRangeEnd(startDate.value, visibleDuration.value),
  }));

  const ensureDateVisible = (date: DateValue): void => {
    const range = visibleRange.value;
    if (date.compare(range.start) < 0) {
      startDate.value = alignEnd(
        date,
        visibleDuration.value,
        locale.value,
        minValue.value,
        maxValue.value
      );
    } else if (date.compare(range.end) > 0) {
      startDate.value = alignStart(
        date,
        visibleDuration.value,
        locale.value,
        minValue.value,
        maxValue.value
      );
    }
  };

  watch(
    [focusedDate, visibleDuration, locale, minValue, maxValue],
    ([nextFocused]) => {
      ensureDateVisible(nextFocused);
    },
    { immediate: true }
  );

  watch(
    [calendar, () => options.defaultFocusedValue, value],
    () => {
      if (!isFocusedValueControlled.value) {
        uncontrolledFocusedDate.value = constrainDateValue(
          uncontrolledFocusedDate.value,
          minValue.value,
          maxValue.value
        );
      }
    }
  );

  const setFocusedDate = (date: DateValue): void => {
    const nextDate = constrainDateValue(date, minValue.value, maxValue.value);
    if (!isFocusedValueControlled.value) {
      uncontrolledFocusedDate.value = nextDate;
    }

    options.onFocusChange?.(nextDate);
    ensureDateVisible(nextDate);
  };

  const setRawValue = (nextValue: DateValue | null): void => {
    if (isDisabled.value || isReadOnly.value) {
      return;
    }

    if (nextValue === null) {
      if (!isValueControlled.value) {
        uncontrolledValue.value = null;
      }
      options.onChange?.(null);
      return;
    }

    const constrained = constrainDateValue(nextValue, minValue.value, maxValue.value);
    const availableDate = previousAvailableDate(
      constrained,
      visibleRange.value.start,
      options.isDateUnavailable
    );
    if (!availableDate) {
      return;
    }

    const emitted = convertDateValue(availableDate, rawValue.value ?? undefined) as TValue;
    if (!isValueControlled.value) {
      uncontrolledValue.value = emitted;
    }
    options.onChange?.(emitted);
  };

  const isUnavailable = computed(() => {
    if (!value.value) {
      return false;
    }

    if (options.isDateUnavailable?.(value.value)) {
      return true;
    }

    return isDateInvalid(value.value, minValue.value, maxValue.value);
  });
  const isValueInvalid = computed(
    () =>
      resolveBoolean(options.isInvalid) ||
      resolveValidationState(options.validationState) === "invalid" ||
      isUnavailable.value
  );
  const validationState = computed<"invalid" | null>(() =>
    isValueInvalid.value ? "invalid" : null
  );

  const isFocused = ref(resolveBoolean(options.autoFocus));
  const setFocused = (nextFocused: boolean): void => {
    isFocused.value = nextFocused;
  };

  const focusCell = (date: DateValue): void => {
    setFocusedDate(constrainDateValue(date, minValue.value, maxValue.value));
  };

  const isInvalid = (date: DateValue): boolean =>
    isDateInvalid(date, minValue.value, maxValue.value);

  const isCellUnavailable = (date: DateValue): boolean =>
    options.isDateUnavailable?.(date) ?? false;

  const isCellDisabled = (date: DateValue): boolean => {
    const range = visibleRange.value;
    return (
      isDisabled.value ||
      date.compare(range.start) < 0 ||
      date.compare(range.end) > 0 ||
      isInvalid(date)
    );
  };

  const isSelected = (date: DateValue): boolean =>
    Boolean(
      value.value &&
        isSameDay(date as never, value.value as never) &&
        !isCellDisabled(date) &&
        !isCellUnavailable(date)
    );

  const isCellFocused = (date: DateValue): boolean =>
    isFocused.value && isSameDay(date as never, focusedDate.value as never);

  const isPreviousVisibleRangeInvalid = (): boolean => {
    const previous = startDate.value.subtract({ days: 1 });
    return isSameDay(previous as never, startDate.value as never) || isInvalid(previous);
  };

  const isNextVisibleRangeInvalid = (): boolean => {
    const next = visibleRange.value.end.add({ days: 1 });
    return isSameDay(next as never, visibleRange.value.end as never) || isInvalid(next);
  };

  const focusNextPage = (): void => {
    const nextStart = startDate.value.add(pageDuration.value);
    const nextFocusedDate = constrainDateValue(
      focusedDate.value.add(pageDuration.value),
      minValue.value,
      maxValue.value
    );

    setFocusedDate(nextFocusedDate);
    startDate.value = alignStart(
      nextStart,
      pageDuration.value,
      locale.value,
      minValue.value,
      maxValue.value
    );
  };

  const focusPreviousPage = (): void => {
    const previousStart = startDate.value.subtract(pageDuration.value);
    const previousFocusedDate = constrainDateValue(
      focusedDate.value.subtract(pageDuration.value),
      minValue.value,
      maxValue.value
    );

    setFocusedDate(previousFocusedDate);
    startDate.value = alignStart(
      previousStart,
      pageDuration.value,
      locale.value,
      minValue.value,
      maxValue.value
    );
  };

  const focusNextDay = (): void => {
    focusCell(focusedDate.value.add({ days: 1 }));
  };

  const focusPreviousDay = (): void => {
    focusCell(focusedDate.value.subtract({ days: 1 }));
  };

  const focusNextRow = (): void => {
    if (visibleDuration.value.days) {
      focusNextPage();
      return;
    }

    if (
      visibleDuration.value.weeks ||
      visibleDuration.value.months ||
      visibleDuration.value.years
    ) {
      focusCell(focusedDate.value.add({ weeks: 1 }));
    }
  };

  const focusPreviousRow = (): void => {
    if (visibleDuration.value.days) {
      focusPreviousPage();
      return;
    }

    if (
      visibleDuration.value.weeks ||
      visibleDuration.value.months ||
      visibleDuration.value.years
    ) {
      focusCell(focusedDate.value.subtract({ weeks: 1 }));
    }
  };

  const focusSectionStart = (): void => {
    if (visibleDuration.value.days) {
      focusCell(visibleRange.value.start);
      return;
    }

    if (visibleDuration.value.weeks) {
      focusCell(
        asDateValue(
          startOfWeek(
            focusedDate.value as never,
            locale.value,
            firstDayOfWeek.value
          )
        )
      );
      return;
    }

    focusCell(asDateValue(startOfMonth(focusedDate.value as never)));
  };

  const focusSectionEnd = (): void => {
    if (visibleDuration.value.days) {
      focusCell(visibleRange.value.end);
      return;
    }

    if (visibleDuration.value.weeks) {
      focusCell(
        asDateValue(
          endOfWeek(
            focusedDate.value as never,
            locale.value,
            firstDayOfWeek.value
          )
        )
      );
      return;
    }

    focusCell(endOfSection(focusedDate.value, visibleDuration.value, locale.value));
  };

  const focusNextSection = (larger = false): void => {
    if (!larger && !visibleDuration.value.days) {
      focusCell(focusedDate.value.add(unitDuration(visibleDuration.value)));
      return;
    }

    if (visibleDuration.value.days) {
      focusNextPage();
    } else if (visibleDuration.value.weeks) {
      focusCell(focusedDate.value.add({ months: 1 }));
    } else {
      focusCell(focusedDate.value.add({ years: 1 }));
    }
  };

  const focusPreviousSection = (larger = false): void => {
    if (!larger && !visibleDuration.value.days) {
      focusCell(focusedDate.value.subtract(unitDuration(visibleDuration.value)));
      return;
    }

    if (visibleDuration.value.days) {
      focusPreviousPage();
    } else if (visibleDuration.value.weeks) {
      focusCell(focusedDate.value.subtract({ months: 1 }));
    } else {
      focusCell(focusedDate.value.subtract({ years: 1 }));
    }
  };

  const selectDate = (date: DateValue): void => {
    setRawValue(date);
  };

  const selectFocusedDate = (): void => {
    if (!options.isDateUnavailable?.(focusedDate.value)) {
      setRawValue(focusedDate.value);
    }
  };

  const getDatesInWeek = (
    weekIndex: number,
    from = startDate.value
  ): Array<DateValue | null> => {
    let date = from.add({ weeks: weekIndex });
    date = asDateValue(
      startOfWeek(date as never, locale.value, firstDayOfWeek.value)
    );

    const result: Array<DateValue | null> = [];
    const dayOfWeek = getDayOfWeek(
      date as never,
      locale.value,
      firstDayOfWeek.value
    );

    for (let index = 0; index < dayOfWeek; index += 1) {
      result.push(null);
    }

    while (result.length < 7) {
      result.push(date);
      const nextDate = date.add({ days: 1 });
      if (isSameDay(nextDate as never, date as never)) {
        break;
      }
      date = nextDate;
    }

    while (result.length < 7) {
      result.push(null);
    }

    return result;
  };

  return {
    isDisabled,
    isReadOnly,
    value,
    setValue: setRawValue,
    visibleRange,
    minValue,
    maxValue,
    focusedDate,
    timeZone,
    validationState,
    isValueInvalid,
    setFocusedDate,
    focusNextDay,
    focusPreviousDay,
    focusNextRow,
    focusPreviousRow,
    focusNextPage,
    focusPreviousPage,
    focusSectionStart,
    focusSectionEnd,
    focusNextSection,
    focusPreviousSection,
    selectFocusedDate,
    selectDate,
    isFocused,
    setFocused,
    isInvalid,
    isSelected,
    isCellFocused,
    isCellDisabled,
    isCellUnavailable,
    isPreviousVisibleRangeInvalid,
    isNextVisibleRangeInvalid,
    getDatesInWeek,
  };
}
