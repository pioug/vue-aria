import { CalendarDate } from "@internationalized/date";
import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { Calendar, RangeCalendar } from "../src";

describe("Calendar SSR", () => {
  it("renders Calendar without errors", async () => {
    const App = defineComponent({
      name: "CalendarSSRApp",
      setup() {
        return () =>
          h(Calendar, {
            "aria-label": "Calendar",
            defaultValue: new CalendarDate(2019, 6, 5),
          });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("react-spectrum-Calendar");
    expect(html).toContain("June 2019");
  });

  it("renders multi-month calendar with computed aria-label in SSR output", async () => {
    const App = defineComponent({
      name: "CalendarSSRMultiMonthApp",
      setup() {
        return () =>
          h(Calendar, {
            ariaLabel: "Team calendar",
            defaultValue: new CalendarDate(2019, 6, 5),
            visibleMonths: 2,
          });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain('aria-label="Team calendar,');
    expect(html).toContain("June");
    expect(html).toContain("July");
    expect(html).not.toContain("{startDate}");
    expect(html).not.toContain("{endDate}");
    expect((html.match(/react-spectrum-Calendar-table/g) ?? []).length).toBe(2);
  });

  it("renders RangeCalendar without errors", async () => {
    const App = defineComponent({
      name: "RangeCalendarSSRApp",
      setup() {
        return () =>
          h(RangeCalendar, {
            "aria-label": "Range calendar",
            defaultValue: {
              start: new CalendarDate(2019, 6, 5),
              end: new CalendarDate(2019, 6, 8),
            },
          });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("react-spectrum-Calendar");
    expect(html).toContain("June 2019");
  });
});
