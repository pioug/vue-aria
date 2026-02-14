import { CalendarDate } from "@internationalized/date";
import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { Provider } from "@vue-spectrum/provider";
import { theme } from "@vue-spectrum/theme";
import { DatePicker, DateRangePicker } from "../src";

describe("DatePicker SSR", () => {
  it("renders DatePicker without errors", async () => {
    const App = defineComponent({
      name: "DatePickerSSRApp",
      setup() {
        return () =>
          h(DatePicker, {
            "aria-label": "Date picker",
            defaultValue: new CalendarDate(2019, 6, 5),
          });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("react-spectrum-DatePicker");
    expect(html).toContain("June");
  });

  it("renders DateRangePicker without errors", async () => {
    const App = defineComponent({
      name: "DateRangePickerSSRApp",
      setup() {
        return () =>
          h(DateRangePicker, {
            "aria-label": "Date range picker",
            defaultValue: {
              start: new CalendarDate(2019, 6, 5),
              end: new CalendarDate(2019, 6, 8),
            },
          });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("react-spectrum-DateRangePicker");
    expect(html).toContain("June");
  });

  it("renders DatePicker with visibleMonths without SSR errors", async () => {
    const App = defineComponent({
      name: "DatePickerSSRMultiMonthApp",
      setup() {
        return () =>
          h(DatePicker, {
            "aria-label": "Date picker",
            defaultValue: new CalendarDate(2019, 6, 5),
            visibleMonths: 2,
          });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("react-spectrum-DatePicker");
    expect(html).toContain("June");
  });

  it("renders DatePicker with description without SSR errors", async () => {
    const App = defineComponent({
      name: "DatePickerSSRDescriptionApp",
      setup() {
        return () =>
          h(DatePicker, {
            "aria-label": "Date picker",
            defaultValue: new CalendarDate(2019, 6, 5),
            description: "Choose an event date",
          });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("react-spectrum-DatePicker-description");
    expect(html).toContain("Choose an event date");
  });

  it("renders DateRangePicker with visibleMonths without SSR errors", async () => {
    const App = defineComponent({
      name: "DateRangePickerSSRMultiMonthApp",
      setup() {
        return () =>
          h(DateRangePicker, {
            "aria-label": "Date range picker",
            defaultValue: {
              start: new CalendarDate(2019, 6, 5),
              end: new CalendarDate(2019, 6, 8),
            },
            visibleMonths: 2,
          });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("react-spectrum-DateRangePicker");
    expect(html).toContain("June");
  });

  it("renders DateRangePicker with description without SSR errors", async () => {
    const App = defineComponent({
      name: "DateRangePickerSSRDescriptionApp",
      setup() {
        return () =>
          h(DateRangePicker, {
            "aria-label": "Date range picker",
            defaultValue: {
              start: new CalendarDate(2019, 6, 5),
              end: new CalendarDate(2019, 6, 8),
            },
            description: "Choose travel dates",
          });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("react-spectrum-DateRangePicker-description");
    expect(html).toContain("Choose travel dates");
  });

  it("renders DatePicker inside Provider without SSR errors", async () => {
    const App = defineComponent({
      name: "DatePickerSSRProviderApp",
      setup() {
        return () =>
          h(
            Provider as any,
            {
              theme,
              isDisabled: true,
              isQuiet: true,
            },
            () =>
              h(DatePicker, {
                "aria-label": "Date picker",
                defaultValue: new CalendarDate(2019, 6, 5),
              })
          );
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("react-spectrum-DatePicker");
  });

  it("renders DateRangePicker inside Provider without SSR errors", async () => {
    const App = defineComponent({
      name: "DateRangePickerSSRProviderApp",
      setup() {
        return () =>
          h(
            Provider as any,
            {
              theme,
              isDisabled: true,
              isQuiet: true,
            },
            () =>
              h(DateRangePicker, {
                "aria-label": "Date range picker",
                defaultValue: {
                  start: new CalendarDate(2019, 6, 5),
                  end: new CalendarDate(2019, 6, 8),
                },
              })
          );
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("react-spectrum-DateRangePicker");
  });

  it("renders DatePicker with functional errorMessage without SSR errors", async () => {
    const App = defineComponent({
      name: "DatePickerSSRFunctionalErrorApp",
      setup() {
        return () =>
          h(DatePicker, {
            "aria-label": "Date picker",
            defaultValue: new CalendarDate(2019, 6, 5),
            validationState: "invalid",
            errorMessage: () => "Date callback error",
          });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("Date callback error");
  });

  it("renders DateRangePicker with functional errorMessage without SSR errors", async () => {
    const App = defineComponent({
      name: "DateRangePickerSSRFunctionalErrorApp",
      setup() {
        return () =>
          h(DateRangePicker, {
            "aria-label": "Date range picker",
            defaultValue: {
              start: new CalendarDate(2019, 6, 5),
              end: new CalendarDate(2019, 6, 8),
            },
            validationState: "invalid",
            errorMessage: () => "Range callback error",
          });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("Range callback error");
  });
});
