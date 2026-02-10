import { parseDate, parseTime, toCalendarDate } from "@internationalized/date";
import type { TimeValue } from "@vue-aria/datepicker-state";
import type { DateValue } from "@vue-aria/calendar-state";

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatDateValue(value: DateValue | null | undefined): string {
  if (!value) {
    return "";
  }

  try {
    return toCalendarDate(value as never).toString();
  } catch {
    return String(value.toString()).slice(0, 10);
  }
}

export function parseDateValue(rawValue: string): DateValue | null {
  if (rawValue.trim().length === 0) {
    return null;
  }

  try {
    return parseDate(rawValue) as unknown as DateValue;
  } catch {
    return null;
  }
}

function normalizeTimeLike(value: unknown): {
  hour?: number;
  minute?: number;
  second?: number;
  toString?: () => string;
} {
  if (!value || typeof value !== "object") {
    return {};
  }

  return value as {
    hour?: number;
    minute?: number;
    second?: number;
    toString?: () => string;
  };
}

export function formatTimeValue(
  value: TimeValue | DateValue | null | undefined,
  granularity: "day" | "hour" | "minute" | "second" | undefined
): string {
  if (!value) {
    return "";
  }

  const timeLike = normalizeTimeLike(value);
  if (
    typeof timeLike.hour === "number" &&
    typeof timeLike.minute === "number"
  ) {
    const base = `${pad2(timeLike.hour)}:${pad2(timeLike.minute)}`;
    if (granularity === "second") {
      return `${base}:${pad2(timeLike.second ?? 0)}`;
    }
    return base;
  }

  const raw = String(value.toString?.() ?? "");
  if (raw.length === 0) {
    return "";
  }

  if (/^\d{2}:\d{2}:\d{2}/.test(raw)) {
    return granularity === "second" ? raw.slice(0, 8) : raw.slice(0, 5);
  }

  if (/^\d{2}:\d{2}/.test(raw)) {
    return raw.slice(0, 5);
  }

  return "";
}

export function parseTimeValue(
  rawValue: string,
  granularity: "day" | "hour" | "minute" | "second" | undefined
): TimeValue | null {
  if (rawValue.trim().length === 0) {
    return null;
  }

  const normalized =
    granularity === "second" && /^\d{2}:\d{2}$/.test(rawValue)
      ? `${rawValue}:00`
      : rawValue;

  try {
    return parseTime(normalized) as unknown as TimeValue;
  } catch {
    return null;
  }
}
