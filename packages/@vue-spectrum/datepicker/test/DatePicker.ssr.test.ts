import { parseDate, parseTime } from "@internationalized/date";
import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { DateField, DatePicker, DateRangePicker, TimeField } from "../src";

describe("DatePicker SSR", () => {
  it("renders exported datepicker components", async () => {
    const App = defineComponent({
      name: "DatePickerSSRApp",
      setup() {
        return () =>
          h("div", [
            h(DateField, {
              label: "Date field",
              defaultValue: parseDate("2019-06-05"),
            }),
            h(TimeField, {
              label: "Time field",
              defaultValue: parseTime("14:30:00"),
            }),
            h(DatePicker, {
              label: "Date picker",
              defaultValue: parseDate("2019-06-05"),
            }),
            h(DateRangePicker, {
              label: "Date range picker",
            }),
          ]);
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("react-spectrum-DateField");
    expect(html).toContain("react-spectrum-TimeField");
    expect(html).toContain("react-spectrum-DatePicker");
    expect(html).toContain("react-spectrum-DateRangePicker");
  });
});
