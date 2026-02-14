import {
  CalendarDate,
  type DateDuration,
  maxDate,
  minDate,
  startOfMonth,
  startOfWeek,
  startOfYear,
  toCalendarDate,
} from "@internationalized/date";
import type { DateValue } from "./types";

export function isInvalid(
  date: DateValue,
  minValue?: DateValue | null,
  maxValue?: DateValue | null
): boolean {
  return (minValue != null && date.compare(minValue) < 0)
    || (maxValue != null && date.compare(maxValue) > 0);
}

export function alignCenter(
  date: CalendarDate,
  duration: DateDuration,
  locale: string,
  minValue?: DateValue | null,
  maxValue?: DateValue | null
): CalendarDate {
  const halfDuration: DateDuration = {};
  for (const key of Object.keys(duration) as Array<keyof DateDuration>) {
    const value = duration[key] ?? 0;
    const half = Math.floor(value / 2);
    halfDuration[key] = half > 0 && value % 2 === 0 ? half - 1 : half;
  }

  const aligned = alignStart(date, duration, locale).subtract(halfDuration);
  return constrainStart(date, aligned, duration, locale, minValue, maxValue);
}

export function alignStart(
  date: CalendarDate,
  duration: DateDuration,
  locale: string,
  minValue?: DateValue | null,
  maxValue?: DateValue | null
): CalendarDate {
  let aligned = date;
  if (duration.years) {
    aligned = startOfYear(date);
  } else if (duration.months) {
    aligned = startOfMonth(date);
  } else if (duration.weeks) {
    aligned = startOfWeek(date, locale);
  }

  return constrainStart(date, aligned, duration, locale, minValue, maxValue);
}

export function alignEnd(
  date: CalendarDate,
  duration: DateDuration,
  locale: string,
  minValue?: DateValue | null,
  maxValue?: DateValue | null
): CalendarDate {
  const adjusted: DateDuration = { ...duration };
  if (adjusted.days) {
    adjusted.days -= 1;
  } else if (adjusted.weeks) {
    adjusted.weeks -= 1;
  } else if (adjusted.months) {
    adjusted.months -= 1;
  } else if (adjusted.years) {
    adjusted.years -= 1;
  }

  const aligned = alignStart(date, duration, locale).subtract(adjusted);
  return constrainStart(date, aligned, duration, locale, minValue, maxValue);
}

export function constrainStart(
  date: CalendarDate,
  aligned: CalendarDate,
  duration: DateDuration,
  locale: string,
  minValue?: DateValue | null,
  maxValue?: DateValue | null
): CalendarDate {
  if (minValue && date.compare(minValue) >= 0) {
    const newDate = maxDate(
      aligned,
      alignStart(toCalendarDate(minValue), duration, locale)
    );
    if (newDate) {
      aligned = newDate;
    }
  }

  if (maxValue && date.compare(maxValue) <= 0) {
    const newDate = minDate(
      aligned,
      alignEnd(toCalendarDate(maxValue), duration, locale)
    );
    if (newDate) {
      aligned = newDate;
    }
  }

  return aligned;
}

export function constrainValue(
  date: CalendarDate,
  minValue?: DateValue | null,
  maxValue?: DateValue | null
): CalendarDate {
  if (minValue) {
    const newDate = maxDate(date, toCalendarDate(minValue));
    if (newDate) {
      date = newDate;
    }
  }

  if (maxValue) {
    const newDate = minDate(date, toCalendarDate(maxValue));
    if (newDate) {
      date = newDate;
    }
  }

  return date;
}

export function previousAvailableDate(
  date: CalendarDate,
  minValue: DateValue,
  isDateUnavailable?: (date: CalendarDate) => boolean
): CalendarDate | null {
  if (!isDateUnavailable) {
    return date;
  }

  while (date.compare(minValue) >= 0 && isDateUnavailable(date)) {
    date = date.subtract({ days: 1 });
  }

  if (date.compare(minValue) >= 0) {
    return date;
  }

  return null;
}
