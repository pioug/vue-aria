import { describe, expect, it, vi } from "vitest";
import { parseDate } from "@internationalized/date";
import { ref } from "vue";
import { useCalendarState } from "../src";

describe("useCalendarState", () => {
  it("initializes from default value and supports focused selection", () => {
    const onChange = vi.fn();
    const state = useCalendarState({
      defaultValue: parseDate("2026-02-08"),
      onChange,
    });

    expect(state.value.value?.toString()).toBe("2026-02-08");

    state.focusNextDay();
    state.selectFocusedDate();

    expect(state.value.value?.toString()).toBe("2026-02-09");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("supports controlled value updates", () => {
    const controlled = ref(parseDate("2026-02-08"));
    const state = useCalendarState({
      value: controlled,
      onChange: (nextValue) => {
        if (nextValue) {
          controlled.value = nextValue;
        }
      },
    });

    state.selectDate(parseDate("2026-02-12"));
    expect(controlled.value.toString()).toBe("2026-02-12");
    expect(state.value.value?.toString()).toBe("2026-02-12");
  });

  it("constrains focused date and reports invalid dates by min/max", () => {
    const state = useCalendarState({
      defaultFocusedValue: parseDate("2026-02-01"),
      minValue: parseDate("2026-02-05"),
      maxValue: parseDate("2026-02-20"),
    });

    expect(state.focusedDate.value.toString()).toBe("2026-02-05");
    expect(state.isInvalid(parseDate("2026-02-01"))).toBe(true);
    expect(state.isInvalid(parseDate("2026-02-10"))).toBe(false);
    expect(state.isInvalid(parseDate("2026-02-21"))).toBe(true);
  });

  it("uses pageBehavior=single to move by one unit even with larger visible duration", () => {
    const state = useCalendarState({
      defaultFocusedValue: parseDate("2026-02-15"),
      visibleDuration: { months: 2 },
      pageBehavior: "single",
    });

    state.focusNextPage();
    expect(state.focusedDate.value.toString()).toBe("2026-03-15");
  });

  it("skips selecting unavailable focused dates", () => {
    const onChange = vi.fn();
    const state = useCalendarState({
      defaultFocusedValue: parseDate("2026-02-10"),
      isDateUnavailable: (date) => date.toString() === "2026-02-10",
      onChange,
    });

    state.selectFocusedDate();

    expect(onChange).toHaveBeenCalledTimes(0);
    expect(state.value.value).toBeNull();
  });

  it("returns a 7-day array from getDatesInWeek", () => {
    const state = useCalendarState({
      defaultFocusedValue: parseDate("2026-02-11"),
      visibleDuration: { weeks: 1 },
    });

    const week = state.getDatesInWeek(0);
    expect(week).toHaveLength(7);
    expect(week.some((date) => date?.toString() === "2026-02-11")).toBe(true);
  });
});
