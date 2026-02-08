import {
  GregorianCalendar,
  endOfMonth,
  endOfWeek,
  maxDate,
  minDate,
  startOfMonth,
  startOfWeek,
  startOfYear,
  toCalendar,
  toCalendarDate,
} from "@internationalized/date";
import { toValue } from "vue";
import type { Calendar, DateDuration } from "@internationalized/date";
import type {
  CalendarRangeValue,
  DateValue,
  DayOfWeek,
  SelectionAlignment,
} from "./types";
import type { MaybeReactive } from "@vue-aria/types";

const DAY_OF_WEEK: DayOfWeek[] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

function asDateValue(value: unknown): DateValue {
  return value as DateValue;
}

export function resolveLocale(value: MaybeReactive<string | undefined> | undefined): string {
  if (value !== undefined) {
    return toValue(value) ?? "en-US";
  }

  if (typeof navigator !== "undefined" && navigator.language) {
    return navigator.language;
  }

  return "en-US";
}

export function resolveBoolean(
  value: MaybeReactive<boolean | undefined> | undefined,
  fallback = false
): boolean {
  if (value === undefined) {
    return fallback;
  }

  return Boolean(toValue(value));
}

export function resolveDateValue<T extends DateValue>(
  value: MaybeReactive<T | null | undefined> | undefined
): T | null {
  if (value === undefined) {
    return null;
  }

  return toValue(value) ?? null;
}

export function resolveRangeValue<T extends DateValue>(
  value: MaybeReactive<CalendarRangeValue<T> | null | undefined> | undefined
): CalendarRangeValue<T> | null {
  if (value === undefined) {
    return null;
  }

  return toValue(value) ?? null;
}

export function resolveDuration(
  duration: MaybeReactive<DateDuration | undefined> | undefined
): DateDuration {
  const value = duration === undefined ? undefined : toValue(duration);
  if (!value) {
    return { months: 1 };
  }

  if (
    value.days === undefined &&
    value.weeks === undefined &&
    value.months === undefined &&
    value.years === undefined
  ) {
    return { months: 1 };
  }

  return { ...value };
}

export function resolveSelectionAlignment(
  value: MaybeReactive<SelectionAlignment | undefined> | undefined
): SelectionAlignment {
  if (value === undefined) {
    return "center";
  }

  return toValue(value) ?? "center";
}

export function resolveFirstDayOfWeek(
  value: MaybeReactive<DayOfWeek | number | undefined> | undefined
): DayOfWeek | undefined {
  if (value === undefined) {
    return undefined;
  }

  const resolved = toValue(value);
  if (resolved === undefined) {
    return undefined;
  }

  if (typeof resolved === "number") {
    if (Number.isNaN(resolved)) {
      return undefined;
    }

    const index = ((Math.trunc(resolved) % 7) + 7) % 7;
    return DAY_OF_WEEK[index];
  }

  return resolved;
}

export function toDisplayDate(
  value: DateValue | null | undefined,
  calendar: Calendar
): DateValue | null {
  if (!value) {
    return null;
  }

  return asDateValue(toCalendar(toCalendarDate(value as never), calendar));
}

export function toDisplayRange<T extends DateValue>(
  value: CalendarRangeValue<T> | null | undefined,
  calendar: Calendar
): CalendarRangeValue<DateValue> | null {
  if (!value) {
    return null;
  }

  return {
    start: asDateValue(toCalendar(toCalendarDate(value.start as never), calendar)),
    end: asDateValue(toCalendar(toCalendarDate(value.end as never), calendar)),
  };
}

export function isDateInvalid(
  date: DateValue,
  minValue: DateValue | null | undefined,
  maxValue: DateValue | null | undefined
): boolean {
  return (
    (minValue != null && date.compare(minValue) < 0) ||
    (maxValue != null && date.compare(maxValue) > 0)
  );
}

export function constrainDateValue(
  date: DateValue,
  minValue: DateValue | null | undefined,
  maxValue: DateValue | null | undefined
): DateValue {
  let constrained = date;
  if (minValue) {
    const next = maxDate(constrained as never, minValue as never);
    if (next) {
      constrained = asDateValue(next);
    }
  }

  if (maxValue) {
    const next = minDate(constrained as never, maxValue as never);
    if (next) {
      constrained = asDateValue(next);
    }
  }

  return constrained;
}

export function alignStart(
  date: DateValue,
  duration: DateDuration,
  locale: string,
  minValue?: DateValue | null,
  maxValue?: DateValue | null
): DateValue {
  let aligned = date;
  if (duration.years) {
    aligned = asDateValue(startOfYear(date as never));
  } else if (duration.months) {
    aligned = asDateValue(startOfMonth(date as never));
  } else if (duration.weeks) {
    aligned = asDateValue(startOfWeek(date as never, locale));
  }

  return constrainStart(date, aligned, duration, locale, minValue, maxValue);
}

