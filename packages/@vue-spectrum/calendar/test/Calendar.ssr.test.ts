import { parseDate } from "@internationalized/date";
import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { Calendar, RangeCalendar } from "../src";

describe("Calendar SSR", () => {
  it("renders Calendar and RangeCalendar on the server", async () => {
    const App = defineComponent({
      name: "CalendarSSRApp",
      setup() {
        return () =>
          h("div", [
            h(Calendar, {
              label: "Date",
              defaultValue: parseDate("2019-06-05"),
            }),
            h(RangeCalendar, {
              label: "Date range",
            }),
          ]);
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("react-spectrum-Calendar");
    expect(html).toContain("Date range");
  });
});
