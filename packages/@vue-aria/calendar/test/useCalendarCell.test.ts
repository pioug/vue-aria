import { CalendarDate, createCalendar } from "@internationalized/date";
import { effectScope } from "vue";
import { describe, expect, it } from "vitest";
import { useCalendarState, useRangeCalendarState } from "@vue-aria/calendar-state";
import { useCalendarCell } from "../src/useCalendarCell";

describe("useCalendarCell", () => {
  it("tracks selected and focused state for a single-date calendar cell", () => {
    const scope = effectScope();
    let state!: ReturnType<typeof useCalendarState>;
    let cell!: ReturnType<typeof useCalendarCell>;

    const button = document.createElement("button");
    document.body.appendChild(button);

    scope.run(() => {
      state = useCalendarState({
        locale: "en-US",
        createCalendar,
        defaultValue: new CalendarDate(2024, 1, 15),
      });

      const date = state.focusedDate;
      cell = useCalendarCell(
        { date },
        state,
        { current: button }
      );
    });

    expect(cell.cellProps.role).toBe("gridcell");
    expect(cell.isSelected).toBe(true);

    const onFocus = cell.buttonProps.onFocus as (() => void) | undefined;
    onFocus?.();
    expect(state.isFocused).toBe(true);

    scope.stop();
    button.remove();
  });

  it("highlights dates on pointer enter during range selection", () => {
    const scope = effectScope();
    let state!: ReturnType<typeof useRangeCalendarState>;
    let cell!: ReturnType<typeof useCalendarCell>;

    const button = document.createElement("button");
    document.body.appendChild(button);

    scope.run(() => {
      state = useRangeCalendarState({
        locale: "en-US",
        createCalendar,
        defaultFocusedValue: new CalendarDate(2024, 1, 10),
      });

      state.selectDate(new CalendarDate(2024, 1, 10));

      cell = useCalendarCell(
        { date: new CalendarDate(2024, 1, 12) },
        state,
        { current: button }
      );
    });

    const onPointerenter = cell.buttonProps.onPointerenter as
      | ((event: PointerEvent) => void)
      | undefined;

    onPointerenter?.({ pointerType: "mouse" } as PointerEvent);

    expect(state.focusedDate.toString()).toBe("2024-01-12");

    scope.stop();
    button.remove();
  });
});
