import { CalendarDate, createCalendar as createIntlCalendar, type CalendarIdentifier } from "@internationalized/date";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
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

  it("uses defaultFocusedValue to determine initial calendar focus and month", () => {
    const wrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultFocusedValue: new CalendarDate(2019, 8, 15),
      },
      attachTo: document.body,
    });

    expect(wrapper.get(".react-spectrum-Calendar-title").text()).toContain("August 2019");
    expect(wrapper.get(".react-spectrum-Calendar-date[tabindex='0']").text()).toBe("15");
  });

  it("focuses the current calendar date when autoFocus is enabled", async () => {
    const wrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2019, 6, 5),
        autoFocus: true,
      },
      attachTo: document.body,
    });

    await nextTick();
    await nextTick();

    const focusedButton = wrapper.get(".react-spectrum-Calendar-date[tabindex='0']");
    expect(document.activeElement).toBe(focusedButton.element);
  });

  it("renders selected-date aria labels without unresolved template placeholders", () => {
    const wrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2019, 6, 5),
      },
      attachTo: document.body,
    });

    const selectedCell = wrapper.get('td[aria-selected="true"]');
    const selectedDateButton = selectedCell.get(".react-spectrum-Calendar-date");
    const selectedAriaLabel = selectedDateButton.attributes("aria-label");

    expect(selectedAriaLabel).toBeTruthy();
    expect(selectedAriaLabel).toContain("selected");
    expect(selectedAriaLabel).not.toContain("{date}");
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

  it("emits onFocusChange when focus moves to another date", async () => {
    const onFocusChange = vi.fn();
    const wrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2019, 6, 5),
        onFocusChange,
      },
      attachTo: document.body,
    });

    const day17 = wrapper.findAll(".react-spectrum-Calendar-date").find((cell) => cell.text() === "17");
    expect(day17).toBeTruthy();
    await press(day17!);

    expect(onFocusChange).toHaveBeenCalled();
    const focusedValue = onFocusChange.mock.calls.at(-1)?.[0] as CalendarDate;
    expect(focusedValue.month).toBe(6);
    expect(focusedValue.day).toBe(17);
  });

  it("honors controlled focusedValue updates for calendar focus state", async () => {
    const wrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2019, 6, 5),
        focusedValue: new CalendarDate(2019, 6, 5),
      },
      attachTo: document.body,
    });

    expect(wrapper.get(".react-spectrum-Calendar-date[tabindex='0']").text()).toBe("5");

    await wrapper.setProps({
      focusedValue: new CalendarDate(2019, 6, 17),
    });
    await nextTick();

    expect(wrapper.get(".react-spectrum-Calendar-date[tabindex='0']").text()).toBe("17");
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

  it("updates selected calendar cell when controlled value prop changes", async () => {
    const wrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        value: new CalendarDate(2019, 6, 5),
      },
      attachTo: document.body,
    });

    expect(wrapper.get('td[aria-selected="true"] .react-spectrum-Calendar-date').text()).toBe("5");

    await wrapper.setProps({
      value: new CalendarDate(2019, 6, 17),
    });
    await nextTick();

    expect(wrapper.get('td[aria-selected="true"] .react-spectrum-Calendar-date').text()).toBe("17");
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

  it("supports pageBehavior differences for multi-month navigation", async () => {
    const defaultWrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2019, 6, 5),
        visibleMonths: 2,
      },
      attachTo: document.body,
    });
    const singleWrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2019, 6, 5),
        visibleMonths: 2,
        pageBehavior: "single",
      },
      attachTo: document.body,
    });

    await press(defaultWrapper.findAll(".react-spectrum-Calendar-navButton")[1]!);
    await press(singleWrapper.findAll(".react-spectrum-Calendar-navButton")[1]!);

    const defaultTitle = defaultWrapper.get(".react-spectrum-Calendar-title").text();
    const singleTitle = singleWrapper.get(".react-spectrum-Calendar-title").text();
    expect(defaultTitle).toContain("August");
    expect(singleTitle).toContain("July");
  });

  it("applies selectionAlignment to multi-month initial visible range", () => {
    const startAligned = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2019, 6, 5),
        visibleMonths: 2,
        selectionAlignment: "start",
      },
      attachTo: document.body,
    });
    const endAligned = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2019, 6, 5),
        visibleMonths: 2,
        selectionAlignment: "end",
      },
      attachTo: document.body,
    });

    const startTitle = startAligned.get(".react-spectrum-Calendar-title").text();
    const endTitle = endAligned.get(".react-spectrum-Calendar-title").text();

    expect(startTitle).toContain("July");
    expect(endTitle).toContain("May");
    expect(startTitle).not.toBe(endTitle);
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

  it("applies locale overrides to default weekday ordering", () => {
    const enWrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2019, 6, 5),
        locale: "en-US",
      },
      attachTo: document.body,
    });
    const frWrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2019, 6, 5),
        locale: "fr-FR",
      },
      attachTo: document.body,
    });

    const enFirstDay = enWrapper.findAll(".react-spectrum-Calendar-weekday")[0]?.text() ?? "";
    const frFirstDay = frWrapper.findAll(".react-spectrum-Calendar-weekday")[0]?.text() ?? "";

    expect(frFirstDay).not.toBe(enFirstDay);
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

  it("prevents selection changes when calendar is read-only", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2019, 6, 5),
        isReadOnly: true,
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

  it("updates next navigation disabled state after paging into max boundary", async () => {
    const wrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2020, 1, 15),
        maxValue: new CalendarDate(2020, 2, 29),
      },
      attachTo: document.body,
    });

    const getNextButton = () => wrapper.findAll(".react-spectrum-Calendar-navButton")[1];
    expect(getNextButton()).toBeTruthy();
    expect(getNextButton()?.attributes("disabled")).toBeUndefined();
    expect(getNextButton()?.attributes("aria-disabled")).not.toBe("true");

    await press(getNextButton()!);

    const disabledAttr = getNextButton()?.attributes("disabled");
    const ariaDisabled = getNextButton()?.attributes("aria-disabled");
    expect(disabledAttr !== undefined || ariaDisabled === "true").toBe(true);
  });

  it("disables previous navigation when minValue blocks the previous visible range", () => {
    const wrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2020, 1, 15),
        minValue: new CalendarDate(2020, 1, 1),
      },
      attachTo: document.body,
    });

    const prevButton = wrapper.findAll(".react-spectrum-Calendar-navButton")[0];
    expect(prevButton).toBeTruthy();
    const disabledAttr = prevButton?.attributes("disabled");
    const ariaDisabled = prevButton?.attributes("aria-disabled");
    expect(disabledAttr !== undefined || ariaDisabled === "true").toBe(true);
  });

  it("updates previous navigation disabled state after paging into min boundary", async () => {
    const wrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2020, 2, 15),
        minValue: new CalendarDate(2020, 1, 1),
      },
      attachTo: document.body,
    });

    const getPrevButton = () => wrapper.findAll(".react-spectrum-Calendar-navButton")[0];
    expect(getPrevButton()).toBeTruthy();
    expect(getPrevButton()?.attributes("disabled")).toBeUndefined();
    expect(getPrevButton()?.attributes("aria-disabled")).not.toBe("true");

    await press(getPrevButton()!);

    const disabledAttr = getPrevButton()?.attributes("disabled");
    const ariaDisabled = getPrevButton()?.attributes("aria-disabled");
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

  it("marks selected calendar cells invalid when validationState is invalid", () => {
    const wrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2019, 6, 5),
        validationState: "invalid",
      },
      attachTo: document.body,
    });

    const selectedCell = wrapper.get('td[aria-selected="true"]');
    expect(selectedCell.classes()).toContain("is-invalid");
    expect(selectedCell.attributes("aria-invalid")).toBe("true");
    expect(selectedCell.get(".react-spectrum-Calendar-date").attributes("aria-invalid")).toBe("true");
  });

  it("marks selected calendar cells invalid when isInvalid is true", () => {
    const wrapper = mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2019, 6, 5),
        isInvalid: true,
      },
      attachTo: document.body,
    });

    const selectedCell = wrapper.get('td[aria-selected="true"]');
    expect(selectedCell.classes()).toContain("is-invalid");
    expect(selectedCell.attributes("aria-invalid")).toBe("true");
  });

  it("uses a custom createCalendar implementation when provided", () => {
    const createCalendar = vi.fn((name: CalendarIdentifier) => createIntlCalendar(name));
    mount(Calendar as any, {
      props: {
        "aria-label": "Calendar",
        defaultValue: new CalendarDate(2019, 6, 5),
        createCalendar,
      },
      attachTo: document.body,
    });

    expect(createCalendar).toHaveBeenCalled();
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

  it("merges ariaLabelledby with generated id when ariaLabel is present", () => {
    const wrapper = mount(Calendar as any, {
      props: {
        ariaLabel: "Team calendar",
        ariaLabelledby: "external-calendar-label",
        defaultValue: new CalendarDate(2019, 6, 5),
      },
      attachTo: document.body,
    });

    const root = wrapper.get('[role="application"]');
    const labelledBy = root.attributes("aria-labelledby");
    expect(labelledBy).toContain("external-calendar-label");
    expect(labelledBy).toContain(root.attributes("id"));
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

  it("uses defaultFocusedValue to determine initial range-calendar focus and month", () => {
    const wrapper = mount(RangeCalendar as any, {
      props: {
        "aria-label": "Range calendar",
        defaultFocusedValue: new CalendarDate(2019, 8, 15),
      },
      attachTo: document.body,
    });

    expect(wrapper.get(".react-spectrum-Calendar-title").text()).toContain("August 2019");
    expect(wrapper.get(".react-spectrum-Calendar-date[tabindex='0']").text()).toBe("15");
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

  it("focuses the current range-calendar date when autoFocus is enabled", async () => {
    const wrapper = mount(RangeCalendar as any, {
      props: {
        "aria-label": "Range calendar",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        autoFocus: true,
      },
      attachTo: document.body,
    });

    await nextTick();
    await nextTick();

    const focusedButton = wrapper.get(".react-spectrum-Calendar-date[tabindex='0']");
    expect(document.activeElement).toBe(focusedButton.element);
  });

  it("merges range-calendar ariaLabelledby with generated id when ariaLabel is present", () => {
    const wrapper = mount(RangeCalendar as any, {
      props: {
        ariaLabel: "Trip planner",
        ariaLabelledby: "external-trip-label",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
      },
      attachTo: document.body,
    });

    const root = wrapper.get('[role="application"]');
    const labelledBy = root.attributes("aria-labelledby");
    expect(labelledBy).toContain("external-trip-label");
    expect(labelledBy).toContain(root.attributes("id"));
  });

  it("applies UNSAFE_className and UNSAFE_style to the range-calendar root", () => {
    const wrapper = mount(RangeCalendar as any, {
      props: {
        "aria-label": "Range calendar",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        UNSAFE_className: "custom-range-calendar",
        UNSAFE_style: {
          borderWidth: "3px",
          borderStyle: "dashed",
        },
      },
      attachTo: document.body,
    });

    const root = wrapper.get(".react-spectrum-Calendar.custom-range-calendar");
    const style = root.attributes("style");
    expect(style).toContain("border-width: 3px");
    expect(style).toContain("border-style: dashed");
  });

  it("renders range-calendar error messages when provided", () => {
    const wrapper = mount(RangeCalendar as any, {
      props: {
        "aria-label": "Range calendar",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        errorMessage: "Please pick a valid range",
      },
      attachTo: document.body,
    });

    expect(wrapper.get(".react-spectrum-Calendar-errorMessage").text()).toBe("Please pick a valid range");
  });

  it("marks selected range cells invalid when validationState is invalid", () => {
    const wrapper = mount(RangeCalendar as any, {
      props: {
        "aria-label": "Range calendar",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        validationState: "invalid",
      },
      attachTo: document.body,
    });

    const selectedInvalidCells = wrapper.findAll("td.is-selected.is-invalid");
    expect(selectedInvalidCells.length).toBeGreaterThan(0);
    expect(selectedInvalidCells[0]?.attributes("aria-invalid")).toBe("true");
  });

  it("marks selected range cells invalid when isInvalid is true", () => {
    const wrapper = mount(RangeCalendar as any, {
      props: {
        "aria-label": "Range calendar",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        isInvalid: true,
      },
      attachTo: document.body,
    });

    const selectedInvalidCells = wrapper.findAll("td.is-selected.is-invalid");
    expect(selectedInvalidCells.length).toBeGreaterThan(0);
    expect(selectedInvalidCells[0]?.attributes("aria-invalid")).toBe("true");
  });

  it("uses a custom createCalendar implementation in range-calendar mode", () => {
    const createCalendar = vi.fn((name: CalendarIdentifier) => createIntlCalendar(name));
    mount(RangeCalendar as any, {
      props: {
        "aria-label": "Range calendar",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        createCalendar,
      },
      attachTo: document.body,
    });

    expect(createCalendar).toHaveBeenCalled();
  });

  it("disables range-calendar previous navigation when minValue blocks paging", () => {
    const wrapper = mount(RangeCalendar as any, {
      props: {
        "aria-label": "Range calendar",
        defaultValue: {
          start: new CalendarDate(2020, 1, 10),
          end: new CalendarDate(2020, 1, 12),
        },
        minValue: new CalendarDate(2020, 1, 1),
      },
      attachTo: document.body,
    });

    const prevButton = wrapper.findAll(".react-spectrum-Calendar-navButton")[0];
    expect(prevButton).toBeTruthy();
    const disabledAttr = prevButton?.attributes("disabled");
    const ariaDisabled = prevButton?.attributes("aria-disabled");
    expect(disabledAttr !== undefined || ariaDisabled === "true").toBe(true);
  });

  it("updates range-calendar previous navigation disabled state after paging into min boundary", async () => {
    const wrapper = mount(RangeCalendar as any, {
      props: {
        "aria-label": "Range calendar",
        defaultValue: {
          start: new CalendarDate(2020, 2, 10),
          end: new CalendarDate(2020, 2, 12),
        },
        minValue: new CalendarDate(2020, 1, 1),
      },
      attachTo: document.body,
    });

    const getPrevButton = () => wrapper.findAll(".react-spectrum-Calendar-navButton")[0];
    expect(getPrevButton()).toBeTruthy();
    expect(getPrevButton()?.attributes("disabled")).toBeUndefined();
    expect(getPrevButton()?.attributes("aria-disabled")).not.toBe("true");

    await press(getPrevButton()!);

    const disabledAttr = getPrevButton()?.attributes("disabled");
    const ariaDisabled = getPrevButton()?.attributes("aria-disabled");
    expect(disabledAttr !== undefined || ariaDisabled === "true").toBe(true);
  });

  it("disables range-calendar next navigation when maxValue blocks paging", () => {
    const wrapper = mount(RangeCalendar as any, {
      props: {
        "aria-label": "Range calendar",
        defaultValue: {
          start: new CalendarDate(2020, 1, 10),
          end: new CalendarDate(2020, 1, 12),
        },
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

  it("updates range-calendar next navigation disabled state after paging into max boundary", async () => {
    const wrapper = mount(RangeCalendar as any, {
      props: {
        "aria-label": "Range calendar",
        defaultValue: {
          start: new CalendarDate(2020, 1, 10),
          end: new CalendarDate(2020, 1, 12),
        },
        maxValue: new CalendarDate(2020, 2, 29),
      },
      attachTo: document.body,
    });

    const getNextButton = () => wrapper.findAll(".react-spectrum-Calendar-navButton")[1];
    expect(getNextButton()).toBeTruthy();
    expect(getNextButton()?.attributes("disabled")).toBeUndefined();
    expect(getNextButton()?.attributes("aria-disabled")).not.toBe("true");

    await press(getNextButton()!);

    const disabledAttr = getNextButton()?.attributes("disabled");
    const ariaDisabled = getNextButton()?.attributes("aria-disabled");
    expect(disabledAttr !== undefined || ariaDisabled === "true").toBe(true);
  });

  it("renders selected range cell aria labels without unresolved placeholders", () => {
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

    const selectedCells = wrapper.findAll('td[aria-selected="true"]');
    expect(selectedCells.length).toBeGreaterThan(0);

    const selectedDateButton = selectedCells[0]!.find(".react-spectrum-Calendar-date");
    const selectedAriaLabel = selectedDateButton.attributes("aria-label");
    expect(selectedAriaLabel).toBeTruthy();
    expect(selectedAriaLabel).not.toMatch(/\{[A-Za-z_][A-Za-z0-9_-]*\}/);
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

  it("supports pageBehavior differences for multi-month range-calendar navigation", async () => {
    const defaultWrapper = mount(RangeCalendar as any, {
      props: {
        "aria-label": "Range calendar",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        visibleMonths: 2,
      },
      attachTo: document.body,
    });
    const singleWrapper = mount(RangeCalendar as any, {
      props: {
        "aria-label": "Range calendar",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        visibleMonths: 2,
        pageBehavior: "single",
      },
      attachTo: document.body,
    });

    await press(defaultWrapper.findAll(".react-spectrum-Calendar-navButton")[1]!);
    await press(singleWrapper.findAll(".react-spectrum-Calendar-navButton")[1]!);

    const defaultTitle = defaultWrapper.get(".react-spectrum-Calendar-title").text();
    const singleTitle = singleWrapper.get(".react-spectrum-Calendar-title").text();
    expect(defaultTitle).toContain("August");
    expect(singleTitle).toContain("July");
  });

  it("applies selectionAlignment to multi-month range-calendar initial visible range", () => {
    const startAligned = mount(RangeCalendar as any, {
      props: {
        "aria-label": "Range calendar",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        visibleMonths: 2,
        selectionAlignment: "start",
      },
      attachTo: document.body,
    });
    const endAligned = mount(RangeCalendar as any, {
      props: {
        "aria-label": "Range calendar",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        visibleMonths: 2,
        selectionAlignment: "end",
      },
      attachTo: document.body,
    });

    const startTitle = startAligned.get(".react-spectrum-Calendar-title").text();
    const endTitle = endAligned.get(".react-spectrum-Calendar-title").text();

    expect(startTitle).toContain("July");
    expect(endTitle).toContain("May");
    expect(startTitle).not.toBe(endTitle);
  });

  it("applies locale overrides to range-calendar default weekday ordering", () => {
    const enWrapper = mount(RangeCalendar as any, {
      props: {
        "aria-label": "Range calendar",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        locale: "en-US",
      },
      attachTo: document.body,
    });
    const frWrapper = mount(RangeCalendar as any, {
      props: {
        "aria-label": "Range calendar",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        locale: "fr-FR",
      },
      attachTo: document.body,
    });

    const enFirstDay = enWrapper.findAll(".react-spectrum-Calendar-weekday")[0]?.text() ?? "";
    const frFirstDay = frWrapper.findAll(".react-spectrum-Calendar-weekday")[0]?.text() ?? "";

    expect(frFirstDay).not.toBe(enFirstDay);
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

  it("emits range-calendar onFocusChange as focus moves across dates", async () => {
    const onFocusChange = vi.fn();
    const wrapper = mount(RangeCalendar as any, {
      props: {
        "aria-label": "Range calendar",
        defaultFocusedValue: new CalendarDate(2019, 6, 5),
        onFocusChange,
      },
      attachTo: document.body,
    });

    const day17 = wrapper.findAll(".react-spectrum-Calendar-date").find((cell) => cell.text() === "17");
    expect(day17).toBeTruthy();
    await press(day17!);

    expect(onFocusChange).toHaveBeenCalled();
    const focusedValue = onFocusChange.mock.calls.at(-1)?.[0] as CalendarDate;
    expect(focusedValue.month).toBe(6);
    expect(focusedValue.day).toBe(17);
  });

  it("honors controlled focusedValue updates for range-calendar focus state", async () => {
    const wrapper = mount(RangeCalendar as any, {
      props: {
        "aria-label": "Range calendar",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        focusedValue: new CalendarDate(2019, 6, 5),
      },
      attachTo: document.body,
    });

    expect(wrapper.get(".react-spectrum-Calendar-date[tabindex='0']").text()).toBe("5");

    await wrapper.setProps({
      focusedValue: new CalendarDate(2019, 6, 17),
    });
    await nextTick();

    expect(wrapper.get(".react-spectrum-Calendar-date[tabindex='0']").text()).toBe("17");
  });

  it("prevents range selection changes when range-calendar is disabled", async () => {
    const onChange = vi.fn();
    const wrapper = mount(RangeCalendar as any, {
      props: {
        "aria-label": "Range calendar",
        defaultFocusedValue: new CalendarDate(2019, 6, 5),
        isDisabled: true,
        onChange,
      },
      attachTo: document.body,
    });

    const day10 = wrapper.findAll(".react-spectrum-Calendar-date").find((cell) => cell.text() === "10");
    const day12 = wrapper.findAll(".react-spectrum-Calendar-date").find((cell) => cell.text() === "12");
    expect(day10).toBeTruthy();
    expect(day12).toBeTruthy();

    await press(day10!);
    await press(day12!);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("prevents range selection changes when range-calendar is read-only", async () => {
    const onChange = vi.fn();
    const wrapper = mount(RangeCalendar as any, {
      props: {
        "aria-label": "Range calendar",
        defaultFocusedValue: new CalendarDate(2019, 6, 5),
        isReadOnly: true,
        onChange,
      },
      attachTo: document.body,
    });

    const day10 = wrapper.findAll(".react-spectrum-Calendar-date").find((cell) => cell.text() === "10");
    const day12 = wrapper.findAll(".react-spectrum-Calendar-date").find((cell) => cell.text() === "12");
    expect(day10).toBeTruthy();
    expect(day12).toBeTruthy();

    await press(day10!);
    await press(day12!);
    expect(onChange).not.toHaveBeenCalled();
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

  it("updates selected range cells when controlled value prop changes", async () => {
    const wrapper = mount(RangeCalendar as any, {
      props: {
        "aria-label": "Range calendar",
        value: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
      },
      attachTo: document.body,
    });

    const initialSelected = wrapper.findAll('td[aria-selected="true"] .react-spectrum-Calendar-date').map((cell) => cell.text());
    expect(initialSelected).toContain("5");
    expect(initialSelected).toContain("8");

    await wrapper.setProps({
      value: {
        start: new CalendarDate(2019, 6, 10),
        end: new CalendarDate(2019, 6, 12),
      },
    });
    await nextTick();

    const updatedSelected = wrapper.findAll('td[aria-selected="true"] .react-spectrum-Calendar-date').map((cell) => cell.text());
    expect(updatedSelected).toContain("10");
    expect(updatedSelected).toContain("12");
    expect(updatedSelected).not.toContain("5");
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

  it("constrains unavailable dates for contiguous range selection by default", async () => {
    const onChange = vi.fn();
    const wrapper = mount(RangeCalendar as any, {
      props: {
        "aria-label": "Range calendar",
        defaultFocusedValue: new CalendarDate(2019, 6, 10),
        isDateUnavailable: (date: { day: number }) => date.day === 12,
        onChange,
      },
      attachTo: document.body,
    });

    const day10 = wrapper.findAll(".react-spectrum-Calendar-date").find((cell) => cell.text() === "10");
    const day14 = wrapper.findAll(".react-spectrum-Calendar-date").find((cell) => cell.text() === "14");
    expect(day10).toBeTruthy();
    expect(day14).toBeTruthy();

    await press(day10!);
    await press(day14!);

    expect(onChange).toHaveBeenCalledTimes(1);
    const rangeValue = onChange.mock.calls[0]?.[0] as {
      start: CalendarDate;
      end: CalendarDate;
    };
    expect(rangeValue.start.day).toBe(10);
    expect(rangeValue.end.day).toBe(11);
  });

  it("allows non-contiguous ranges when explicitly enabled", async () => {
    const onChange = vi.fn();
    const wrapper = mount(RangeCalendar as any, {
      props: {
        "aria-label": "Range calendar",
        defaultFocusedValue: new CalendarDate(2019, 6, 10),
        isDateUnavailable: (date: { day: number }) => date.day === 12,
        allowsNonContiguousRanges: true,
        onChange,
      },
      attachTo: document.body,
    });

    const day10 = wrapper.findAll(".react-spectrum-Calendar-date").find((cell) => cell.text() === "10");
    const day14 = wrapper.findAll(".react-spectrum-Calendar-date").find((cell) => cell.text() === "14");
    expect(day10).toBeTruthy();
    expect(day14).toBeTruthy();

    await press(day10!);
    await press(day14!);

    expect(onChange).toHaveBeenCalledTimes(1);
    const rangeValue = onChange.mock.calls[0]?.[0] as {
      start: CalendarDate;
      end: CalendarDate;
    };
    expect(rangeValue.start.day).toBe(10);
    expect(rangeValue.end.day).toBe(14);
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
