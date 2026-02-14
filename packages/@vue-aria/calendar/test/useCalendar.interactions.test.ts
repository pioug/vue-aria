import { CalendarDate, createCalendar } from "@internationalized/date";
import { effectScope, nextTick } from "vue";
import { describe, expect, it } from "vitest";
import { useCalendarState } from "@vue-aria/calendar-state";
import { useCalendar } from "../src/useCalendar";
import { useCalendarGrid } from "../src/useCalendarGrid";
import { Custom454Calendar } from "./Custom454Calendar";

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

interface PaginationCase {
  name: string;
  visibleDuration: { days?: number; weeks?: number; months?: number };
  pageBehavior?: "visible" | "single";
  direction: "next" | "previous";
  count: number;
  expectedRangeStart: string;
  expectedRangeEnd: string;
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
      name: "3-day ArrowLeft one step",
      defaultValue: new CalendarDate(2019, 6, 5),
      visibleDuration: { days: 3 },
      key: "ArrowLeft",
      count: 1,
      expectedFocus: "2019-06-04",
      expectedRangeStart: "2019-06-04",
      expectedRangeEnd: "2019-06-06",
    },
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
      name: "3-day ArrowUp",
      defaultValue: new CalendarDate(2019, 6, 5),
      visibleDuration: { days: 3 },
      key: "ArrowUp",
      count: 1,
      expectedFocus: "2019-06-02",
      expectedRangeStart: "2019-06-01",
      expectedRangeEnd: "2019-06-03",
    },
    {
      name: "3-day PageDown",
      defaultValue: new CalendarDate(2019, 6, 5),
      visibleDuration: { days: 3 },
      key: "PageDown",
      count: 1,
      expectedFocus: "2019-06-08",
      expectedRangeStart: "2019-06-07",
      expectedRangeEnd: "2019-06-09",
    },
    {
      name: "3-day Home key",
      defaultValue: new CalendarDate(2019, 6, 5),
      visibleDuration: { days: 3 },
      key: "Home",
      count: 1,
      expectedFocus: "2019-06-04",
      expectedRangeStart: "2019-06-04",
      expectedRangeEnd: "2019-06-06",
    },
    {
      name: "3-day End key",
      defaultValue: new CalendarDate(2019, 6, 5),
      visibleDuration: { days: 3 },
      key: "End",
      count: 1,
      expectedFocus: "2019-06-06",
      expectedRangeStart: "2019-06-04",
      expectedRangeEnd: "2019-06-06",
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
      name: "1-week ArrowLeft four steps",
      defaultValue: new CalendarDate(2019, 6, 5),
      visibleDuration: { weeks: 1 },
      key: "ArrowLeft",
      count: 4,
      expectedFocus: "2019-06-01",
      expectedRangeStart: "2019-05-26",
      expectedRangeEnd: "2019-06-01",
    },
    {
      name: "1-week ArrowRight four steps",
      defaultValue: new CalendarDate(2019, 6, 5),
      visibleDuration: { weeks: 1 },
      key: "ArrowRight",
      count: 4,
      expectedFocus: "2019-06-09",
      expectedRangeStart: "2019-06-09",
      expectedRangeEnd: "2019-06-15",
    },
    {
      name: "1-week PageUp",
      defaultValue: new CalendarDate(2019, 6, 5),
      visibleDuration: { weeks: 1 },
      key: "PageUp",
      count: 1,
      expectedFocus: "2019-05-29",
      expectedRangeStart: "2019-05-26",
      expectedRangeEnd: "2019-06-01",
    },
    {
      name: "1-week Home key",
      defaultValue: new CalendarDate(2019, 6, 5),
      visibleDuration: { weeks: 1 },
      key: "Home",
      count: 1,
      expectedFocus: "2019-06-02",
      expectedRangeStart: "2019-06-02",
      expectedRangeEnd: "2019-06-08",
    },
    {
      name: "1-week End key",
      defaultValue: new CalendarDate(2019, 6, 5),
      visibleDuration: { weeks: 1 },
      key: "End",
      count: 1,
      expectedFocus: "2019-06-08",
      expectedRangeStart: "2019-06-02",
      expectedRangeEnd: "2019-06-08",
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
    {
      name: "2-week ArrowRight eleven steps",
      defaultValue: new CalendarDate(2019, 6, 5),
      visibleDuration: { weeks: 2 },
      key: "ArrowRight",
      count: 11,
      expectedFocus: "2019-06-16",
      expectedRangeStart: "2019-06-16",
      expectedRangeEnd: "2019-06-29",
    },
    {
      name: "2-week ArrowDown two steps",
      defaultValue: new CalendarDate(2019, 6, 5),
      visibleDuration: { weeks: 2 },
      key: "ArrowDown",
      count: 2,
      expectedFocus: "2019-06-19",
      expectedRangeStart: "2019-06-16",
      expectedRangeEnd: "2019-06-29",
    },
    {
      name: "2-week shift PageUp",
      defaultValue: new CalendarDate(2019, 6, 5),
      visibleDuration: { weeks: 2 },
      key: "PageUp",
      count: 1,
      shiftKey: true,
      expectedFocus: "2019-05-05",
      expectedRangeStart: "2019-04-28",
      expectedRangeEnd: "2019-05-11",
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

  const paginationCases: PaginationCase[] = [
    {
      name: "2-month visible next one",
      visibleDuration: { months: 2 },
      direction: "next",
      count: 1,
      expectedRangeStart: "2019-03-01",
      expectedRangeEnd: "2019-04-30",
    },
    {
      name: "2-month visible next two",
      visibleDuration: { months: 2 },
      direction: "next",
      count: 2,
      expectedRangeStart: "2019-05-01",
      expectedRangeEnd: "2019-06-30",
    },
    {
      name: "2-month visible previous one",
      visibleDuration: { months: 2 },
      direction: "previous",
      count: 1,
      expectedRangeStart: "2018-11-01",
      expectedRangeEnd: "2018-12-31",
    },
    {
      name: "2-month visible previous two",
      visibleDuration: { months: 2 },
      direction: "previous",
      count: 2,
      expectedRangeStart: "2018-09-01",
      expectedRangeEnd: "2018-10-31",
    },
    {
      name: "2-month single next one",
      visibleDuration: { months: 2 },
      pageBehavior: "single",
      direction: "next",
      count: 1,
      expectedRangeStart: "2019-02-01",
      expectedRangeEnd: "2019-03-31",
    },
    {
      name: "2-month single next two",
      visibleDuration: { months: 2 },
      pageBehavior: "single",
      direction: "next",
      count: 2,
      expectedRangeStart: "2019-03-01",
      expectedRangeEnd: "2019-04-30",
    },
    {
      name: "2-month single previous one",
      visibleDuration: { months: 2 },
      pageBehavior: "single",
      direction: "previous",
      count: 1,
      expectedRangeStart: "2018-12-01",
      expectedRangeEnd: "2019-01-31",
    },
    {
      name: "2-month single previous two",
      visibleDuration: { months: 2 },
      pageBehavior: "single",
      direction: "previous",
      count: 2,
      expectedRangeStart: "2018-11-01",
      expectedRangeEnd: "2018-12-31",
    },
    {
      name: "3-week visible next",
      visibleDuration: { weeks: 3 },
      direction: "next",
      count: 1,
      expectedRangeStart: "2019-01-13",
      expectedRangeEnd: "2019-02-02",
    },
    {
      name: "3-week single next",
      visibleDuration: { weeks: 3 },
      pageBehavior: "single",
      direction: "next",
      count: 1,
      expectedRangeStart: "2018-12-30",
      expectedRangeEnd: "2019-01-19",
    },
    {
      name: "3-week visible next two",
      visibleDuration: { weeks: 3 },
      direction: "next",
      count: 2,
      expectedRangeStart: "2019-02-03",
      expectedRangeEnd: "2019-02-23",
    },
    {
      name: "3-week single next four",
      visibleDuration: { weeks: 3 },
      pageBehavior: "single",
      direction: "next",
      count: 4,
      expectedRangeStart: "2019-01-20",
      expectedRangeEnd: "2019-02-09",
    },
    {
      name: "3-week visible previous",
      visibleDuration: { weeks: 3 },
      direction: "previous",
      count: 1,
      expectedRangeStart: "2018-12-02",
      expectedRangeEnd: "2018-12-22",
    },
    {
      name: "3-week single previous",
      visibleDuration: { weeks: 3 },
      pageBehavior: "single",
      direction: "previous",
      count: 1,
      expectedRangeStart: "2018-12-16",
      expectedRangeEnd: "2019-01-05",
    },
    {
      name: "3-week visible previous two",
      visibleDuration: { weeks: 3 },
      direction: "previous",
      count: 2,
      expectedRangeStart: "2018-11-11",
      expectedRangeEnd: "2018-12-01",
    },
    {
      name: "3-week single previous four",
      visibleDuration: { weeks: 3 },
      pageBehavior: "single",
      direction: "previous",
      count: 4,
      expectedRangeStart: "2018-11-25",
      expectedRangeEnd: "2018-12-15",
    },
    {
      name: "5-day visible next",
      visibleDuration: { days: 5 },
      direction: "next",
      count: 1,
      expectedRangeStart: "2019-01-04",
      expectedRangeEnd: "2019-01-08",
    },
    {
      name: "5-day single next",
      visibleDuration: { days: 5 },
      pageBehavior: "single",
      direction: "next",
      count: 1,
      expectedRangeStart: "2018-12-31",
      expectedRangeEnd: "2019-01-04",
    },
    {
      name: "5-day visible next two",
      visibleDuration: { days: 5 },
      direction: "next",
      count: 2,
      expectedRangeStart: "2019-01-09",
      expectedRangeEnd: "2019-01-13",
    },
    {
      name: "5-day single next four",
      visibleDuration: { days: 5 },
      pageBehavior: "single",
      direction: "next",
      count: 4,
      expectedRangeStart: "2019-01-03",
      expectedRangeEnd: "2019-01-07",
    },
    {
      name: "5-day visible previous",
      visibleDuration: { days: 5 },
      direction: "previous",
      count: 1,
      expectedRangeStart: "2018-12-25",
      expectedRangeEnd: "2018-12-29",
    },
    {
      name: "5-day single previous",
      visibleDuration: { days: 5 },
      pageBehavior: "single",
      direction: "previous",
      count: 1,
      expectedRangeStart: "2018-12-29",
      expectedRangeEnd: "2019-01-02",
    },
    {
      name: "5-day visible previous two",
      visibleDuration: { days: 5 },
      direction: "previous",
      count: 2,
      expectedRangeStart: "2018-12-20",
      expectedRangeEnd: "2018-12-24",
    },
    {
      name: "5-day single previous four",
      visibleDuration: { days: 5 },
      pageBehavior: "single",
      direction: "previous",
      count: 4,
      expectedRangeStart: "2018-12-26",
      expectedRangeEnd: "2018-12-30",
    },
  ];

  it.each(paginationCases)(
    "$name",
    async ({
      visibleDuration,
      pageBehavior,
      direction,
      count,
      expectedRangeStart,
      expectedRangeEnd,
    }) => {
      const scope = effectScope();
      let state!: ReturnType<typeof useCalendarState>;
      let calendar!: ReturnType<typeof useCalendar>;

      scope.run(() => {
        state = useCalendarState({
          locale: "en-US",
          createCalendar,
          defaultValue: new CalendarDate(2019, 1, 1),
          visibleDuration,
          pageBehavior,
        });
        calendar = useCalendar({ "aria-label": "Calendar" }, state);
      });

      for (let i = 0; i < count; i++) {
        if (direction === "next") {
          calendar.nextButtonProps.onPress?.();
        } else {
          calendar.prevButtonProps.onPress?.();
        }
        await flush();
      }

      expect(state.visibleRange.start.toString()).toBe(expectedRangeStart);
      expect(state.visibleRange.end.toString()).toBe(expectedRangeEnd);
      scope.stop();
    }
  );

  it.each([
    {
      name: "en-US default",
      locale: "en-US",
      firstDayOfWeek: undefined,
      expectedFirstDate: "2023-12-31",
    },
    {
      name: "en-US sunday",
      locale: "en-US",
      firstDayOfWeek: "sun" as const,
      expectedFirstDate: "2023-12-31",
    },
    {
      name: "en-US monday",
      locale: "en-US",
      firstDayOfWeek: "mon" as const,
      expectedFirstDate: "2024-01-01",
    },
    {
      name: "en-US tuesday",
      locale: "en-US",
      firstDayOfWeek: "tue" as const,
      expectedFirstDate: "2023-12-26",
    },
    {
      name: "en-US wednesday",
      locale: "en-US",
      firstDayOfWeek: "wed" as const,
      expectedFirstDate: "2023-12-27",
    },
    {
      name: "en-US thursday",
      locale: "en-US",
      firstDayOfWeek: "thu" as const,
      expectedFirstDate: "2023-12-28",
    },
    {
      name: "en-US friday",
      locale: "en-US",
      firstDayOfWeek: "fri" as const,
      expectedFirstDate: "2023-12-29",
    },
    {
      name: "en-US saturday",
      locale: "en-US",
      firstDayOfWeek: "sat" as const,
      expectedFirstDate: "2023-12-30",
    },
    {
      name: "fr-FR default",
      locale: "fr-FR",
      firstDayOfWeek: undefined,
      expectedFirstDate: "2024-01-01",
    },
    {
      name: "fr-FR sunday",
      locale: "fr-FR",
      firstDayOfWeek: "sun" as const,
      expectedFirstDate: "2023-12-31",
    },
    {
      name: "fr-FR monday",
      locale: "fr-FR",
      firstDayOfWeek: "mon" as const,
      expectedFirstDate: "2024-01-01",
    },
    {
      name: "fr-FR tuesday",
      locale: "fr-FR",
      firstDayOfWeek: "tue" as const,
      expectedFirstDate: "2023-12-26",
    },
    {
      name: "fr-FR wednesday",
      locale: "fr-FR",
      firstDayOfWeek: "wed" as const,
      expectedFirstDate: "2023-12-27",
    },
    {
      name: "fr-FR thursday",
      locale: "fr-FR",
      firstDayOfWeek: "thu" as const,
      expectedFirstDate: "2023-12-28",
    },
    {
      name: "fr-FR friday",
      locale: "fr-FR",
      firstDayOfWeek: "fri" as const,
      expectedFirstDate: "2023-12-29",
    },
    {
      name: "fr-FR saturday",
      locale: "fr-FR",
      firstDayOfWeek: "sat" as const,
      expectedFirstDate: "2023-12-30",
    },
  ])(
    "respects first-day-of-week matrix: $name",
    ({ locale, firstDayOfWeek, expectedFirstDate }) => {
      const scope = effectScope();
      let state!: ReturnType<typeof useCalendarState>;

      scope.run(() => {
        state = useCalendarState({
          locale,
          createCalendar,
          defaultValue: new CalendarDate(2024, 1, 1),
          firstDayOfWeek,
        });
      });

      const firstWeek = state.getDatesInWeek(0);
      expect(firstWeek[0]?.toString()).toBe(expectedFirstDate);
      scope.stop();
    }
  );

  describe("custom calendar visible range description", () => {
    const customCalendar = new Custom454Calendar();

    const singleMonthCases = [
      { name: "1st month", date: new CalendarDate(customCalendar, 2023, 1, 14), expected: "February 2023" },
      { name: "2nd month", date: new CalendarDate(customCalendar, 2023, 2, 14), expected: "March 2023" },
      { name: "3rd month", date: new CalendarDate(customCalendar, 2023, 3, 14), expected: "April 2023" },
      { name: "4th month", date: new CalendarDate(customCalendar, 2023, 4, 14), expected: "May 2023" },
      { name: "5th month", date: new CalendarDate(customCalendar, 2023, 5, 14), expected: "June 2023" },
      { name: "6th month", date: new CalendarDate(customCalendar, 2023, 6, 14), expected: "July 2023" },
      { name: "7th month", date: new CalendarDate(customCalendar, 2023, 7, 14), expected: "August 2023" },
      { name: "8th month", date: new CalendarDate(customCalendar, 2023, 8, 14), expected: "September 2023" },
      { name: "9th month", date: new CalendarDate(customCalendar, 2023, 9, 14), expected: "October 2023" },
      { name: "10th month", date: new CalendarDate(customCalendar, 2023, 10, 14), expected: "November 2023" },
      { name: "11th month", date: new CalendarDate(customCalendar, 2023, 11, 14), expected: "December 2023" },
      { name: "12th month", date: new CalendarDate(customCalendar, 2023, 12, 14), expected: "January 2024" },
    ];

    it.each(singleMonthCases)(
      "formats $name as $expected for single-month visibility",
      ({ date, expected }) => {
        const scope = effectScope();
        let state!: ReturnType<typeof useCalendarState>;
        let calendar!: ReturnType<typeof useCalendar>;

        scope.run(() => {
          state = useCalendarState({
            locale: "en-US",
            createCalendar: () => customCalendar,
            focusedValue: date,
            visibleDuration: { months: 1 },
          });
          calendar = useCalendar({ "aria-label": "Calendar" }, state);
        });

        expect(calendar.title).toBe(expected);
        scope.stop();
      }
    );

    it.each([
      {
        name: "multiple months in same year",
        visibleDuration: { months: 3 },
        date: new CalendarDate(customCalendar, 2023, 7, 14),
        expected: /August.*October 2023/,
      },
      {
        name: "multiple months across years",
        visibleDuration: { months: 3 },
        date: new CalendarDate(customCalendar, 2023, 10, 14),
        expected: /November 2023.*January 2024/,
      },
    ])(
      "formats visible range for $name",
      ({ visibleDuration, date, expected }) => {
        const scope = effectScope();
        let state!: ReturnType<typeof useCalendarState>;
        let calendar!: ReturnType<typeof useCalendar>;

        scope.run(() => {
          state = useCalendarState({
            locale: "en-US",
            createCalendar: () => customCalendar,
            focusedValue: date,
            visibleDuration,
            selectionAlignment: "start",
          });
          calendar = useCalendar({ "aria-label": "Calendar" }, state);
        });

        expect(calendar.title).toMatch(expected);
        scope.stop();
      }
    );
  });
});
