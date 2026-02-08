import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useRangeCalendar } from "../src";
import type { CalendarDateLike, UseRangeCalendarState } from "../src/types";

function createDate(value: string): CalendarDateLike {
  return {
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

describe("useRangeCalendar", () => {
  it("adds range-specific pointer/blur/touch semantics", () => {
    const start = createDate("2026-02-01");
    const end = createDate("2026-02-28");

    const setDragging = vi.fn();
    const selectFocusedDate = vi.fn();

    const state: UseRangeCalendarState = {
      visibleRange: ref({ start, end }),
      value: ref({ start, end }),
      highlightedRange: ref({ start, end }),
      isFocused: ref(false),
      anchorDate: ref(start),
      isDragging: ref(true),
      isNextVisibleRangeInvalid: () => false,
      isPreviousVisibleRangeInvalid: () => false,
      focusNextPage: vi.fn(),
      focusPreviousPage: vi.fn(),
      setFocused: vi.fn(),
      setDragging,
      selectFocusedDate,
    };

    const root = document.createElement("div");
    const inside = document.createElement("button");
    root.appendChild(inside);
    document.body.appendChild(root);

    const { calendarProps } = useRangeCalendar(
      {
        "aria-label": "Range calendar",
      },
      state,
      root
    );

    (calendarProps.value.onPointerup as (() => void) | undefined)?.();
    expect(setDragging).toHaveBeenCalledWith(false);

    const preventDefault = vi.fn();
    (calendarProps.value.onTouchmove as ((event: TouchEvent) => void) | undefined)?.(
      {
        preventDefault,
      } as unknown as TouchEvent
    );
    expect(preventDefault).toHaveBeenCalledTimes(1);

    (calendarProps.value.onBlur as ((event: FocusEvent) => void) | undefined)?.(
      new FocusEvent("blur", { relatedTarget: null })
    );
    expect(selectFocusedDate).toHaveBeenCalledTimes(1);

    (calendarProps.value.onBlur as ((event: FocusEvent) => void) | undefined)?.(
      new FocusEvent("blur", { relatedTarget: inside })
    );
    expect(selectFocusedDate).toHaveBeenCalledTimes(1);
  });
});
