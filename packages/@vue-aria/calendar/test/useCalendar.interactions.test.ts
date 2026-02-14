import { CalendarDate, createCalendar } from "@internationalized/date";
import { effectScope, nextTick } from "vue";
import { describe, expect, it } from "vitest";
import { useCalendarState } from "@vue-aria/calendar-state";
import { useCalendar } from "../src/useCalendar";
import { useCalendarGrid } from "../src/useCalendarGrid";

interface KeyboardCase {
  name: string;
  defaultValue: CalendarDate;
  visibleDuration: { days?: number; weeks?: number; months?: number };
  key: string;
  count: number;
  expectedFocus: string;
  expectedRangeStart: string;
  expectedRangeEnd: string;
  shiftKey?: boolean;
}

function triggerKey(
  handler: ((event: KeyboardEvent) => void) | undefined,
  key: string,
  shiftKey = false
) {
  if (!handler) {
    throw new Error("Expected keydown handler");
  }

  handler(new KeyboardEvent("keydown", { key, shiftKey }));
}

async function flush() {
  await nextTick();
  await nextTick();
}

describe("useCalendar upstream interaction parity", () => {
  const keyboardCases: KeyboardCase[] = [
    {
      name: "3-day ArrowLeft two steps",
      defaultValue: new CalendarDate(2019, 6, 5),
      visibleDuration: { days: 3 },
      key: "ArrowLeft",
      count: 2,
      expectedFocus: "2019-06-03",
      expectedRangeStart: "2019-06-01",
      expectedRangeEnd: "2019-06-03",
    },
    {
      name: "3-day ArrowRight two steps",
      defaultValue: new CalendarDate(2019, 6, 5),
      visibleDuration: { days: 3 },
      key: "ArrowRight",
      count: 2,
      expectedFocus: "2019-06-07",
      expectedRangeStart: "2019-06-07",
      expectedRangeEnd: "2019-06-09",
    },
    {
      name: "1-week ArrowUp",
      defaultValue: new CalendarDate(2019, 6, 5),
      visibleDuration: { weeks: 1 },
      key: "ArrowUp",
      count: 1,
      expectedFocus: "2019-05-29",
      expectedRangeStart: "2019-05-26",
      expectedRangeEnd: "2019-06-01",
    },
    {
      name: "1-week shift PageDown",
      defaultValue: new CalendarDate(2019, 6, 5),
      visibleDuration: { weeks: 1 },
      key: "PageDown",
      count: 1,
      shiftKey: true,
      expectedFocus: "2019-07-05",
      expectedRangeStart: "2019-06-30",
      expectedRangeEnd: "2019-07-06",
    },
    {
      name: "2-week End key",
      defaultValue: new CalendarDate(2019, 6, 5),
      visibleDuration: { weeks: 2 },
      key: "End",
      count: 1,
      expectedFocus: "2019-06-08",
      expectedRangeStart: "2019-06-02",
      expectedRangeEnd: "2019-06-15",
    },
  ];

  it.each(keyboardCases)("$name", async ({
    defaultValue,
    visibleDuration,
    key,
    count,
    expectedFocus,
    expectedRangeStart,
    expectedRangeEnd,
    shiftKey,
  }) => {
    const scope = effectScope();
    let state!: ReturnType<typeof useCalendarState>;
    let onKeydown!: (event: KeyboardEvent) => void;

    scope.run(() => {
      state = useCalendarState({
        locale: "en-US",
        createCalendar,
        defaultValue,
        visibleDuration,
      });

      const { gridProps } = useCalendarGrid({}, state);
      onKeydown = gridProps.onKeydown as (event: KeyboardEvent) => void;
      state.setFocused(true);
    });

    for (let i = 0; i < count; i++) {
      triggerKey(onKeydown, key, shiftKey);
      await flush();
    }

    expect(state.focusedDate.toString()).toBe(expectedFocus);
    expect(state.visibleRange.start.toString()).toBe(expectedRangeStart);
    expect(state.visibleRange.end.toString()).toBe(expectedRangeEnd);

    scope.stop();
  });

  it("uses visible page behavior by default and single when configured", async () => {
    const visibleScope = effectScope();
    let visibleState!: ReturnType<typeof useCalendarState>;
    let visibleCalendar!: ReturnType<typeof useCalendar>;

    visibleScope.run(() => {
      visibleState = useCalendarState({
        locale: "en-US",
        createCalendar,
        defaultValue: new CalendarDate(2019, 1, 1),
        visibleDuration: { months: 2 },
      });
      visibleCalendar = useCalendar({ "aria-label": "Calendar" }, visibleState);
    });

    visibleCalendar.nextButtonProps.onPress?.();
    await flush();

    expect(visibleState.visibleRange.start.toString()).toBe("2019-03-01");
    expect(visibleState.visibleRange.end.toString()).toBe("2019-04-30");

    visibleScope.stop();

    const singleScope = effectScope();
    let singleState!: ReturnType<typeof useCalendarState>;
    let singleCalendar!: ReturnType<typeof useCalendar>;

    singleScope.run(() => {
      singleState = useCalendarState({
        locale: "en-US",
        createCalendar,
        defaultValue: new CalendarDate(2019, 1, 1),
        visibleDuration: { months: 2 },
        pageBehavior: "single",
      });
      singleCalendar = useCalendar({ "aria-label": "Calendar" }, singleState);
    });

    singleCalendar.nextButtonProps.onPress?.();
    await flush();

    expect(singleState.visibleRange.start.toString()).toBe("2019-02-01");
    expect(singleState.visibleRange.end.toString()).toBe("2019-03-31");

    singleScope.stop();
  });
});
