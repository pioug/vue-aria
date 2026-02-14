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

  it("keeps visual selection stable in controlled calendar mode", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        value: new CalendarDate(2019, 6, 5),
        onChange,
      },
      attachTo: document.body,
    });

    const day17 = wrapper.findAll(".react-spectrum-Calendar-date").find((cell) => cell.text() === "17");
    const day5 = wrapper.findAll(".react-spectrum-Calendar-date").find((cell) => cell.text() === "5");
    expect(day17).toBeTruthy();
    expect(day5).toBeTruthy();

    await press(day17!);
    expect(onChange).toHaveBeenCalledTimes(1);

    expect(day17?.element.closest("td")?.getAttribute("aria-selected")).not.toBe("true");
    expect(day5?.element.closest("td")?.getAttribute("aria-selected")).toBe("true");
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

  it("clamps visibleMonths to one month for zero or negative values", () => {
    const zeroWrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2019, 6, 5),
        visibleMonths: 0,
      },
      attachTo: document.body,
    });
    const negativeWrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2019, 6, 5),
        visibleMonths: -2,
      },
      attachTo: document.body,
    });

    expect(zeroWrapper.findAll(".react-spectrum-Calendar-table")).toHaveLength(1);
    expect(negativeWrapper.findAll(".react-spectrum-Calendar-table")).toHaveLength(1);
  });

  it("applies firstDayOfWeek to weekday ordering", () => {
    const defaultWrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2019, 6, 5),
      },
      attachTo: document.body,
    });
    const mondayWrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2019, 6, 5),
        firstDayOfWeek: "mon",
      },
      attachTo: document.body,
    });

    const defaultFirstDay = defaultWrapper.findAll(".react-spectrum-Calendar-weekday")[0]?.text() ?? "";
    const mondayFirstDay = mondayWrapper.findAll(".react-spectrum-Calendar-weekday")[0]?.text() ?? "";

    expect(defaultFirstDay).not.toBe(mondayFirstDay);
    expect(mondayFirstDay.toLowerCase().startsWith("m")).toBe(true);
  });

  it("prevents selection changes when calendar is disabled", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2019, 6, 5),
        isDisabled: true,
        onChange,
      },
      attachTo: document.body,
    });

    const day17 = wrapper.findAll(".react-spectrum-Calendar-date").find((cell) => cell.text() === "17");
    expect(day17).toBeTruthy();
    await press(day17!);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disables next navigation when maxValue blocks the next visible range", () => {
    const wrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2020, 1, 15),
        maxValue: new CalendarDate(2020, 1, 31),
      },
      attachTo: document.body,
    });

    const nextButton = wrapper.findAll(".react-spectrum-Calendar-navButton")[1];
    expect(nextButton).toBeTruthy();
    const disabledAttr = nextButton?.attributes("disabled");
    const ariaDisabled = nextButton?.attributes("aria-disabled");
    expect(disabledAttr !== undefined || ariaDisabled === "true").toBe(true);
  });

  it("marks unavailable dates and prevents selecting them", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2019, 6, 5),
        isDateUnavailable: (date: { day: number }) => date.day === 17,
        onChange,
      },
      attachTo: document.body,
    });

    const day17 = wrapper.findAll(".react-spectrum-Calendar-date").find((cell) => cell.text() === "17");
    expect(day17).toBeTruthy();

    const day17Cell = day17?.element.closest("td");
    expect(day17Cell?.classList.contains("is-unavailable")).toBe(true);
    expect(day17?.attributes("aria-disabled")).toBe("true");

    await press(day17!);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("enforces min/max date boundaries for interaction", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2019, 6, 15),
        minValue: new CalendarDate(2019, 6, 10),
        maxValue: new CalendarDate(2019, 6, 20),
        onChange,
      },
      attachTo: document.body,
    });

    const day9 = wrapper.findAll(".react-spectrum-Calendar-date").find((cell) => cell.text() === "9");
    const day10 = wrapper.findAll(".react-spectrum-Calendar-date").find((cell) => cell.text() === "10");
    expect(day9).toBeTruthy();
    expect(day10).toBeTruthy();

    expect(day9?.attributes("aria-disabled")).toBe("true");
    expect(day10?.attributes("aria-disabled")).toBeUndefined();

    await press(day9!);
    expect(onChange).not.toHaveBeenCalled();
    await press(day10!);
    expect(onChange).toHaveBeenCalledTimes(1);
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

  it("applies a computed aria-label including visible range context", () => {
    const wrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2019, 6, 5),
      },
      attachTo: document.body,
    });

    const root = wrapper.get('[role="application"]');
    const ariaLabel = root.attributes("aria-label");
    expect(ariaLabel).toContain("Calendar");
    expect(ariaLabel).toContain("June 2019");
  });

  it("supports camel-case aria props on calendar root", () => {
    const wrapper = mount(Calendar as any, {
      props: {
        ariaLabel: "Team calendar",
        ariaLabelledby: "team-calendar-label",
        ariaDescribedby: "team-calendar-help",
        defaultValue: new CalendarDate(2019, 6, 5),
      },
      attachTo: document.body,
    });

    const root = wrapper.get('[role="application"]');
    expect(root.attributes("aria-label")).toContain("Team calendar");
    expect(root.attributes("aria-labelledby")).toContain("team-calendar-label");
    expect(root.attributes("aria-describedby")).toContain("team-calendar-help");
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

  it("supports camel-case aria props on range-calendar root", () => {
    const wrapper = mount(RangeCalendar as any, {
      props: {
        ariaLabel: "Trip planner",
        ariaLabelledby: "trip-planner-label",
        ariaDescribedby: "trip-planner-help",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
      },
      attachTo: document.body,
    });

    const root = wrapper.get('[role="application"]');
    expect(root.attributes("aria-label")).toContain("Trip planner");
    expect(root.attributes("aria-labelledby")).toContain("trip-planner-label");
    expect(root.attributes("aria-describedby")).toContain("trip-planner-help");
  });

  it("clamps range-calendar visibleMonths to one month for zero or negative values", () => {
    const zeroWrapper = mount(RangeCalendar as any, {
      props: {
        "aria-label": "Range calendar",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        visibleMonths: 0,
      },
      attachTo: document.body,
    });
    const negativeWrapper = mount(RangeCalendar as any, {
      props: {
        "aria-label": "Range calendar",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        visibleMonths: -2,
      },
      attachTo: document.body,
    });

    expect(zeroWrapper.findAll(".react-spectrum-Calendar-table")).toHaveLength(1);
    expect(negativeWrapper.findAll(".react-spectrum-Calendar-table")).toHaveLength(1);
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

  it("keeps visual range stable in controlled range-calendar mode", async () => {
    const onChange = vi.fn();
    const wrapper = mount(RangeCalendar as any, {
      props: {
        "aria-label": "Range calendar",
        value: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        onChange,
      },
      attachTo: document.body,
    });

    const day17 = wrapper.findAll(".react-spectrum-Calendar-date").find((cell) => cell.text() === "17");
    const day5 = wrapper.findAll(".react-spectrum-Calendar-date").find((cell) => cell.text() === "5");
    expect(day17).toBeTruthy();
    expect(day5).toBeTruthy();

    await press(day17!);
    expect(onChange).not.toHaveBeenCalled();
    await press(day17!);
    expect(onChange).toHaveBeenCalledTimes(1);

    expect(day17?.element.closest("td")?.getAttribute("aria-selected")).not.toBe("true");
    expect(day5?.element.closest("td")?.getAttribute("aria-selected")).toBe("true");
  });

  it("normalizes reverse-order range selection into start/end order", async () => {
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

    await press(day21!);
    expect(onChange).not.toHaveBeenCalled();
    await press(day17!);

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
