import { useCalendarBase } from "./useCalendarBase";
import type { UseCalendarBaseOptions, UseCalendarBaseState } from "./types";

export function useCalendar(
  options: UseCalendarBaseOptions,
  state: UseCalendarBaseState
) {
  return useCalendarBase(options, state);
}
