import { CalendarDate } from "@internationalized/date";
import { describe, expect, it, vi } from "vitest";
import { useCalendarGrid } from "../src/useCalendarGrid";

function createGridState() {
  return {
    visibleRange: {
      start: new CalendarDate(2024, 1, 1),
      end: new CalendarDate(2024, 1, 31),
    },
    timeZone: "UTC",
    isReadOnly: false,
    isDisabled: false,
    selectFocusedDate: vi.fn(),
    focusPreviousSection: vi.fn(),
    focusNextSection: vi.fn(),
    focusSectionEnd: vi.fn(),
    focusSectionStart: vi.fn(),
    focusPreviousDay: vi.fn(),
    focusNextDay: vi.fn(),
    focusPreviousRow: vi.fn(),
    focusNextRow: vi.fn(),
    setAnchorDate: vi.fn(),
    setFocused: vi.fn(),
  };
}

describe("useCalendarGrid", () => {
  it("maps keyboard interactions to state navigation methods", () => {
    const state = createGridState();
    const { gridProps } = useCalendarGrid({}, state as any);

    const onKeydown = gridProps.onKeydown as (event: KeyboardEvent) => void;
    expect(typeof onKeydown).toBe("function");

    onKeydown(new KeyboardEvent("keydown", { key: "Enter" }));
    onKeydown(new KeyboardEvent("keydown", { key: "PageUp", shiftKey: true }));
    onKeydown(new KeyboardEvent("keydown", { key: "PageDown" }));
    onKeydown(new KeyboardEvent("keydown", { key: "Home" }));
    onKeydown(new KeyboardEvent("keydown", { key: "End" }));
    onKeydown(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    onKeydown(new KeyboardEvent("keydown", { key: "ArrowUp" }));
    onKeydown(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    onKeydown(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    onKeydown(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(state.selectFocusedDate).toHaveBeenCalledTimes(1);
    expect(state.focusPreviousSection).toHaveBeenCalledWith(true);
    expect(state.focusNextSection).toHaveBeenCalledWith(false);
    expect(state.focusSectionStart).toHaveBeenCalledTimes(1);
    expect(state.focusSectionEnd).toHaveBeenCalledTimes(1);
    expect(state.focusPreviousDay).toHaveBeenCalledTimes(1);
    expect(state.focusNextDay).toHaveBeenCalledTimes(1);
    expect(state.focusPreviousRow).toHaveBeenCalledTimes(1);
    expect(state.focusNextRow).toHaveBeenCalledTimes(1);
    expect(state.setAnchorDate).toHaveBeenCalledWith(null);
  });

  it("computes weekdays and weeks in month", () => {
    const state = createGridState();
    const { weekDays, weeksInMonth, headerProps } = useCalendarGrid(
      { firstDayOfWeek: "mon" },
      state as any
    );

    expect(weekDays).toHaveLength(7);
    expect(weeksInMonth).toBeGreaterThan(3);
    expect(headerProps["aria-hidden"]).toBe(true);
  });
});
