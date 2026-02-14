import { CalendarDate } from "@internationalized/date";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { describe, expect, it, vi } from "vitest";
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
});
