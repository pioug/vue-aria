import { CalendarDate, createCalendar, parseDateTime } from "@internationalized/date";
import { effectScope, nextTick } from "vue";
import { describe, expect, it } from "vitest";
import { useCalendarState } from "../src/useCalendarState";

function toIso(date: CalendarDate) {
  return date.toString();
}

describe("useCalendarState", () => {
  it("updates focused date and visible range when moving between days", async () => {
    const scope = effectScope();
    const state = scope.run(() =>
      useCalendarState({
        locale: "en-US",
        createCalendar,
        defaultValue: new CalendarDate(2019, 6, 5),
        visibleDuration: { days: 3 },
      })
    )!;

    expect(toIso(state.focusedDate)).toBe("2019-06-05");
    expect(toIso(state.visibleRange.start)).toBe("2019-06-04");
    expect(toIso(state.visibleRange.end)).toBe("2019-06-06");

    state.focusPreviousDay();
    await nextTick();
    expect(toIso(state.focusedDate)).toBe("2019-06-04");
    expect(toIso(state.visibleRange.start)).toBe("2019-06-04");
    expect(toIso(state.visibleRange.end)).toBe("2019-06-06");

    state.focusPreviousDay();
    await nextTick();
    expect(toIso(state.focusedDate)).toBe("2019-06-03");
    expect(toIso(state.visibleRange.start)).toBe("2019-06-01");
    expect(toIso(state.visibleRange.end)).toBe("2019-06-03");

    scope.stop();
  });

  it("supports visible and single page behaviors", () => {
    const visibleScope = effectScope();
    const visibleState = visibleScope.run(() =>
      useCalendarState({
        locale: "en-US",
        createCalendar,
        defaultValue: new CalendarDate(2019, 1, 1),
        visibleDuration: { months: 2 },
      })
    )!;

    expect(toIso(visibleState.visibleRange.start)).toBe("2019-01-01");
    expect(toIso(visibleState.visibleRange.end)).toBe("2019-02-28");
    visibleState.focusNextPage();
    expect(toIso(visibleState.visibleRange.start)).toBe("2019-03-01");
    expect(toIso(visibleState.visibleRange.end)).toBe("2019-04-30");
    visibleScope.stop();

    const singleScope = effectScope();
    const singleState = singleScope.run(() =>
      useCalendarState({
        locale: "en-US",
        createCalendar,
        defaultValue: new CalendarDate(2019, 1, 1),
        visibleDuration: { months: 2 },
        pageBehavior: "single",
      })
    )!;

    expect(toIso(singleState.visibleRange.start)).toBe("2019-01-01");
    expect(toIso(singleState.visibleRange.end)).toBe("2019-02-28");
    singleState.focusNextPage();
    expect(toIso(singleState.visibleRange.start)).toBe("2019-02-01");
    expect(toIso(singleState.visibleRange.end)).toBe("2019-03-31");
    singleScope.stop();
  });

  it("preserves time components when selecting a new date", () => {
    let emitted: unknown;
    const scope = effectScope();
    const state = scope.run(() =>
      useCalendarState({
        locale: "en-US",
        createCalendar,
        defaultValue: parseDateTime("2020-02-03T10:30:00"),
        onChange: (value) => {
          emitted = value;
        },
      })
    )!;

    state.selectDate(new CalendarDate(2020, 2, 8));

    expect(state.value?.toString()).toBe("2020-02-08");
    const raw = emitted as { hour?: number; minute?: number; toString(): string };
    expect(raw?.toString()).toBe("2020-02-08T10:30:00");
    expect(raw?.hour).toBe(10);
    expect(raw?.minute).toBe(30);

    scope.stop();
  });

  it("returns week rows with null placeholders", () => {
    const scope = effectScope();
    const state = scope.run(() =>
      useCalendarState({
        locale: "en-US",
        createCalendar,
        defaultValue: new CalendarDate(2024, 1, 1),
      })
    )!;

    const week = state.getDatesInWeek(0);
    expect(week).toHaveLength(7);
    expect(week[0]?.toString()).toBe("2023-12-31");
    expect(week[1]?.toString()).toBe("2024-01-01");

    scope.stop();
  });
});
