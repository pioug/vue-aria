import type {
  CalendarProps,
  CalendarState,
  DateValue,
} from "@vue-aria/calendar-state";
import type { CalendarAria } from "./useCalendarBase";
import { useCalendarBase } from "./useCalendarBase";

export interface AriaCalendarProps<T extends DateValue = DateValue>
  extends CalendarProps<T> {
  id?: string;
  errorMessage?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-details"?: string;
  [key: string]: unknown;
}

/**
 * Provides the behavior and accessibility implementation for a calendar component.
 */
export function useCalendar<T extends DateValue>(
  props: AriaCalendarProps<T>,
  state: CalendarState
): CalendarAria {
  return useCalendarBase(props, state);
}
