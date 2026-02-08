import { describe, expect, it, vi } from "vitest";
import { parseDate } from "@internationalized/date";
import { ref } from "vue";
import { useRangeCalendarState } from "../src";

describe("useRangeCalendarState", () => {
  it("creates anchor on first select and commits range on second select", () => {
    const state = useRangeCalendarState({
      defaultFocusedValue: parseDate("2026-02-08"),
    });

    state.selectDate(parseDate("2026-02-08"));
    expect(state.anchorDate.value?.toString()).toBe("2026-02-08");
    expect(state.highlightedRange.value?.start.toString()).toBe("2026-02-08");

    state.selectDate(parseDate("2026-02-12"));
    expect(state.anchorDate.value).toBeNull();
    expect(state.value.value?.start.toString()).toBe("2026-02-08");
    expect(state.value.value?.end.toString()).toBe("2026-02-12");
  });

  it("supports controlled range value updates", () => {
    const controlled = ref({
      start: parseDate("2026-02-01"),
      end: parseDate("2026-02-03"),
    });
    const state = useRangeCalendarState({
      value: controlled,
      onChange: (nextRange) => {
        if (nextRange) {
          controlled.value = nextRange;
        }
      },
    });

    state.selectDate(parseDate("2026-02-05"));
    state.selectDate(parseDate("2026-02-07"));

    expect(controlled.value.start.toString()).toBe("2026-02-05");
    expect(controlled.value.end.toString()).toBe("2026-02-07");
  });

  it("updates focused date while hovering after anchor selection", () => {
    const state = useRangeCalendarState({
      defaultFocusedValue: parseDate("2026-02-08"),
    });

    state.selectDate(parseDate("2026-02-08"));
    state.highlightDate(parseDate("2026-02-10"));

    expect(state.focusedDate.value.toString()).toBe("2026-02-10");
    expect(state.highlightedRange.value?.start.toString()).toBe("2026-02-08");
    expect(state.highlightedRange.value?.end.toString()).toBe("2026-02-10");
  });

  it("enforces contiguous-range unavailable boundaries by default", () => {
    const state = useRangeCalendarState({
      defaultFocusedValue: parseDate("2026-02-08"),
      isDateUnavailable: (date) => date.toString() === "2026-02-10",
    });

    state.selectDate(parseDate("2026-02-08"));
    expect(state.isInvalid(parseDate("2026-02-09"))).toBe(false);
    expect(state.isInvalid(parseDate("2026-02-12"))).toBe(true);
  });

  it("allows non-contiguous ranges when configured", () => {
    const state = useRangeCalendarState({
      defaultFocusedValue: parseDate("2026-02-08"),
      isDateUnavailable: (date) => date.toString() === "2026-02-10",
      allowsNonContiguousRanges: true,
    });

    state.selectDate(parseDate("2026-02-08"));
    expect(state.isInvalid(parseDate("2026-02-12"))).toBe(false);
  });

  it("marks invalid value state when selected range endpoints are unavailable", () => {
    const state = useRangeCalendarState({
      defaultValue: {
        start: parseDate("2026-02-08"),
        end: parseDate("2026-02-10"),
      },
      isDateUnavailable: (date) => date.toString() === "2026-02-10",
    });

    expect(state.isValueInvalid.value).toBe(true);
    expect(state.validationState.value).toBe("invalid");
  });
});
