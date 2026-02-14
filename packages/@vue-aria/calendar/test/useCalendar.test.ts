import { CalendarDate, createCalendar } from "@internationalized/date";
import { effectScope, nextTick } from "vue";
import { describe, expect, it } from "vitest";
import { useCalendarState } from "@vue-aria/calendar-state";
import { useCalendar } from "../src/useCalendar";

describe("useCalendar", () => {
  it("returns application props and updates title when paging", async () => {
    const scope = effectScope();
    let state!: ReturnType<typeof useCalendarState>;
    let aria!: ReturnType<typeof useCalendar>;

    scope.run(() => {
      state = useCalendarState({
        locale: "en-US",
        createCalendar,
        defaultValue: new CalendarDate(2019, 1, 1),
        visibleDuration: { months: 2 },
      });

      aria = useCalendar({ "aria-label": "Event date" }, state);
    });

    expect(aria.calendarProps.role).toBe("application");
    expect(aria.title.length).toBeGreaterThan(0);
    const firstTitle = aria.title;

    aria.nextButtonProps.onPress?.();
    await nextTick();

    expect(aria.title.length).toBeGreaterThan(0);
    expect(aria.title).not.toBe(firstTitle);

    scope.stop();
  });

  it("disables next button when next visible range is invalid", () => {
    const scope = effectScope();
    let aria!: ReturnType<typeof useCalendar>;

    scope.run(() => {
      const state = useCalendarState({
        locale: "en-US",
        createCalendar,
        defaultValue: new CalendarDate(2020, 1, 15),
        maxValue: new CalendarDate(2020, 1, 31),
      });

      aria = useCalendar({ "aria-label": "Billing date" }, state);
    });

    expect(aria.nextButtonProps.isDisabled).toBe(true);

    scope.stop();
  });
});
