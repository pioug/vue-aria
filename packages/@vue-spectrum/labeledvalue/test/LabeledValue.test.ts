import { CalendarDate, CalendarDateTime, Time, ZonedDateTime } from "@internationalized/date";
import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { LabeledValue } from "../src";

describe("LabeledValue", () => {
  it("renders a label", () => {
    const wrapper = mount(LabeledValue, {
      props: {
        "data-testid": "test-id",
        label: "Field label",
        value: "test",
      } as Record<string, unknown>,
    });

    expect(wrapper.text()).toContain("Field label");
  });

  it("renders correctly with string value", () => {
    const wrapper = mount(LabeledValue, {
      props: {
        "data-testid": "test-id",
        label: "Field label",
        value: "test",
      } as Record<string, unknown>,
    });

    const staticField = wrapper.get("[data-testid=\"test-id\"]");
    expect(staticField.text()).toContain("test");
  });

  it("renders correctly with string array value", () => {
    const wrapper = mount(LabeledValue, {
      props: {
        "data-testid": "test-id",
        label: "Field label",
        value: ["wow", "cool", "awesome"],
      } as Record<string, unknown>,
    });

    const staticField = wrapper.get("[data-testid=\"test-id\"]");
    expect(staticField.text()).toContain("wow, cool, and awesome");
  });

  it("renders correctly with CalendarDate value", () => {
    const wrapper = mount(LabeledValue, {
      props: {
        "data-testid": "test-id",
        label: "Field label",
        value: new CalendarDate(2019, 6, 5),
      } as Record<string, unknown>,
    });

    const staticField = wrapper.get("[data-testid=\"test-id\"]");
    expect(staticField.text()).toContain("June 5, 2019");
  });

  it("renders correctly with CalendarDate value with user provided format options", () => {
    const wrapper = mount(LabeledValue, {
      props: {
        "data-testid": "test-id",
        label: "Field label",
        value: new CalendarDate(2019, 6, 5),
        formatOptions: { dateStyle: "long" },
      } as Record<string, unknown>,
    });

    const staticField = wrapper.get("[data-testid=\"test-id\"]");
    expect(staticField.text()).toContain("June 5, 2019");
  });

  it("renders correctly with CalendarDateTime value", () => {
    const wrapper = mount(LabeledValue, {
      props: {
        "data-testid": "test-id",
        label: "Field label",
        value: new CalendarDateTime(2020, 2, 3, 12, 23, 24, 120),
      } as Record<string, unknown>,
    });

    const staticField = wrapper.get("[data-testid=\"test-id\"]");
    expect(staticField.text()).toContain("February 3, 2020 at 12:23 PM");
  });

  it("renders correctly with CalendarDateTime value with user provided format options", () => {
    const wrapper = mount(LabeledValue, {
      props: {
        "data-testid": "test-id",
        label: "Field label",
        value: new CalendarDateTime(2020, 2, 3, 12, 23, 24, 120),
        formatOptions: { dateStyle: "medium", timeStyle: "medium" },
      } as Record<string, unknown>,
    });

    const staticField = wrapper.get("[data-testid=\"test-id\"]");
    expect(staticField.text()).toContain("Feb 3, 2020, 12:23:24 PM");
  });

  it("renders correctly with ZonedDateTime value", () => {
    const wrapper = mount(LabeledValue, {
      props: {
        "data-testid": "test-id",
        label: "Field label",
        value: new ZonedDateTime(2020, 2, 3, "America/Los_Angeles", -28800000),
      } as Record<string, unknown>,
    });

    const staticField = wrapper.get("[data-testid=\"test-id\"]");
    expect(staticField.text()).toMatch(
      /February 3, 2020 at 12:00 AM (PST|GMT-8|GMT-08:00)/
    );
  });

  it("renders correctly with ZonedDateTime value with user provided format options", () => {
    const wrapper = mount(LabeledValue, {
      props: {
        "data-testid": "test-id",
        label: "Field label",
        value: new ZonedDateTime(2020, 3, 3, "America/Los_Angeles", -28800000),
        formatOptions: { dateStyle: "full", timeStyle: "short" },
      } as Record<string, unknown>,
    });

    const staticField = wrapper.get("[data-testid=\"test-id\"]");
    expect(staticField.text()).toMatch(
      /Tuesday, March 3, 2020 at \d{1,2}:\d{2} [AP]M/
    );
  });

  it("renders correctly with Date value", () => {
    const wrapper = mount(LabeledValue, {
      props: {
        "data-testid": "test-id",
        label: "Field label",
        value: new Date(2000, 5, 5),
      } as Record<string, unknown>,
    });

    const staticField = wrapper.get("[data-testid=\"test-id\"]");
    expect(staticField.text()).toContain("June 5, 2000 at 12:00 AM");
  });

  it("renders correctly with Date value with user provided format options", () => {
    const wrapper = mount(LabeledValue, {
      props: {
        "data-testid": "test-id",
        label: "Field label",
        value: new Date(2000, 5, 5),
        formatOptions: { dateStyle: "full" },
      } as Record<string, unknown>,
    });

    const staticField = wrapper.get("[data-testid=\"test-id\"]");
    expect(staticField.text()).toContain("Monday, June 5, 2000");
  });

  it("renders correctly with Time value", () => {
    const wrapper = mount(LabeledValue, {
      props: {
        "data-testid": "test-id",
        label: "Field label",
        value: new Time(9, 45),
        formatOptions: { timeStyle: "short" },
      } as Record<string, unknown>,
    });

    const staticField = wrapper.get("[data-testid=\"test-id\"]");
    expect(staticField.text()).toContain("9:45 AM");
  });

  it("renders correctly with RangeValue<Date>", () => {
    const wrapper = mount(LabeledValue, {
      props: {
        "data-testid": "test-id",
        label: "Field label",
        value: { start: new Date(2019, 6, 5), end: new Date(2019, 6, 10) },
      } as Record<string, unknown>,
    });

    const staticField = wrapper.get("[data-testid=\"test-id\"]");
    expect(staticField.text()).toMatch(/July 5, 2019.*July 10, 2019/);
  });

  it("renders correctly with RangeValue<Time>", () => {
    const wrapper = mount(LabeledValue, {
      props: {
        "data-testid": "test-id",
        label: "Field label",
        value: { start: new Time(9, 45), end: new Time(10, 45) },
        formatOptions: { timeStyle: "short" },
      } as Record<string, unknown>,
    });

    const staticField = wrapper.get("[data-testid=\"test-id\"]");
    expect(staticField.text()).toMatch(/9:45.*10:45.*AM/);
  });

  it("renders correctly with RangeValue<ZonedDateTime>", () => {
    const wrapper = mount(LabeledValue, {
      props: {
        "data-testid": "test-id",
        label: "Field label",
        value: {
          start: new ZonedDateTime(2020, 2, 3, "America/Los_Angeles", -28800000),
          end: new ZonedDateTime(2020, 3, 3, "America/Los_Angeles", -28800000),
        },
      } as Record<string, unknown>,
    });

    const staticField = wrapper.get("[data-testid=\"test-id\"]");
    expect(staticField.text()).toMatch(/February 3, 2020.*March 3, 2020/);
    expect(staticField.text()).toMatch(/(PST|GMT-8|GMT-08:00)/);
  });

  it("renders correctly with RangeValue<CalendarDateTime>", () => {
    const wrapper = mount(LabeledValue, {
      props: {
        "data-testid": "test-id",
        label: "Field label",
        value: {
          start: new CalendarDateTime(2020, 2, 3, 12, 23, 24, 120),
          end: new CalendarDateTime(2020, 3, 3, 12, 23, 24, 120),
        },
      } as Record<string, unknown>,
    });

    const staticField = wrapper.get("[data-testid=\"test-id\"]");
    const normalizedText = staticField.text().replace(/\s+/gu, " ");
    expect(normalizedText).toContain("February 3, 2020 at 12:23 PM");
    expect(normalizedText).toContain("March 3, 2020 at 12:23 PM");
  });

  it("renders correctly with RangeValue<CalendarDate>", () => {
    const wrapper = mount(LabeledValue, {
      props: {
        "data-testid": "test-id",
        label: "Field label",
        value: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 7, 5),
        },
      } as Record<string, unknown>,
    });

    const staticField = wrapper.get("[data-testid=\"test-id\"]");
    expect(staticField.text()).toContain("June 5");
    expect(staticField.text()).toContain("July 5, 2019");
  });

  it("renders correctly with number value", () => {
    const wrapper = mount(LabeledValue, {
      props: {
        "data-testid": "test-id",
        label: "Field label",
        value: 10,
      } as Record<string, unknown>,
    });

    const staticField = wrapper.get("[data-testid=\"test-id\"]");
    expect(staticField.text()).toContain("10");
  });

  it("renders correctly with RangeValue<NumberValue>", () => {
    const wrapper = mount(LabeledValue, {
      props: {
        "data-testid": "test-id",
        label: "Field label",
        value: { start: 10, end: 20 },
      } as Record<string, unknown>,
    });

    const staticField = wrapper.get("[data-testid=\"test-id\"]");
    expect(staticField.text()).toContain("Field label");
    expect(staticField.text()).toContain("10");
    expect(staticField.text()).toContain("20");
    expect(staticField.text()).toMatch(/10\u201320/);
  });

  it("renders correctly with VNode value", () => {
    const wrapper = mount(LabeledValue, {
      props: {
        "data-testid": "test-id",
        label: "Field label",
        value: h("a", { href: "https://test.com" }, "test"),
      } as Record<string, unknown>,
    });

    const staticField = wrapper.get("[data-testid=\"test-id\"]");
    expect(staticField.text()).toContain("test");
    expect(wrapper.get("a[href=\"https://test.com\"]").text()).toBe("test");
  });

  it("throws when an editable value is provided", () => {
    const spyError = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() =>
      mount(LabeledValue, {
        props: {
          label: "Field label",
          value: h("input"),
        } as Record<string, unknown>,
      })
    ).toThrow("LabeledValue cannot contain an editable value.");

    spyError.mockRestore();
  });

  it("attaches a user provided ref to the outer div", () => {
    const labeledValueRef = ref<{ UNSAFE_getDOMNode: () => HTMLElement | null } | null>(
      null
    );
    const App = defineComponent({
      name: "LabeledValueRefApp",
      setup() {
        return () =>
          h(LabeledValue, {
            ref: labeledValueRef,
            "data-testid": "test-id",
            value: "test",
          });
      },
    });

    const wrapper = mount(App);
    const staticField = wrapper.get("[data-testid=\"test-id\"]");
    expect(labeledValueRef.value?.UNSAFE_getDOMNode()).toBe(staticField.element);
  });

  it("attaches a user provided ref to the outer div with a label", () => {
    const labeledValueRef = ref<{ UNSAFE_getDOMNode: () => HTMLElement | null } | null>(
      null
    );
    const App = defineComponent({
      name: "LabeledValueRefWithLabelApp",
      setup() {
        return () =>
          h(LabeledValue, {
            ref: labeledValueRef,
            "data-testid": "test-id",
            label: "Field label",
            value: "test",
          });
      },
    });

    const wrapper = mount(App);
    const staticField = wrapper.get("[data-testid=\"test-id\"]");
    expect(labeledValueRef.value?.UNSAFE_getDOMNode()).toBe(staticField.element);
    expect(labeledValueRef.value?.UNSAFE_getDOMNode()?.textContent).toContain(
      "Field label"
    );
  });

  it("labelPosition: side supports a ref", () => {
    const labeledValueRef = ref<{ UNSAFE_getDOMNode: () => HTMLElement | null } | null>(
      null
    );
    const App = defineComponent({
      name: "LabeledValueSideRefApp",
      setup() {
        return () =>
          h(LabeledValue, {
            ref: labeledValueRef,
            "data-testid": "test-id",
            label: "Field label",
            labelPosition: "side",
            value: "test",
          });
      },
    });

    const wrapper = mount(App);
    const staticField = wrapper.get("[data-testid=\"test-id\"]");
    expect(labeledValueRef.value?.UNSAFE_getDOMNode()).toBe(staticField.element);
    expect(labeledValueRef.value?.UNSAFE_getDOMNode()?.textContent).toContain(
      "Field label"
    );
  });
});
