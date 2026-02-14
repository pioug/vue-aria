import { CalendarDate, createCalendar } from "@internationalized/date";
import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useCalendarState, useRangeCalendarState } from "@vue-aria/calendar-state";
import { useCalendarCell } from "../src/useCalendarCell";

function createPointerEvent(target: HTMLElement, pointerType = "mouse"): PointerEvent {
  return {
    button: 0,
    pointerId: 1,
    pointerType,
    currentTarget: target,
    target,
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    stopPropagation: () => {},
    preventDefault: () => {},
  } as unknown as PointerEvent;
}

function createMouseEvent(target: HTMLElement): MouseEvent {
  return {
    button: 0,
    detail: 1,
    currentTarget: target,
    target,
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    stopPropagation: () => {},
    preventDefault: () => {},
  } as unknown as MouseEvent;
}

function createKeyboardEvent(target: HTMLElement, key: string): KeyboardEvent {
  return {
    key,
    code: key,
    currentTarget: target,
    target,
    repeat: false,
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    stopPropagation: () => {},
    preventDefault: () => {},
  } as unknown as KeyboardEvent;
}

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

  it("adds start and finish range-selection prompts on the focused range cell", () => {
    const scope = effectScope();
    let state!: ReturnType<typeof useRangeCalendarState>;

    const button = document.createElement("button");
    document.body.appendChild(button);

    scope.run(() => {
      state = useRangeCalendarState({
        locale: "en-US",
        createCalendar,
        defaultFocusedValue: new CalendarDate(2024, 1, 10),
      });
      state.setFocused(true);
    });

    const focusedDate = state.focusedDate;
    const startCell = useCalendarCell(
      { date: focusedDate },
      state,
      { current: button }
    );

    const startDescriptionId = (startCell.buttonProps["aria-describedby"] as string | undefined)?.split(" ")[0];
    expect(startDescriptionId).toBeDefined();
    expect(document.getElementById(startDescriptionId!)?.textContent).toBe(
      "Click to start selecting date range"
    );

    state.selectDate(focusedDate);

    const finishCell = useCalendarCell(
      { date: focusedDate },
      state,
      { current: button }
    );

    const finishDescriptionId = (finishCell.buttonProps["aria-describedby"] as string | undefined)?.split(" ")[0];
    expect(finishDescriptionId).toBeDefined();
    expect(document.getElementById(finishDescriptionId!)?.textContent).toBe(
      "Click to finish selecting date range"
    );

    scope.stop();
    button.remove();
  });

  it("starts dragging from a highlighted range boundary and updates highlighted range on hover", () => {
    const scope = effectScope();
    let state!: ReturnType<typeof useRangeCalendarState>;
    let startCell!: ReturnType<typeof useCalendarCell>;
    let hoverCell!: ReturnType<typeof useCalendarCell>;

    const startButton = document.createElement("button");
    const hoverButton = document.createElement("button");
    document.body.appendChild(startButton);
    document.body.appendChild(hoverButton);

    scope.run(() => {
      state = useRangeCalendarState({
        locale: "en-US",
        createCalendar,
        defaultValue: {
          start: new CalendarDate(2024, 1, 10),
          end: new CalendarDate(2024, 1, 20),
        },
      });

      startCell = useCalendarCell(
        { date: new CalendarDate(2024, 1, 10) },
        state,
        { current: startButton }
      );

      hoverCell = useCalendarCell(
        { date: new CalendarDate(2024, 1, 11) },
        state,
        { current: hoverButton }
      );
    });

    const onPointerdown = startCell.buttonProps.onPointerdown as ((event: PointerEvent) => void) | undefined;
    const onMousedown = startCell.buttonProps.onMousedown as ((event: MouseEvent) => void) | undefined;
    if (onMousedown) {
      onMousedown(createMouseEvent(startButton));
    } else {
      onPointerdown?.(createPointerEvent(startButton, "mouse"));
    }

    expect(state.anchorDate?.toString()).toBe("2024-01-20");
    expect(state.isDragging).toBe(true);

    const onPointerenter = hoverCell.buttonProps.onPointerenter as ((event: PointerEvent) => void) | undefined;
    onPointerenter?.({ pointerType: "mouse" } as PointerEvent);

    expect(state.focusedDate.toString()).toBe("2024-01-11");
    expect(state.highlightedRange?.start.toString()).toBe("2024-01-11");
    expect(state.highlightedRange?.end.toString()).toBe("2024-01-20");

    scope.stop();
    startButton.remove();
    hoverButton.remove();
  });

  it("starts a range with keyboard press and auto-advances focus to next day", () => {
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

      cell = useCalendarCell(
        { date: new CalendarDate(2024, 1, 10) },
        state,
        { current: button }
      );
    });

    const onKeydown = cell.buttonProps.onKeydown as ((event: KeyboardEvent) => void) | undefined;
    const onKeyup = cell.buttonProps.onKeyup as ((event: KeyboardEvent) => void) | undefined;

    onKeydown?.(createKeyboardEvent(button, "Enter"));
    onKeyup?.(createKeyboardEvent(button, "Enter"));

    expect(state.anchorDate?.toString()).toBe("2024-01-10");
    expect(state.focusedDate.toString()).toBe("2024-01-11");

    scope.stop();
    button.remove();
  });

  it("releases pointer capture on pointerdown when supported by the target", () => {
    const scope = effectScope();
    let state!: ReturnType<typeof useCalendarState>;
    let cell!: ReturnType<typeof useCalendarCell>;

    const button = document.createElement("button");
    const releasePointerCapture = vi.fn();
    const hasPointerCapture = vi.fn(() => true);

    Object.defineProperty(button, "releasePointerCapture", {
      configurable: true,
      value: releasePointerCapture,
    });
    Object.defineProperty(button, "hasPointerCapture", {
      configurable: true,
      value: hasPointerCapture,
    });

    document.body.appendChild(button);

    scope.run(() => {
      state = useCalendarState({
        locale: "en-US",
        createCalendar,
        defaultValue: new CalendarDate(2024, 1, 10),
      });

      cell = useCalendarCell(
        { date: new CalendarDate(2024, 1, 10) },
        state,
        { current: button }
      );
    });

    const onPointerdown = cell.buttonProps.onPointerdown as ((event: PointerEvent) => void) | undefined;
    onPointerdown?.(createPointerEvent(button, "mouse"));

    expect(releasePointerCapture).toHaveBeenCalled();

    const onClick = cell.buttonProps.onClick as ((event: MouseEvent) => void) | undefined;
    onClick?.(createMouseEvent(button));

    scope.stop();
    button.remove();
  });
});
