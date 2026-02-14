import { CalendarDate } from "@internationalized/date";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DatePicker, DateRangePicker } from "../src";

function createPointerEvent(type: "pointerdown" | "pointerup"): PointerEvent {
  if (typeof PointerEvent !== "undefined") {
    return new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      pointerType: "mouse",
      button: 0,
      pointerId: 1,
    });
  }

  const event = new Event(type, { bubbles: true, cancelable: true }) as PointerEvent;
  Object.defineProperties(event, {
    pointerType: { value: "mouse" },
    button: { value: 0 },
    pointerId: { value: 1 },
  });
  return event;
}

function pressElement(element: Element) {
  element.dispatchEvent(createPointerEvent("pointerdown"));
  element.dispatchEvent(createPointerEvent("pointerup"));
  element.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("DatePicker", () => {
  it("renders with default value text", () => {
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
      },
      attachTo: document.body,
    });

    expect(wrapper.get(".react-spectrum-DatePicker-value").text()).toContain("June");
    expect(wrapper.get(".react-spectrum-DatePicker-value").text()).toContain("2019");
  });

  it("opens a calendar popover and commits date selection", async () => {
    const onChange = vi.fn();
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        onChange,
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DatePicker-button").trigger("click");
    await nextTick();

    const calendarRoot = document.body.querySelector(".react-spectrum-Calendar");
    expect(calendarRoot).toBeTruthy();

    const day17 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "17");
    expect(day17).toBeTruthy();

    pressElement(day17!);
    await nextTick();

    expect(onChange).toHaveBeenCalled();
    const value = onChange.mock.calls.at(-1)?.[0] as CalendarDate;
    expect(value.month).toBe(6);
    expect(value.day).toBe(17);
  });

  it("updates rendered value in controlled mode", async () => {
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        value: new CalendarDate(2019, 6, 5),
      },
      attachTo: document.body,
    });

    expect(wrapper.get(".react-spectrum-DatePicker-value").text()).toContain("5");

    await wrapper.setProps({
      value: new CalendarDate(2019, 6, 17),
    });
    await nextTick();

    expect(wrapper.get(".react-spectrum-DatePicker-value").text()).toContain("17");
  });

  it("keeps rendered value stable in controlled mode until prop updates", async () => {
    const onChange = vi.fn();
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        value: new CalendarDate(2019, 6, 5),
        onChange,
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DatePicker-button").trigger("click");
    await nextTick();

    const day17 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "17");
    expect(day17).toBeTruthy();
    pressElement(day17!);
    await nextTick();

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(wrapper.get(".react-spectrum-DatePicker-value").text()).toContain("5");
  });

  it("prevents opening when date picker is disabled", async () => {
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        isDisabled: true,
      },
      attachTo: document.body,
    });

    const trigger = wrapper.get(".react-spectrum-DatePicker-button");
    expect(trigger.attributes("disabled")).toBeDefined();

    await trigger.trigger("click");
    await nextTick();

    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeNull();
  });

  it("prevents opening when date picker is read-only", async () => {
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        isReadOnly: true,
      },
      attachTo: document.body,
    });

    const trigger = wrapper.get(".react-spectrum-DatePicker-button");
    expect(trigger.attributes("disabled")).toBeDefined();

    await trigger.trigger("click");
    await nextTick();

    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeNull();
  });

  it("emits onOpenChange for open and close transitions", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        onOpenChange,
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DatePicker-button").trigger("click");
    await nextTick();
    expect(onOpenChange).toHaveBeenCalledWith(true);

    const day17 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "17");
    expect(day17).toBeTruthy();
    pressElement(day17!);
    await nextTick();

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("respects controlled isOpen updates", async () => {
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        isOpen: true,
      },
      attachTo: document.body,
    });

    await nextTick();
    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeTruthy();

    await wrapper.setProps({ isOpen: false });
    await nextTick();

    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeNull();
  });

  it("applies UNSAFE_className and UNSAFE_style to date picker root", () => {
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        UNSAFE_className: "custom-date-picker",
        UNSAFE_style: {
          borderWidth: "2px",
          borderStyle: "solid",
        },
      },
      attachTo: document.body,
    });

    const root = wrapper.get(".react-spectrum-DatePicker.custom-date-picker");
    const style = root.attributes("style");
    expect(style).toContain("border-width: 2px");
    expect(style).toContain("border-style: solid");
  });

  it("supports camel-case aria props on date picker group", () => {
    const wrapper = mount(DatePicker as any, {
      props: {
        ariaLabel: "Team date picker",
        ariaLabelledby: "team-date-label",
        defaultValue: new CalendarDate(2019, 6, 5),
      },
      attachTo: document.body,
    });

    const group = wrapper.get(".react-spectrum-DatePicker-group");
    expect(group.attributes("aria-label")).toContain("Team date picker");
    expect(group.attributes("aria-labelledby")).toContain("team-date-label");
  });

  it("renders custom error messages when invalid", () => {
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        validationState: "invalid",
        errorMessage: "Choose a valid date",
      },
      attachTo: document.body,
    });

    expect(wrapper.text()).toContain("Choose a valid date");
  });

  it("passes firstDayOfWeek through to calendar overlay", async () => {
    const defaultWrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
      },
      attachTo: document.body,
    });
    await defaultWrapper.get(".react-spectrum-DatePicker-button").trigger("click");
    await nextTick();
    const defaultFirstDay = document.body.querySelector(".react-spectrum-Calendar-weekday")?.textContent ?? "";
    defaultWrapper.unmount();
    document.body.innerHTML = "";

    const mondayWrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        firstDayOfWeek: "mon",
      },
      attachTo: document.body,
    });
    await mondayWrapper.get(".react-spectrum-DatePicker-button").trigger("click");
    await nextTick();
    const mondayFirstDay = document.body.querySelector(".react-spectrum-Calendar-weekday")?.textContent ?? "";

    expect(defaultFirstDay).not.toBe(mondayFirstDay);
    expect(mondayFirstDay.toLowerCase().startsWith("m")).toBe(true);
  });

  it("passes visibleMonths through to calendar overlay", async () => {
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        visibleMonths: 2,
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DatePicker-button").trigger("click");
    await nextTick();

    expect(document.body.querySelectorAll(".react-spectrum-Calendar-table")).toHaveLength(2);
  });

  it("passes pageBehavior through to calendar overlay navigation", async () => {
    const defaultWrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        visibleMonths: 2,
      },
      attachTo: document.body,
    });
    await defaultWrapper.get(".react-spectrum-DatePicker-button").trigger("click");
    await nextTick();

    const defaultNextButton = document.body.querySelectorAll(".react-spectrum-Calendar-navButton")[1];
    pressElement(defaultNextButton!);
    await nextTick();
    const defaultTitle = document.body.querySelector(".react-spectrum-Calendar-title")?.textContent ?? "";

    defaultWrapper.unmount();
    document.body.innerHTML = "";

    const singleWrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        visibleMonths: 2,
        pageBehavior: "single",
      },
      attachTo: document.body,
    });
    await singleWrapper.get(".react-spectrum-DatePicker-button").trigger("click");
    await nextTick();

    const singleNextButton = document.body.querySelectorAll(".react-spectrum-Calendar-navButton")[1];
    pressElement(singleNextButton!);
    await nextTick();
    const singleTitle = document.body.querySelector(".react-spectrum-Calendar-title")?.textContent ?? "";

    expect(defaultTitle).toContain("August");
    expect(singleTitle).toContain("July");
  });
});

