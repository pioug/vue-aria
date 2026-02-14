import { CalendarDate } from "@internationalized/date";
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { Calendar, RangeCalendar } from "../src";

async function press(target: { trigger: (event: string, options?: Record<string, unknown>) => Promise<unknown> }) {
  await target.trigger("pointerdown", {
    button: 0,
    pointerId: 1,
    pointerType: "mouse",
  });
  await target.trigger("pointerup", {
    button: 0,
    pointerId: 1,
    pointerType: "mouse",
  });
  await target.trigger("click", { button: 0 });
}

function createPointerEvent(type: "pointerdown" | "pointerup"): PointerEvent {
  if (typeof PointerEvent !== "undefined") {
    return new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      pointerType: "mouse",
      width: 1,
      height: 1,
    });
  }

  const event = new Event(type, { bubbles: true, cancelable: true }) as PointerEvent;
  Object.defineProperties(event, {
    pointerType: { value: "mouse" },
    width: { value: 1 },
    height: { value: 1 },
  });
  return event;
}

describe("Calendar", () => {
  it("renders a calendar with a default value", () => {
    const wrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2019, 6, 5),
      },
      attachTo: document.body,
    });

    expect(wrapper.get(".react-spectrum-Calendar-title").text()).toContain("June 2019");
    const selectedCells = wrapper.findAll('td[aria-selected="true"]');
    expect(selectedCells.length).toBeGreaterThan(0);
    expect(selectedCells[0]!.text()).toContain("5");
  });

  it("selects a date on click in uncontrolled mode", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2019, 6, 5),
        onChange,
      },
      attachTo: document.body,
    });

    const dateButtons = wrapper.findAll(".react-spectrum-Calendar-date");
    const day17 = dateButtons.find((cell) => cell.text() === "17");
    expect(day17).toBeTruthy();
    await press(day17!);

    expect(onChange).toHaveBeenCalled();
    const lastValue = onChange.mock.calls.at(-1)?.[0] as CalendarDate;
    expect(lastValue.month).toBe(6);
    expect(lastValue.day).toBe(17);
  });

  it("navigates months with next button", async () => {
    const wrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2019, 6, 5),
      },
      attachTo: document.body,
    });

    const initialTitle = wrapper.get(".react-spectrum-Calendar-title").text();
    const navButtons = wrapper.findAll(".react-spectrum-Calendar-navButton");
    await press(navButtons[1]!);

    const updatedTitle = wrapper.get(".react-spectrum-Calendar-title").text();
    expect(updatedTitle).not.toBe(initialTitle);
  });

  it("renders multiple month grids when visibleMonths is set", () => {
    const wrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2019, 6, 5),
        visibleMonths: 2,
      },
      attachTo: document.body,
    });

    expect(wrapper.findAll(".react-spectrum-Calendar-table")).toHaveLength(2);
  });

  it("applies UNSAFE_className and UNSAFE_style to the calendar root", () => {
    const wrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2019, 6, 5),
        UNSAFE_className: "custom-calendar",
        UNSAFE_style: {
          borderWidth: "2px",
          borderStyle: "solid",
        },
      },
      attachTo: document.body,
    });

    const root = wrapper.get(".react-spectrum-Calendar.custom-calendar");
    const style = root.attributes("style");
    expect(style).toContain("border-width: 2px");
    expect(style).toContain("border-style: solid");
  });

  it("renders an error message when provided", () => {
    const wrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2019, 6, 5),
        errorMessage: "Please choose a valid date",
      },
      attachTo: document.body,
    });

    expect(wrapper.get(".react-spectrum-Calendar-errorMessage").text()).toBe("Please choose a valid date");
  });

  it("renders a range calendar", () => {
    const wrapper = mount(RangeCalendar as any, {
      props: {
        "aria-label": "Range calendar",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
      },
      attachTo: document.body,
    });

    wrapper.get('[role="application"]');
    expect(wrapper.findAll('[role="grid"]').length).toBeGreaterThan(0);
  });

  it("selects a date range after two date clicks", async () => {
    const onChange = vi.fn();
    const wrapper = mount(RangeCalendar as any, {
      props: {
        "aria-label": "Range calendar",
        defaultFocusedValue: new CalendarDate(2019, 6, 5),
        onChange,
      },
      attachTo: document.body,
    });

    const dateButtons = wrapper.findAll(".react-spectrum-Calendar-date");
    const day17 = dateButtons.find((cell) => cell.text() === "17");
    const day21 = dateButtons.find((cell) => cell.text() === "21");
    expect(day17).toBeTruthy();
    expect(day21).toBeTruthy();

    await press(day17!);
    expect(onChange).not.toHaveBeenCalled();
    await press(day21!);

    expect(onChange).toHaveBeenCalledTimes(1);
    const rangeValue = onChange.mock.calls[0]?.[0] as {
      start: CalendarDate;
      end: CalendarDate;
    };
    expect(rangeValue.start.month).toBe(6);
    expect(rangeValue.start.day).toBe(17);
    expect(rangeValue.end.month).toBe(6);
    expect(rangeValue.end.day).toBe(21);
  });

  it("commits a single-day range when selection is blurred before completion", async () => {
    const onChange = vi.fn();
    const wrapper = mount(RangeCalendar as any, {
      props: {
        "aria-label": "Range calendar",
        defaultFocusedValue: new CalendarDate(2019, 6, 5),
        onChange,
      },
      attachTo: document.body,
    });

    const dateButtons = wrapper.findAll(".react-spectrum-Calendar-date");
    const day17 = dateButtons.find((cell) => cell.text() === "17");
    expect(day17).toBeTruthy();
    await press(day17!);

    expect(onChange).not.toHaveBeenCalled();
    await wrapper.get('[role="application"]').trigger("blur", { relatedTarget: null });

    expect(onChange).toHaveBeenCalledTimes(1);
    const rangeValue = onChange.mock.calls[0]?.[0] as {
      start: CalendarDate;
      end: CalendarDate;
    };
    expect(rangeValue.start.month).toBe(6);
    expect(rangeValue.start.day).toBe(17);
    expect(rangeValue.end.month).toBe(6);
    expect(rangeValue.end.day).toBe(17);
  });

  it("commits a single-day range when pointerup happens outside the calendar", async () => {
    const onChange = vi.fn();
    const wrapper = mount(RangeCalendar as any, {
      props: {
        "aria-label": "Range calendar",
        defaultFocusedValue: new CalendarDate(2019, 6, 5),
        onChange,
      },
      attachTo: document.body,
    });

    const dateButtons = wrapper.findAll(".react-spectrum-Calendar-date");
    const day17 = dateButtons.find((cell) => cell.text() === "17");
    expect(day17).toBeTruthy();
    await press(day17!);
    expect(onChange).not.toHaveBeenCalled();

    const outside = document.createElement("div");
    document.body.appendChild(outside);
    (day17!.element as HTMLElement).focus();
    outside.dispatchEvent(createPointerEvent("pointerdown"));
    outside.dispatchEvent(createPointerEvent("pointerup"));

    expect(onChange).toHaveBeenCalledTimes(1);
    const rangeValue = onChange.mock.calls[0]?.[0] as {
      start: CalendarDate;
      end: CalendarDate;
    };
    expect(rangeValue.start.month).toBe(6);
    expect(rangeValue.start.day).toBe(17);
    expect(rangeValue.end.month).toBe(6);
    expect(rangeValue.end.day).toBe(17);

    outside.remove();
  });
});
