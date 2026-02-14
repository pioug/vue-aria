import { CalendarDate, createCalendar } from "@internationalized/date";
import { effectScope } from "vue";
import { describe, expect, it } from "vitest";
import { useRangeCalendarState } from "../src/useRangeCalendarState";

describe("useRangeCalendarState", () => {
  it("uses anchor selection flow to commit a range", () => {
    const scope = effectScope();
    const state = scope.run(() =>
      useRangeCalendarState({
        locale: "en-US",
        createCalendar,
        defaultFocusedValue: new CalendarDate(2024, 5, 10),
      })
    )!;

    state.selectDate(new CalendarDate(2024, 5, 10));
    expect(state.anchorDate?.toString()).toBe("2024-05-10");
    expect(state.value).toBeNull();

    state.selectDate(new CalendarDate(2024, 5, 14));
    expect(state.anchorDate).toBeNull();
    expect(state.value?.start.toString()).toBe("2024-05-10");
    expect(state.value?.end.toString()).toBe("2024-05-14");

    scope.stop();
  });

  it("constrains range selection to contiguous available dates", () => {
    const scope = effectScope();
    const state = scope.run(() =>
      useRangeCalendarState({
        locale: "en-US",
        createCalendar,
        defaultFocusedValue: new CalendarDate(2024, 5, 10),
        visibleDuration: { weeks: 2 },
        isDateUnavailable: (date) => date.day === 12,
      })
    )!;

    state.selectDate(new CalendarDate(2024, 5, 10));
    state.selectDate(new CalendarDate(2024, 5, 14));

    expect(state.value?.start.toString()).toBe("2024-05-10");
    expect(state.value?.end.toString()).toBe("2024-05-11");

    scope.stop();
  });

  it("highlights and focuses dates while an anchor is active", () => {
    const scope = effectScope();
    const state = scope.run(() =>
      useRangeCalendarState({
        locale: "en-US",
        createCalendar,
        defaultFocusedValue: new CalendarDate(2024, 7, 4),
      })
    )!;

    state.selectDate(new CalendarDate(2024, 7, 4));
    state.highlightDate(new CalendarDate(2024, 7, 8));

    expect(state.focusedDate.toString()).toBe("2024-07-08");
    expect(state.highlightedRange?.start.toString()).toBe("2024-07-04");
    expect(state.highlightedRange?.end.toString()).toBe("2024-07-08");

    scope.stop();
  });
});
