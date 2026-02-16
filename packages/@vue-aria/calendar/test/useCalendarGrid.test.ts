import { CalendarDate, createCalendar } from "@internationalized/date";
import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useCalendarState } from "@vue-stately/calendar";
import { useCalendar } from "../src/useCalendar";
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

  it("labels visible ranges for full and per-month grids", () => {
    const scope = effectScope();
    let fullGrid!: ReturnType<typeof useCalendarGrid>;
    let firstGrid!: ReturnType<typeof useCalendarGrid>;
    let secondGrid!: ReturnType<typeof useCalendarGrid>;
    let thirdGrid!: ReturnType<typeof useCalendarGrid>;

    scope.run(() => {
      const state = useCalendarState({
        locale: "en-US",
        createCalendar,
        defaultValue: new CalendarDate(2019, 6, 5),
        visibleDuration: { months: 3 },
      });

      useCalendar({ "aria-label": "Calendar" }, state);

      const firstStart = state.visibleRange.start;
      const secondStart = firstStart.add({ months: 1 });
      const thirdStart = secondStart.add({ months: 1 });

      fullGrid = useCalendarGrid({}, state);
      firstGrid = useCalendarGrid(
        {
          startDate: firstStart,
          endDate: firstStart.add({ months: 1 }).subtract({ days: 1 }),
        },
        state
      );
      secondGrid = useCalendarGrid(
        {
          startDate: secondStart,
          endDate: secondStart.add({ months: 1 }).subtract({ days: 1 }),
        },
        state
      );
      thirdGrid = useCalendarGrid(
        {
          startDate: thirdStart,
          endDate: thirdStart.add({ months: 1 }).subtract({ days: 1 }),
        },
        state
      );
    });

    expect((fullGrid.gridProps["aria-label"] as string) || "").toMatch(
      /Calendar, (May.*July 2019|\{startDate\} to \{endDate\})/
    );
    expect(firstGrid.gridProps["aria-label"]).toBe("Calendar, May 2019");
    expect(secondGrid.gridProps["aria-label"]).toBe("Calendar, June 2019");
    expect(thirdGrid.gridProps["aria-label"]).toBe("Calendar, July 2019");

    scope.stop();
  });
});
