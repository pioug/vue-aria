import { describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";
import { hookData, useCalendar } from "../src";
import type { CalendarDateLike, UseCalendarBaseState } from "../src/types";

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

describe("useCalendar", () => {
  it("returns base calendar semantics and paging button behavior", async () => {
    const start = createDate("2026-02-01");
    const end = createDate("2026-02-28");

    const nextInvalid = ref(false);
    const previousInvalid = ref(false);
    const focusNextPage = vi.fn();
    const focusPreviousPage = vi.fn();
    const setFocused = vi.fn();

    const state: UseCalendarBaseState = {
      visibleRange: ref({ start, end }),
      timeZone: ref("UTC"),
      isFocused: ref(false),
      value: ref(start),
      isNextVisibleRangeInvalid: () => nextInvalid.value,
      isPreviousVisibleRangeInvalid: () => previousInvalid.value,
      focusNextPage,
      focusPreviousPage,
      setFocused,
    };

    const { calendarProps, nextButtonProps, prevButtonProps, errorMessageProps, title } =
      useCalendar(
        {
          "aria-label": "Booking calendar",
          errorMessage: "Invalid",
          validationState: "invalid",
        },
        state
      );

    expect(calendarProps.value.role).toBe("application");
    expect(calendarProps.value["aria-label"]).toContain("Booking calendar");
    expect(title.value).toBe("2026-02-01 - 2026-02-28");

    (nextButtonProps.value.onPress as (() => void) | undefined)?.();
    (prevButtonProps.value.onPress as (() => void) | undefined)?.();

    expect(focusNextPage).toHaveBeenCalledTimes(1);
    expect(focusPreviousPage).toHaveBeenCalledTimes(1);

    const setNextFocus = nextButtonProps.value.onFocusChange as
      | ((isFocused: boolean) => void)
      | undefined;
    setNextFocus?.(true);
    nextInvalid.value = true;
    await nextTick();
    expect(setFocused).toHaveBeenCalledWith(true);

    expect(typeof errorMessageProps.value.id).toBe("string");

    const data = hookData.get(state as object);
    expect(data?.selectedDateDescription).toContain("Selected date:");
  });
});