describe("DateRangePicker", () => {
  it("renders with default range text", () => {
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
      },
      attachTo: document.body,
    });

    const text = wrapper.get(".react-spectrum-DateRangePicker-value").text();
    expect(text).toContain("June");
    expect(text).toContain("2019");
  });

  it("opens range-calendar popover", async () => {
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DateRangePicker-button").trigger("click");
    await nextTick();

    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeTruthy();
  });

  it("prevents opening when range picker is disabled", async () => {
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        isDisabled: true,
      },
      attachTo: document.body,
    });

    const trigger = wrapper.get(".react-spectrum-DateRangePicker-button");
    expect(trigger.attributes("disabled")).toBeDefined();

    await trigger.trigger("click");
    await nextTick();

    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeNull();
  });

  it("updates rendered range in controlled mode", async () => {
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        value: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
      },
      attachTo: document.body,
    });

    expect(wrapper.get(".react-spectrum-DateRangePicker-value").text()).toContain("5");

    await wrapper.setProps({
      value: {
        start: new CalendarDate(2019, 6, 10),
        end: new CalendarDate(2019, 6, 12),
      },
    });
    await nextTick();

    const text = wrapper.get(".react-spectrum-DateRangePicker-value").text();
    expect(text).toContain("10");
    expect(text).toContain("12");
  });

  it("keeps rendered range stable in controlled mode until prop updates", async () => {
    const onChange = vi.fn();
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        value: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        onChange,
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DateRangePicker-button").trigger("click");
    await nextTick();

    const day10 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "10");
    const day12 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "12");
    expect(day10).toBeTruthy();
    expect(day12).toBeTruthy();
    pressElement(day10!);
    pressElement(day12!);
    await nextTick();

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(wrapper.get(".react-spectrum-DateRangePicker-value").text()).toContain("5");
    expect(wrapper.get(".react-spectrum-DateRangePicker-value").text()).toContain("8");
  });

  it("commits a selected range through onChange", async () => {
    const onChange = vi.fn();
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        placeholderValue: new CalendarDate(2019, 6, 5),
        onChange,
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DateRangePicker-button").trigger("click");
    await nextTick();

    const day10 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "10");
    const day12 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "12");
    expect(day10).toBeTruthy();
    expect(day12).toBeTruthy();

    pressElement(day10!);
    pressElement(day12!);
    await nextTick();

    expect(onChange).toHaveBeenCalledTimes(1);
    const value = onChange.mock.calls[0]?.[0] as { start: CalendarDate; end: CalendarDate };
    expect(value.start.day).toBe(10);
    expect(value.end.day).toBe(12);
  });

  it("emits range onOpenChange for open and close transitions", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        placeholderValue: new CalendarDate(2019, 6, 5),
        onOpenChange,
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DateRangePicker-button").trigger("click");
    await nextTick();
    expect(onOpenChange).toHaveBeenCalledWith(true);

    const day10 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "10");
    const day12 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "12");
    expect(day10).toBeTruthy();
    expect(day12).toBeTruthy();

    pressElement(day10!);
    pressElement(day12!);
    await nextTick();

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("respects controlled range isOpen updates", async () => {
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        isOpen: true,
      },
      attachTo: document.body,
    });

    await nextTick();
    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeTruthy();

    await wrapper.setProps({ isOpen: false });
    await nextTick();

    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeNull();
  });

  it("applies UNSAFE_className and UNSAFE_style to range picker root", () => {
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        UNSAFE_className: "custom-range-picker",
        UNSAFE_style: {
          borderWidth: "3px",
          borderStyle: "dashed",
        },
      },
      attachTo: document.body,
    });

    const root = wrapper.get(".react-spectrum-DateRangePicker.custom-range-picker");
    const style = root.attributes("style");
    expect(style).toContain("border-width: 3px");
    expect(style).toContain("border-style: dashed");
  });

  it("supports camel-case aria props on range picker group", () => {
    const wrapper = mount(DateRangePicker as any, {
      props: {
        ariaLabel: "Team range picker",
        ariaLabelledby: "team-range-label",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
      },
      attachTo: document.body,
    });

    const group = wrapper.get(".react-spectrum-DateRangePicker-group");
    expect(group.attributes("aria-label")).toContain("Team range picker");
    expect(group.attributes("aria-labelledby")).toContain("team-range-label");
  });

  it("renders custom range error messages when invalid", () => {
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        validationState: "invalid",
        errorMessage: "Choose a valid range",
      },
      attachTo: document.body,
    });

    expect(wrapper.text()).toContain("Choose a valid range");
  });

  it("passes firstDayOfWeek through to range-calendar overlay", async () => {
    const defaultWrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
      },
      attachTo: document.body,
    });
    await defaultWrapper.get(".react-spectrum-DateRangePicker-button").trigger("click");
    await nextTick();
    const defaultFirstDay = document.body.querySelector(".react-spectrum-Calendar-weekday")?.textContent ?? "";
    defaultWrapper.unmount();
    document.body.innerHTML = "";

    const mondayWrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        firstDayOfWeek: "mon",
      },
      attachTo: document.body,
    });
    await mondayWrapper.get(".react-spectrum-DateRangePicker-button").trigger("click");
    await nextTick();
    const mondayFirstDay = document.body.querySelector(".react-spectrum-Calendar-weekday")?.textContent ?? "";

    expect(defaultFirstDay).not.toBe(mondayFirstDay);
    expect(mondayFirstDay.toLowerCase().startsWith("m")).toBe(true);
  });

  it("passes visibleMonths through to range-calendar overlay", async () => {
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        visibleMonths: 2,
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DateRangePicker-button").trigger("click");
    await nextTick();

    expect(document.body.querySelectorAll(".react-spectrum-Calendar-table")).toHaveLength(2);
  });

  it("passes pageBehavior through to range-calendar overlay navigation", async () => {
    const defaultWrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        visibleMonths: 2,
      },
      attachTo: document.body,
    });
    await defaultWrapper.get(".react-spectrum-DateRangePicker-button").trigger("click");
    await nextTick();

    const defaultNextButton = document.body.querySelectorAll(".react-spectrum-Calendar-navButton")[1];
    pressElement(defaultNextButton!);
    await nextTick();
    const defaultTitle = document.body.querySelector(".react-spectrum-Calendar-title")?.textContent ?? "";

    defaultWrapper.unmount();
    document.body.innerHTML = "";

    const singleWrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        visibleMonths: 2,
        pageBehavior: "single",
      },
      attachTo: document.body,
    });
    await singleWrapper.get(".react-spectrum-DateRangePicker-button").trigger("click");
    await nextTick();

    const singleNextButton = document.body.querySelectorAll(".react-spectrum-Calendar-navButton")[1];
    pressElement(singleNextButton!);
    await nextTick();
    const singleTitle = document.body.querySelector(".react-spectrum-Calendar-title")?.textContent ?? "";

    expect(defaultTitle).toContain("August");
    expect(singleTitle).toContain("July");
  });
});
