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

  it("handles section navigation for week and month durations", () => {
    const weekScope = effectScope();
    const weekState = weekScope.run(() =>
      useCalendarState({
        locale: "en-US",
        createCalendar,
        defaultValue: new CalendarDate(2019, 6, 5),
        visibleDuration: { weeks: 1 },
      })
    )!;

    weekState.focusSectionStart();
    expect(toIso(weekState.focusedDate)).toBe("2019-06-02");
    weekState.focusSectionEnd();
    expect(toIso(weekState.focusedDate)).toBe("2019-06-08");
    weekState.focusNextSection(false);
    expect(toIso(weekState.focusedDate)).toBe("2019-06-15");
    weekState.focusPreviousSection(false);
    expect(toIso(weekState.focusedDate)).toBe("2019-06-08");
    weekState.focusNextSection(true);
    expect(toIso(weekState.focusedDate)).toBe("2019-07-08");
    weekState.focusPreviousSection(true);
    expect(toIso(weekState.focusedDate)).toBe("2019-06-08");
    weekScope.stop();

    const monthScope = effectScope();
    const monthState = monthScope.run(() =>
      useCalendarState({
        locale: "en-US",
        createCalendar,
        defaultValue: new CalendarDate(2019, 6, 5),
        visibleDuration: { months: 1 },
      })
    )!;

    monthState.focusSectionStart();
    expect(toIso(monthState.focusedDate)).toBe("2019-06-01");
    monthState.focusSectionEnd();
    expect(toIso(monthState.focusedDate)).toBe("2019-06-30");
    monthState.focusNextSection(false);
    expect(toIso(monthState.focusedDate)).toBe("2019-07-30");
    monthState.focusPreviousSection(false);
    expect(toIso(monthState.focusedDate)).toBe("2019-06-30");
    monthState.focusNextSection(true);
    expect(toIso(monthState.focusedDate)).toBe("2020-06-30");
    monthState.focusPreviousSection(true);
    expect(toIso(monthState.focusedDate)).toBe("2019-06-30");
    monthScope.stop();
  });

  it("guards selection for unavailable, read-only, and disabled states", () => {
    const unavailableScope = effectScope();
    const unavailableState = unavailableScope.run(() =>
      useCalendarState({
        locale: "en-US",
        createCalendar,
        defaultFocusedValue: new CalendarDate(2024, 1, 10),
        isDateUnavailable: (date) => date.day === 10,
      })
    )!;

    unavailableState.selectFocusedDate();
    expect(unavailableState.value).toBeNull();
    unavailableState.selectDate(new CalendarDate(2024, 1, 11));
    expect(toIso(unavailableState.value!)).toBe("2024-01-11");
    unavailableScope.stop();

    const readOnlyScope = effectScope();
    const readOnlyState = readOnlyScope.run(() =>
      useCalendarState({
        locale: "en-US",
        createCalendar,
        defaultValue: new CalendarDate(2024, 1, 5),
        isReadOnly: true,
      })
    )!;

    readOnlyState.selectDate(new CalendarDate(2024, 1, 8));
    expect(toIso(readOnlyState.value!)).toBe("2024-01-05");
    readOnlyScope.stop();

    const disabledScope = effectScope();
    const disabledState = disabledScope.run(() =>
      useCalendarState({
        locale: "en-US",
        createCalendar,
        defaultValue: new CalendarDate(2024, 1, 5),
        isDisabled: true,
      })
    )!;

    disabledState.selectDate(new CalendarDate(2024, 1, 8));
    expect(toIso(disabledState.value!)).toBe("2024-01-05");
    disabledScope.stop();
  });

  it("reports next/previous range invalidity at min and max boundaries", () => {
    const boundedScope = effectScope();
    const boundedState = boundedScope.run(() =>
      useCalendarState({
        locale: "en-US",
        createCalendar,
        defaultValue: new CalendarDate(2024, 1, 15),
        visibleDuration: { months: 1 },
        minValue: new CalendarDate(2024, 1, 1),
        maxValue: new CalendarDate(2024, 1, 31),
      })
    )!;

    expect(boundedState.isPreviousVisibleRangeInvalid()).toBe(true);
    expect(boundedState.isNextVisibleRangeInvalid()).toBe(true);
    boundedScope.stop();

    const unboundedScope = effectScope();
    const unboundedState = unboundedScope.run(() =>
      useCalendarState({
        locale: "en-US",
        createCalendar,
        defaultValue: new CalendarDate(2024, 1, 15),
        visibleDuration: { months: 1 },
        minValue: new CalendarDate(2023, 12, 1),
        maxValue: new CalendarDate(2024, 2, 29),
      })
    )!;

    expect(unboundedState.isPreviousVisibleRangeInvalid()).toBe(false);
    expect(unboundedState.isNextVisibleRangeInvalid()).toBe(false);
    unboundedScope.stop();
  });
});
