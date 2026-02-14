import { CalendarDate, createCalendar } from "@internationalized/date";
import { effectScope, nextTick } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCalendarState, useRangeCalendarState } from "@vue-aria/calendar-state";
import { useCalendar } from "../src/useCalendar";
import { useRangeCalendar } from "../src/useRangeCalendar";

const { announceMock } = vi.hoisted(() => ({
  announceMock: vi.fn(),
}));

vi.mock("@vue-aria/live-announcer", () => ({
  announce: announceMock,
  clearAnnouncer: vi.fn(),
  destroyAnnouncer: vi.fn(),
}));

async function flush() {
  await nextTick();
  await nextTick();
}

describe("useCalendar live announcement parity", () => {
  beforeEach(() => {
    announceMock.mockReset();
  });

  it("announces visible range changes when paging while not focused", async () => {
    const scope = effectScope();
    let state!: ReturnType<typeof useCalendarState>;
    let aria!: ReturnType<typeof useCalendar>;

    scope.run(() => {
      state = useCalendarState({
        locale: "en-US",
        createCalendar,
        defaultValue: new CalendarDate(2019, 1, 1),
        visibleDuration: { months: 1 },
      });
      aria = useCalendar({ "aria-label": "Calendar" }, state);
    });

    await flush();
    aria.nextButtonProps.onPress?.();
    await flush();

    expect(announceMock).toHaveBeenCalledTimes(1);
    expect(announceMock).toHaveBeenCalledWith("February 2019");

    scope.stop();
  });

  it("skips visible range announcements while the calendar is focused", async () => {
    const scope = effectScope();
    let state!: ReturnType<typeof useCalendarState>;
    let aria!: ReturnType<typeof useCalendar>;

    scope.run(() => {
      state = useCalendarState({
        locale: "en-US",
        createCalendar,
        defaultValue: new CalendarDate(2019, 1, 1),
        visibleDuration: { months: 1 },
      });
      aria = useCalendar({ "aria-label": "Calendar" }, state);
      state.setFocused(true);
    });

    await flush();
    aria.nextButtonProps.onPress?.();
    await flush();

    expect(announceMock).not.toHaveBeenCalled();
    scope.stop();
  });

  it("announces committed range selections politely", async () => {
    const scope = effectScope();
    const root = document.createElement("div");
    document.body.appendChild(root);

    let state!: ReturnType<typeof useRangeCalendarState>;

    scope.run(() => {
      state = useRangeCalendarState({
        locale: "en-US",
        createCalendar,
        defaultFocusedValue: new CalendarDate(2024, 5, 10),
      });

      useRangeCalendar({ "aria-label": "Trip dates" }, state, {
        current: root,
      });
    });

    state.selectDate(new CalendarDate(2024, 5, 10));
    await flush();
    expect(announceMock).not.toHaveBeenCalled();

    state.selectDate(new CalendarDate(2024, 5, 12));
    await flush();

    expect(announceMock).toHaveBeenCalledTimes(1);
    expect(announceMock).toHaveBeenCalledWith(
      expect.stringContaining("Selected Range:"),
      "polite",
      4000
    );

    scope.stop();
    root.remove();
  });
});
