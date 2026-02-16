import { CalendarDate, createCalendar } from "@internationalized/date";
import { effectScope, nextTick } from "vue";
import { describe, expect, it } from "vitest";
import { useCalendarState } from "@vue-stately/calendar";
import { useCalendar } from "../src/useCalendar";
import { useCalendarGrid } from "../src/useCalendarGrid";

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

  it("supports aria-label and aria-labelledby labeling semantics", () => {
    const scope = effectScope();
    let aria!: ReturnType<typeof useCalendar>;
    let grid!: ReturnType<typeof useCalendarGrid>;

    scope.run(() => {
      const state = useCalendarState({
        locale: "en-US",
        createCalendar,
        defaultValue: new CalendarDate(2019, 6, 5),
      });

      aria = useCalendar(
        {
          id: "hi",
          "aria-label": "cal",
          "aria-labelledby": "foo",
        },
        state
      );
      grid = useCalendarGrid({}, state);
    });

    expect(aria.calendarProps.id).toBe("hi");
    expect(aria.calendarProps["aria-label"]).toBe("cal, June 2019");
    expect(aria.calendarProps["aria-labelledby"]).toBe("hi foo");

    expect(grid.gridProps["aria-label"]).toBe("cal, June 2019");
    const gridLabelledBy = grid.gridProps["aria-labelledby"] as string;
    expect(gridLabelledBy).toContain("foo");

    scope.stop();
  });
});