export function alignEnd(
  date: DateValue,
  duration: DateDuration,
  locale: string,
  minValue?: DateValue | null,
  maxValue?: DateValue | null
): DateValue {
  const reduced = { ...duration };
  if (reduced.days) {
    reduced.days -= 1;
  } else if (reduced.weeks) {
    reduced.weeks -= 1;
  } else if (reduced.months) {
    reduced.months -= 1;
  } else if (reduced.years) {
    reduced.years -= 1;
  }

  const aligned = alignStart(date, duration, locale).subtract(reduced);
  return constrainStart(date, aligned, duration, locale, minValue, maxValue);
}

export function alignCenter(
  date: DateValue,
  duration: DateDuration,
  locale: string,
  minValue?: DateValue | null,
  maxValue?: DateValue | null
): DateValue {
  const halfDuration: DateDuration = {};
  for (const [unit, amount] of Object.entries(duration)) {
    if (amount === undefined) {
      continue;
    }

    const half = Math.floor(amount / 2);
    if (half > 0 && amount % 2 === 0) {
      (halfDuration as Record<string, number>)[unit] = half - 1;
    } else {
      (halfDuration as Record<string, number>)[unit] = half;
    }
  }

  const aligned = alignStart(date, duration, locale).subtract(halfDuration);
  return constrainStart(date, aligned, duration, locale, minValue, maxValue);
}

export function constrainStart(
  date: DateValue,
  aligned: DateValue,
  duration: DateDuration,
  locale: string,
  minValue?: DateValue | null,
  maxValue?: DateValue | null
): DateValue {
  let nextAligned = aligned;

  if (minValue && date.compare(minValue) >= 0) {
    const next = maxDate(
      nextAligned as never,
      alignStart(minValue, duration, locale) as never
    );
    if (next) {
      nextAligned = asDateValue(next);
    }
  }

  if (maxValue && date.compare(maxValue) <= 0) {
    const next = minDate(
      nextAligned as never,
      alignEnd(maxValue, duration, locale) as never
    );
    if (next) {
      nextAligned = asDateValue(next);
    }
  }

  return nextAligned;
}

export function getVisibleRangeEnd(
  startDate: DateValue,
  visibleDuration: DateDuration
): DateValue {
  const duration = { ...visibleDuration };
  if (duration.days) {
    duration.days -= 1;
  } else {
    duration.days = -1;
  }

  return startDate.add(duration);
}

export function unitDuration(duration: DateDuration): DateDuration {
  const unit = { ...duration };
  for (const key of Object.keys(unit)) {
    (unit as Record<string, number | undefined>)[key] = 1;
  }
  return unit;
}

export function previousAvailableDate(
  date: DateValue,
  minValue: DateValue,
  isDateUnavailable?: (date: DateValue) => boolean
): DateValue | null {
  if (!isDateUnavailable) {
    return date;
  }

  let nextDate = date;
  while (nextDate.compare(minValue) >= 0 && isDateUnavailable(nextDate)) {
    nextDate = nextDate.subtract({ days: 1 });
  }

  if (nextDate.compare(minValue) >= 0) {
    return nextDate;
  }

  return null;
}

export function convertDateValue(
  nextValue: DateValue,
  previousValue?: DateValue | null
): DateValue {
  const converted = asDateValue(
    toCalendar(nextValue as never, previousValue?.calendar ?? new GregorianCalendar())
  );

  if (
    previousValue &&
    previousValue.hour !== undefined &&
    typeof previousValue.set === "function"
  ) {
    return previousValue.set({
      era: converted.era,
      year: converted.year,
      month: converted.month,
      day: converted.day,
    });
  }

  return converted;
}

export function maxBound(
  first: DateValue | null,
  second: DateValue | null
): DateValue | null {
  if (!first) {
    return second;
  }

  if (!second) {
    return first;
  }

  return first.compare(second) >= 0 ? first : second;
}

export function minBound(
  first: DateValue | null,
  second: DateValue | null
): DateValue | null {
  if (!first) {
    return second;
  }

  if (!second) {
    return first;
  }

  return first.compare(second) <= 0 ? first : second;
}

export function endOfSection(date: DateValue, duration: DateDuration, locale: string): DateValue {
  if (duration.days) {
    return date;
  }

  if (duration.weeks) {
    return asDateValue(endOfWeek(date as never, locale));
  }

  return asDateValue(endOfMonth(date as never));
}
