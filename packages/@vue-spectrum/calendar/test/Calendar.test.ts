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
});
