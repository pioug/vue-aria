import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { hookData, useCalendarCell } from "../src";
import type { CalendarDateLike, UseCalendarState } from "../src/types";

interface CellHandlers {
  onFocus?: () => void;
  onPointerdown?: (event: PointerEvent) => void;
  onPointerup?: (event: PointerEvent) => void;
  onPointerenter?: (event: PointerEvent) => void;
}

function createDate(value: string, day: number): CalendarDateLike {
  return {
    day,
    toString: () => value,
    compare(other) {
      const otherValue = other.toString();
      if (value === otherValue) {
        return 0;
      }
      return value < otherValue ? -1 : 1;
    },
  };
}

function createPointerEvent(type: "pointerdown" | "pointerup" | "pointerenter"): PointerEvent {
  return new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    pointerType: "mouse",
    button: 0,
    pointerId: 1,
  });
}

describe("useCalendarCell", () => {
  it("returns calendar cell semantics and selection behavior", () => {
    const date = createDate("2026-02-08", 8);
    const setFocused = vi.fn();
    const setFocusedDate = vi.fn();
    const selectDate = vi.fn();
    const highlightDate = vi.fn();

    const state: UseCalendarState = {
      visibleRange: ref({ start: createDate("2026-02-01", 1), end: createDate("2026-02-28", 28) }),
      focusedDate: ref(date),
      value: ref(date),
      highlightedRange: ref(null),
      isFocused: ref(false),
      isReadOnly: ref(false),
      isDragging: ref(false),
      anchorDate: ref(null),
      isValueInvalid: ref(true),
      minValue: ref(undefined),
      maxValue: ref(undefined),
      isNextVisibleRangeInvalid: () => false,
      isPreviousVisibleRangeInvalid: () => false,
      focusNextPage: vi.fn(),
      focusPreviousPage: vi.fn(),
      setFocused,
      isSelected: (candidate) => candidate.toString() === date.toString(),
      isCellFocused: (candidate) => candidate.toString() === date.toString(),
      isCellDisabled: () => false,
      isCellUnavailable: () => false,
      selectDate,
      setFocusedDate,
      highlightDate,
      setAnchorDate: vi.fn(),
      setDragging: vi.fn(),
      selectFocusedDate: vi.fn(),
      isInvalid: () => false,
    };

    hookData.set(state as object, {
      errorMessageId: "calendar-error-id",
      selectedDateDescription: "Selected date: 2026-02-08",
    });

    const cellElement = document.createElement("button");
    document.body.appendChild(cellElement);

    const { cellProps, buttonProps, isSelected, isFocused, isInvalid, formattedDate } =
      useCalendarCell(
        {
          date,
        },
        state,
        cellElement
      );

    expect(cellProps.value.role).toBe("gridcell");
    expect(buttonProps.value.role).toBe("button");
    expect(isSelected.value).toBe(true);
    expect(isFocused.value).toBe(true);
    expect(isInvalid.value).toBe(true);
    expect(formattedDate.value).toBe("8");
    expect(buttonProps.value["aria-describedby"]).toContain("calendar-error-id");

    const handlers = buttonProps.value as CellHandlers;
    handlers.onFocus?.();
    expect(setFocused).toHaveBeenCalledWith(true);
    expect(setFocusedDate).toHaveBeenCalledWith(date);

    handlers.onPointerdown?.(createPointerEvent("pointerdown"));
    handlers.onPointerup?.(createPointerEvent("pointerup"));
    expect(selectDate).toHaveBeenCalledWith(date);

    handlers.onPointerenter?.(createPointerEvent("pointerenter"));
    expect(highlightDate).toHaveBeenCalledWith(date);
  });
});
