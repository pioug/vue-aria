import { CalendarDate, createCalendar } from "@internationalized/date";
import { effectScope } from "vue";
import { describe, expect, it } from "vitest";
import { useRangeCalendarState } from "@vue-aria/calendar-state";
import { useRangeCalendar } from "../src/useRangeCalendar";

describe("useRangeCalendar", () => {
  it("commits anchor selection when calendar blurs", () => {
    const scope = effectScope();
    let state!: ReturnType<typeof useRangeCalendarState>;
    let aria!: ReturnType<typeof useRangeCalendar>;

    const root = document.createElement("div");
    document.body.appendChild(root);

    scope.run(() => {
      state = useRangeCalendarState({
        locale: "en-US",
        createCalendar,
        defaultFocusedValue: new CalendarDate(2024, 5, 10),
      });

      state.selectDate(new CalendarDate(2024, 5, 10));
      aria = useRangeCalendar({ "aria-label": "Trip dates" }, state, {
        current: root,
      });
    });

    expect(state.anchorDate?.toString()).toBe("2024-05-10");

    const onBlur = aria.calendarProps.onBlur as ((event: FocusEvent) => void) | undefined;
    onBlur?.({ relatedTarget: null } as FocusEvent);

    const value = state.value as any;
    expect(state.anchorDate).toBeNull();
    expect(value?.start.toString()).toBe("2024-05-10");
    expect(value?.end.toString()).toBe("2024-05-10");

    scope.stop();
    root.remove();
  });
});
