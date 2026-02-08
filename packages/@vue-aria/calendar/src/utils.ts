import { computed, toValue } from "vue";
import type {
  CalendarDateLike,
  CalendarHookData,
  CalendarRangeValue,
  UseCalendarBaseState,
} from "./types";

export const hookData: WeakMap<object, CalendarHookData> = new WeakMap();

export function compareDates(a: CalendarDateLike, b: CalendarDateLike): number {
  if (typeof a.compare === "function") {
    return a.compare(b);
  }

  const aValue = a.toString();
  const bValue = b.toString();
  if (aValue === bValue) {
    return 0;
  }
  return aValue < bValue ? -1 : 1;
}

export function isSameDate(a: CalendarDateLike | null | undefined, b: CalendarDateLike | null | undefined): boolean {
  if (!a || !b) {
    return false;
  }
  return compareDates(a, b) === 0;
}

export function isDateInRange(
  date: CalendarDateLike,
  range: CalendarRangeValue | null | undefined
): boolean {
  if (!range) {
    return false;
  }

  return compareDates(date, range.start) >= 0 && compareDates(date, range.end) <= 0;
}

function formatDate(date: CalendarDateLike | null | undefined): string {
  if (!date) {
    return "";
  }
  return date.toString();
}

export function useVisibleRangeDescription(state: UseCalendarBaseState) {
  return computed(() => {
    const range = toValue(state.visibleRange);
    return `${formatDate(range.start)} - ${formatDate(range.end)}`;
  });
}

export function useSelectedDateDescription(state: UseCalendarBaseState) {
  return computed(() => {
    const value = state.value === undefined ? undefined : toValue(state.value);
    if (!value) {
      return "";
    }

    if (
      typeof value === "object" &&
      "start" in value &&
      "end" in value &&
      value.start &&
      value.end
    ) {
      return `Selected range: ${formatDate(value.start)} - ${formatDate(value.end)}`;
    }

    return `Selected date: ${formatDate(value as CalendarDateLike)}`;
  });
}
