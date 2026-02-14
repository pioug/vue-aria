import { CalendarDate, CalendarDateTime, parseZonedDateTime } from "@internationalized/date";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Provider } from "@vue-spectrum/provider";
import { theme } from "@vue-spectrum/theme";
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

  it("forwards granularity to state validation for date picker values", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      expect(() =>
        mount(DatePicker as any, {
          props: {
            "aria-label": "Date picker",
            defaultValue: new CalendarDate(2019, 6, 5),
            granularity: "minute",
          },
          attachTo: document.body,
        })
      ).toThrow(/Invalid granularity/);
    } finally {
      warnSpy.mockRestore();
    }
  });

  it("accepts CalendarDateTime values when minute granularity is provided", () => {
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDateTime(2019, 6, 5, 9, 30),
        granularity: "minute",
        hourCycle: 24,
        shouldForceLeadingZeros: true,
      },
      attachTo: document.body,
    });

    expect(wrapper.get(".react-spectrum-DatePicker-value").classes()).not.toContain("is-placeholder");
    expect(wrapper.get(".react-spectrum-DatePicker-value").text()).toContain("2019");
  });

  it("renders timezone text for ZonedDateTime values when hideTimeZone is false", () => {
    const zonedValue = parseZonedDateTime("2019-06-05T09:30[America/New_York]");
    const withZone = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: zonedValue,
        granularity: "minute",
        hourCycle: 24,
        shouldForceLeadingZeros: true,
        hideTimeZone: false,
      },
      attachTo: document.body,
    });

    const withoutZone = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: zonedValue,
        granularity: "minute",
        hourCycle: 24,
        shouldForceLeadingZeros: true,
        hideTimeZone: true,
      },
      attachTo: document.body,
    });

    const withZoneText = withZone.get(".react-spectrum-DatePicker-value").text();
    const withoutZoneText = withoutZone.get(".react-spectrum-DatePicker-value").text();

    expect(withZoneText).toContain("09:30");
    expect(withoutZoneText).toContain("09:30");
    expect(withZoneText).not.toBe(withoutZoneText);
    expect(withZoneText.length).toBeGreaterThan(withoutZoneText.length);
  });

  it("renders custom placeholder text until a date is selected", async () => {
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        placeholder: "Pick a day",
        placeholderValue: new CalendarDate(2019, 6, 5),
      },
      attachTo: document.body,
    });

    const value = wrapper.get(".react-spectrum-DatePicker-value");
    expect(value.text()).toBe("Pick a day");
    expect(value.classes()).toContain("is-placeholder");

    await wrapper.get(".react-spectrum-DatePicker-button").trigger("click");
    await nextTick();

    const day17 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "17");
    expect(day17).toBeTruthy();
    pressElement(day17!);
    await nextTick();

    expect(wrapper.get(".react-spectrum-DatePicker-value").text()).not.toBe("Pick a day");
    expect(wrapper.get(".react-spectrum-DatePicker-value").classes()).not.toContain("is-placeholder");
  });

  it("serializes hidden form input value when name is provided", () => {
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        name: "eventDate",
        form: "event-form",
      },
      attachTo: document.body,
    });

    const input = wrapper.get('input[type="hidden"][name="eventDate"]');
    expect(input.element.getAttribute("value")).toBe("2019-06-05");
    expect(input.element.getAttribute("form")).toBe("event-form");
  });

  it("updates hidden form input value after date selection", async () => {
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        name: "eventDate",
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DatePicker-button").trigger("click");
    await nextTick();

    const day17 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "17");
    expect(day17).toBeTruthy();

    pressElement(day17!);
    await nextTick();

    const input = wrapper.get('input[type="hidden"][name="eventDate"]');
    expect(input.element.getAttribute("value")).toBe("2019-06-17");
  });

  it("focuses date picker trigger when autoFocus is enabled", async () => {
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        autoFocus: true,
      },
      attachTo: document.body,
    });

    await nextTick();
    await nextTick();

    expect(document.activeElement).toBe(wrapper.get(".react-spectrum-DatePicker-button").element);
  });

  it("does not focus date picker trigger when disabled with autoFocus", async () => {
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        autoFocus: true,
        isDisabled: true,
      },
      attachTo: document.body,
    });

    await nextTick();
    await nextTick();

    expect(document.activeElement).not.toBe(wrapper.get(".react-spectrum-DatePicker-button").element);
  });

  it("passes through data attributes on date picker root", () => {
    const wrapper = mount(DatePicker as any, {
      attrs: {
        "data-testid": "date-picker-root",
      },
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
      },
      attachTo: document.body,
    });

    expect(wrapper.get(".react-spectrum-DatePicker").attributes("data-testid")).toBe("date-picker-root");
  });

  it("exposes imperative date picker handles", async () => {
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
      },
      attachTo: document.body,
    });

    const api = wrapper.vm as unknown as {
      focus: () => void;
      blur: () => void;
      UNSAFE_getDOMNode: () => HTMLElement | null;
    };
    const trigger = wrapper.get(".react-spectrum-DatePicker-button").element as HTMLButtonElement;

    api.focus();
    await nextTick();
    expect(document.activeElement).toBe(trigger);

    api.blur();
    await nextTick();
    expect(document.activeElement).not.toBe(trigger);
    expect(api.UNSAFE_getDOMNode()).toBe(wrapper.get(".react-spectrum-DatePicker").element);
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

  it("keeps date picker popover open after selection when shouldCloseOnSelect is false", async () => {
    const onChange = vi.fn();
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        shouldCloseOnSelect: false,
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

    expect(onChange).toHaveBeenCalled();
    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeTruthy();
    expect(wrapper.get(".react-spectrum-DatePicker-button").attributes("aria-expanded")).toBe("true");
  });

  it("opens date picker popover with Alt+ArrowDown on the group", async () => {
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DatePicker-group").trigger("keydown", { key: "ArrowDown", altKey: true });
    await nextTick();

    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeTruthy();
  });

  it("renders date picker dialog wrapper with id when open", async () => {
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DatePicker-button").trigger("click");
    await nextTick();

    const dialog = document.body.querySelector(".react-spectrum-DatePicker-dialog") as HTMLElement | null;
    expect(dialog).toBeTruthy();
    expect(dialog?.getAttribute("id")).toBeTruthy();
    expect(dialog?.getAttribute("aria-labelledby")).toBeTruthy();
  });

  it("opens date picker popover with Alt+ArrowUp on the group", async () => {
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DatePicker-group").trigger("keydown", { key: "ArrowUp", altKey: true });
    await nextTick();

    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeTruthy();
  });

  it("does not open date picker popover with Alt+ArrowDown when disabled", async () => {
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        isDisabled: true,
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DatePicker-group").trigger("keydown", { key: "ArrowDown", altKey: true });
    await nextTick();

    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeNull();
  });

  it("opens date picker popover by default when defaultOpen is true", async () => {
    mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        defaultOpen: true,
      },
      attachTo: document.body,
    });

    await nextTick();
    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeTruthy();
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

  it("does not emit onOpenChange when disabled attempts click/keyboard open", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        isDisabled: true,
        onOpenChange,
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DatePicker-button").trigger("click");
    await wrapper.get(".react-spectrum-DatePicker-group").trigger("keydown", { key: "ArrowDown", altKey: true });
    await nextTick();

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeNull();
  });

  it("suppresses date picker key callbacks when disabled", async () => {
    const onKeyDown = vi.fn();
    const onKeyUp = vi.fn();
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        isDisabled: true,
        onKeyDown,
        onKeyUp,
      },
      attachTo: document.body,
    });

    const group = wrapper.get(".react-spectrum-DatePicker-group");
    await group.trigger("keydown", { key: "a" });
    await group.trigger("keyup", { key: "a" });
    await nextTick();

    expect(onKeyDown).not.toHaveBeenCalled();
    expect(onKeyUp).not.toHaveBeenCalled();
  });

  it("inherits disabled and quiet state from Provider", async () => {
    const wrapper = mount(
      defineComponent({
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
                h(DatePicker as any, {
                  "aria-label": "Date picker",
                  defaultValue: new CalendarDate(2019, 6, 5),
                })
            );
        },
      }),
      { attachTo: document.body }
    );

    const root = wrapper.get(".react-spectrum-DatePicker");
    const trigger = wrapper.get(".react-spectrum-DatePicker-button");
    expect(root.classes()).toContain("is-disabled");
    expect(root.classes()).toContain("is-quiet");
    expect(trigger.attributes("disabled")).toBeDefined();

    await trigger.trigger("click");
    await nextTick();

    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeNull();
  });

  it("inherits read-only state from Provider", async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider as any,
              {
                theme,
                isReadOnly: true,
              },
              () =>
                h(DatePicker as any, {
                  "aria-label": "Date picker",
                  defaultValue: new CalendarDate(2019, 6, 5),
                })
            );
        },
      }),
      { attachTo: document.body }
    );

    const trigger = wrapper.get(".react-spectrum-DatePicker-button");
    expect(trigger.attributes("disabled")).toBeDefined();

    await trigger.trigger("click");
    await nextTick();

    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeNull();
  });

  it("prefers local isDisabled over Provider default", async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider as any,
              {
                theme,
                isDisabled: true,
              },
              () =>
                h(DatePicker as any, {
                  "aria-label": "Date picker",
                  defaultValue: new CalendarDate(2019, 6, 5),
                  isDisabled: false,
                })
            );
        },
      }),
      { attachTo: document.body }
    );

    const trigger = wrapper.get(".react-spectrum-DatePicker-button");
    expect(trigger.attributes("disabled")).toBeUndefined();

    await trigger.trigger("click");
    await nextTick();

    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeTruthy();
  });

  it("inherits required state from Provider", () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider as any,
              {
                theme,
                isRequired: true,
              },
              () =>
                h(DatePicker as any, {
                  "aria-label": "Date picker",
                  defaultValue: new CalendarDate(2019, 6, 5),
                })
            );
        },
      }),
      { attachTo: document.body }
    );

    expect(wrapper.get(".react-spectrum-DatePicker-group").attributes("aria-required")).toBe("true");
  });

  it("inherits invalid state from Provider", () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider as any,
              {
                theme,
                validationState: "invalid",
              },
              () =>
                h(DatePicker as any, {
                  "aria-label": "Date picker",
                  defaultValue: new CalendarDate(2019, 6, 5),
                })
            );
        },
      }),
      { attachTo: document.body }
    );

    expect(wrapper.get(".react-spectrum-DatePicker").classes()).toContain("is-invalid");
  });

  it("prefers local DatePicker validationState over Provider default", () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider as any,
              {
                theme,
                validationState: "invalid",
              },
              () =>
                h(DatePicker as any, {
                  "aria-label": "Date picker",
                  defaultValue: new CalendarDate(2019, 6, 5),
                  validationState: "valid",
                })
            );
        },
      }),
      { attachTo: document.body }
    );

    expect(wrapper.get(".react-spectrum-DatePicker").classes()).not.toContain("is-invalid");
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

  it("sets aria-required on date picker group when required", () => {
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        isRequired: true,
      },
      attachTo: document.body,
    });

    expect(wrapper.get(".react-spectrum-DatePicker-group").attributes("aria-required")).toBe("true");
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

  it("updates date picker trigger aria-expanded across open and close", async () => {
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
      },
      attachTo: document.body,
    });

    const trigger = wrapper.get(".react-spectrum-DatePicker-button");
    expect(trigger.attributes("aria-expanded")).toBe("false");

    await trigger.trigger("click");
    await nextTick();
    expect(wrapper.get(".react-spectrum-DatePicker-button").attributes("aria-expanded")).toBe("true");

    const day17 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "17");
    expect(day17).toBeTruthy();
    pressElement(day17!);
    await nextTick();

    expect(wrapper.get(".react-spectrum-DatePicker-button").attributes("aria-expanded")).toBe("false");
  });

  it("forwards onFocusChange for date picker group focus transitions", async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const onFocusChange = vi.fn();
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        onFocus,
        onBlur,
        onFocusChange,
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DatePicker-group").trigger("focusin");
    await nextTick();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onFocusChange).toHaveBeenCalledWith(true);

    await wrapper.get(".react-spectrum-DatePicker-group").trigger("focusout", { relatedTarget: null });
    await nextTick();
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(onFocusChange).toHaveBeenCalledWith(false);
  });

  it("does not emit focus-change false when focus moves into date picker dialog", async () => {
    const onFocusChange = vi.fn();
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        onFocusChange,
      },
      attachTo: document.body,
    });

    const group = wrapper.get(".react-spectrum-DatePicker-group");
    await group.trigger("focusin");
    await nextTick();
    expect(onFocusChange).toHaveBeenCalledWith(true);

    await wrapper.get(".react-spectrum-DatePicker-button").trigger("click");
    await nextTick();
    const calendar = document.body.querySelector(".react-spectrum-Calendar") as HTMLElement | null;
    expect(calendar).toBeTruthy();

    onFocusChange.mockClear();
    const focusOut = new FocusEvent("focusout", { bubbles: true });
    Object.defineProperty(focusOut, "relatedTarget", { value: calendar });
    group.element.dispatchEvent(focusOut);
    await nextTick();

    expect(onFocusChange).not.toHaveBeenCalled();
  });

  it("does not emit onBlur when focus moves into date picker dialog", async () => {
    const onBlur = vi.fn();
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        onBlur,
      },
      attachTo: document.body,
    });

    const group = wrapper.get(".react-spectrum-DatePicker-group");
    await group.trigger("focusin");
    await wrapper.get(".react-spectrum-DatePicker-button").trigger("click");
    await nextTick();

    const calendar = document.body.querySelector(".react-spectrum-Calendar") as HTMLElement | null;
    expect(calendar).toBeTruthy();

    const focusOut = new FocusEvent("focusout", { bubbles: true });
    Object.defineProperty(focusOut, "relatedTarget", { value: calendar });
    group.element.dispatchEvent(focusOut);
    await nextTick();

    expect(onBlur).not.toHaveBeenCalled();
  });

  it("forwards onKeyUp while closed and suppresses it while open", async () => {
    const onKeyUp = vi.fn();
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        onKeyUp,
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DatePicker-group").trigger("keyup", { key: "a" });
    expect(onKeyUp).toHaveBeenCalledTimes(1);

    await wrapper.get(".react-spectrum-DatePicker-button").trigger("click");
    await nextTick();
    await wrapper.get(".react-spectrum-DatePicker-group").trigger("keyup", { key: "a" });

    expect(onKeyUp).toHaveBeenCalledTimes(1);
  });

  it("forwards onKeyDown while closed and suppresses it while open", async () => {
    const onKeyDown = vi.fn();
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        onKeyDown,
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DatePicker-group").trigger("keydown", { key: "a" });
    expect(onKeyDown).toHaveBeenCalledTimes(1);

    await wrapper.get(".react-spectrum-DatePicker-button").trigger("click");
    await nextTick();
    await wrapper.get(".react-spectrum-DatePicker-group").trigger("keydown", { key: "a" });

    expect(onKeyDown).toHaveBeenCalledTimes(1);
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

  it("emits open request in controlled mode without opening until prop update", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        isOpen: false,
        onOpenChange,
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DatePicker-button").trigger("click");
    await nextTick();

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeNull();

    await wrapper.setProps({ isOpen: true });
    await nextTick();

    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeTruthy();
  });

  it("emits keyboard open request in controlled mode without opening until prop update", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        isOpen: false,
        onOpenChange,
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DatePicker-group").trigger("keydown", { key: "ArrowDown", altKey: true });
    await nextTick();

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeNull();

    await wrapper.setProps({ isOpen: true });
    await nextTick();

    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeTruthy();
  });

  it("emits keyboard ArrowUp open request in controlled mode without opening until prop update", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        isOpen: false,
        onOpenChange,
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DatePicker-group").trigger("keydown", { key: "ArrowUp", altKey: true });
    await nextTick();

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeNull();

    await wrapper.setProps({ isOpen: true });
    await nextTick();

    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeTruthy();
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
        ariaDescribedby: "team-date-description",
        defaultValue: new CalendarDate(2019, 6, 5),
      },
      attachTo: document.body,
    });

    const group = wrapper.get(".react-spectrum-DatePicker-group");
    expect(group.attributes("aria-label")).toContain("Team date picker");
    expect(group.attributes("aria-labelledby")).toContain("team-date-label");
    expect(group.attributes("aria-describedby")).toContain("team-date-description");
  });

  it("forwards custom id to date picker group", () => {
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        id: "meeting-date-field",
        defaultValue: new CalendarDate(2019, 6, 5),
      },
      attachTo: document.body,
    });

    expect(wrapper.get(".react-spectrum-DatePicker-group").attributes("id")).toBe("meeting-date-field");
  });

  it("applies invalid, disabled, and quiet classes to date picker root", () => {
    const invalidWrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        validationState: "invalid",
      },
      attachTo: document.body,
    });
    const disabledWrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        isDisabled: true,
      },
      attachTo: document.body,
    });
    const quietWrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        isQuiet: true,
      },
      attachTo: document.body,
    });

    expect(invalidWrapper.get(".react-spectrum-DatePicker").classes()).toContain("is-invalid");
    expect(disabledWrapper.get(".react-spectrum-DatePicker").classes()).toContain("is-disabled");
    expect(quietWrapper.get(".react-spectrum-DatePicker").classes()).toContain("is-quiet");
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

  it("renders functional error messages when invalid", () => {
    const errorMessage = vi.fn(() => "Choose a valid date from callback");
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        validationState: "invalid",
        errorMessage,
      },
      attachTo: document.body,
    });

    expect(wrapper.text()).toContain("Choose a valid date from callback");
    expect(errorMessage).toHaveBeenCalled();
    const callArgs = errorMessage.mock.calls as unknown[][];
    const payload = (callArgs.at(0)?.[0] ?? {}) as { validationErrors?: unknown[] };
    expect(Array.isArray(payload?.validationErrors)).toBe(true);
  });

  it("renders validation errors from a custom date validate callback", () => {
    const validate = vi.fn(() => "Date failed custom validation");
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        validate,
      },
      attachTo: document.body,
    });

    expect(wrapper.text()).toContain("Date failed custom validation");
    expect(wrapper.get(".react-spectrum-DatePicker").classes()).toContain("is-invalid");
    expect(validate).toHaveBeenCalled();
  });

  it("defers custom validate errors in native validationBehavior until commit", async () => {
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        validationBehavior: "native",
        validate: () => "Date failed native validation",
      },
      attachTo: document.body,
    });

    expect(wrapper.find(".react-spectrum-DatePicker-error").exists()).toBe(false);

    await wrapper.get(".react-spectrum-DatePicker-button").trigger("click");
    await nextTick();
    const day17 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "17");
    expect(day17).toBeTruthy();
    pressElement(day17!);
    await nextTick();

    expect(wrapper.get(".react-spectrum-DatePicker-error").text()).toContain("Date failed native validation");
  });

  it("renders description text when provided", () => {
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        description: "Choose the event date",
      },
      attachTo: document.body,
    });

    const description = wrapper.get(".react-spectrum-DatePicker-description");
    expect(description.text()).toContain("Choose the event date");
    expect(description.attributes("style")).toBeUndefined();
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

  it("passes isDateUnavailable through to calendar overlay", async () => {
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        isDateUnavailable: (date: { day: number }) => date.day === 17,
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DatePicker-button").trigger("click");
    await nextTick();

    const day17 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "17") as HTMLElement | undefined;
    expect(day17).toBeTruthy();
    expect(day17?.getAttribute("aria-disabled")).toBe("true");
  });

  it("passes minValue and maxValue through to calendar overlay", async () => {
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 15),
        minValue: new CalendarDate(2019, 6, 10),
        maxValue: new CalendarDate(2019, 6, 20),
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DatePicker-button").trigger("click");
    await nextTick();

    const day9 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "9") as HTMLElement | undefined;
    const day10 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "10") as HTMLElement | undefined;
    expect(day9).toBeTruthy();
    expect(day10).toBeTruthy();
    expect(day9?.getAttribute("aria-disabled")).toBe("true");
    expect(day10?.getAttribute("aria-disabled")).toBeNull();
  });

  it("does not emit onChange when selecting an unavailable date", async () => {
    const onChange = vi.fn();
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 5),
        isDateUnavailable: (date: { day: number }) => date.day === 17,
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

    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not emit onChange when selecting a min/max out-of-bounds date", async () => {
    const onChange = vi.fn();
    const wrapper = mount(DatePicker as any, {
      props: {
        "aria-label": "Date picker",
        defaultValue: new CalendarDate(2019, 6, 15),
        minValue: new CalendarDate(2019, 6, 10),
        maxValue: new CalendarDate(2019, 6, 20),
        onChange,
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DatePicker-button").trigger("click");
    await nextTick();

    const day9 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "9");
    expect(day9).toBeTruthy();

    pressElement(day9!);
    await nextTick();

    expect(onChange).not.toHaveBeenCalled();
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

  it("forwards granularity to state validation for range picker values", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      expect(() =>
        mount(DateRangePicker as any, {
          props: {
            "aria-label": "Date range picker",
            defaultValue: {
              start: new CalendarDate(2019, 6, 5),
              end: new CalendarDate(2019, 6, 8),
            },
            granularity: "minute",
          },
          attachTo: document.body,
        })
      ).toThrow(/Invalid granularity/);
    } finally {
      warnSpy.mockRestore();
    }
  });

  it("accepts CalendarDateTime range values when minute granularity is provided", () => {
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDateTime(2019, 6, 5, 9, 30),
          end: new CalendarDateTime(2019, 6, 8, 11, 0),
        },
        granularity: "minute",
        hourCycle: 24,
      },
      attachTo: document.body,
    });

    expect(wrapper.get(".react-spectrum-DateRangePicker-value").classes()).not.toContain("is-placeholder");
    expect(wrapper.get(".react-spectrum-DateRangePicker-value").text()).toContain("2019");
  });

  it("renders timezone text for ZonedDateTime ranges when hideTimeZone is false", () => {
    const withZone = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: parseZonedDateTime("2019-06-05T09:30[America/New_York]"),
          end: parseZonedDateTime("2019-06-06T10:45[America/New_York]"),
        },
        granularity: "minute",
        hourCycle: 24,
        shouldForceLeadingZeros: true,
        hideTimeZone: false,
      },
      attachTo: document.body,
    });

    const withoutZone = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: parseZonedDateTime("2019-06-05T09:30[America/New_York]"),
          end: parseZonedDateTime("2019-06-06T10:45[America/New_York]"),
        },
        granularity: "minute",
        hourCycle: 24,
        shouldForceLeadingZeros: true,
        hideTimeZone: true,
      },
      attachTo: document.body,
    });

    const withZoneText = withZone.get(".react-spectrum-DateRangePicker-value").text();
    const withoutZoneText = withoutZone.get(".react-spectrum-DateRangePicker-value").text();

    expect(withZoneText).toContain("09:30");
    expect(withZoneText).toContain("10:45");
    expect(withoutZoneText).toContain("09:30");
    expect(withoutZoneText).toContain("10:45");
    expect(withZoneText).not.toBe(withoutZoneText);
    expect(withZoneText.length).toBeGreaterThan(withoutZoneText.length);
  });

  it("renders custom range placeholder text until a range is selected", async () => {
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        placeholder: "Pick a range",
        placeholderValue: new CalendarDate(2019, 6, 10),
      },
      attachTo: document.body,
    });

    const value = wrapper.get(".react-spectrum-DateRangePicker-value");
    expect(value.text()).toBe("Pick a range");
    expect(value.classes()).toContain("is-placeholder");

    await wrapper.get(".react-spectrum-DateRangePicker-button").trigger("click");
    await nextTick();

    const day10 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "10");
    const day12 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "12");
    expect(day10).toBeTruthy();
    expect(day12).toBeTruthy();
    pressElement(day10!);
    pressElement(day12!);
    await nextTick();

    expect(wrapper.get(".react-spectrum-DateRangePicker-value").text()).not.toBe("Pick a range");
    expect(wrapper.get(".react-spectrum-DateRangePicker-value").classes()).not.toContain("is-placeholder");
  });

  it("serializes hidden range form inputs when names are provided", () => {
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        startName: "rangeStart",
        endName: "rangeEnd",
        form: "range-form",
      },
      attachTo: document.body,
    });

    const startInput = wrapper.get('input[type="hidden"][name="rangeStart"]');
    const endInput = wrapper.get('input[type="hidden"][name="rangeEnd"]');
    expect(startInput.element.getAttribute("value")).toBe("2019-06-05");
    expect(endInput.element.getAttribute("value")).toBe("2019-06-08");
    expect(startInput.element.getAttribute("form")).toBe("range-form");
    expect(endInput.element.getAttribute("form")).toBe("range-form");
  });

  it("updates hidden range form inputs after range selection", async () => {
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        placeholderValue: new CalendarDate(2019, 6, 10),
        startName: "rangeStart",
        endName: "rangeEnd",
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

    const startInput = wrapper.get('input[type="hidden"][name="rangeStart"]');
    const endInput = wrapper.get('input[type="hidden"][name="rangeEnd"]');
    expect(startInput.element.getAttribute("value")).toBe("2019-06-10");
    expect(endInput.element.getAttribute("value")).toBe("2019-06-12");
  });

  it("focuses range picker trigger when autoFocus is enabled", async () => {
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
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

    expect(document.activeElement).toBe(wrapper.get(".react-spectrum-DateRangePicker-button").element);
  });

  it("does not focus range picker trigger when read-only with autoFocus", async () => {
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        autoFocus: true,
        isReadOnly: true,
      },
      attachTo: document.body,
    });

    await nextTick();
    await nextTick();

    expect(document.activeElement).not.toBe(wrapper.get(".react-spectrum-DateRangePicker-button").element);
  });

  it("passes through data attributes on range picker root", () => {
    const wrapper = mount(DateRangePicker as any, {
      attrs: {
        "data-testid": "range-picker-root",
      },
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
      },
      attachTo: document.body,
    });

    expect(wrapper.get(".react-spectrum-DateRangePicker").attributes("data-testid")).toBe("range-picker-root");
  });

  it("exposes imperative range picker handles", async () => {
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

    const api = wrapper.vm as unknown as {
      focus: () => void;
      blur: () => void;
      UNSAFE_getDOMNode: () => HTMLElement | null;
    };
    const trigger = wrapper.get(".react-spectrum-DateRangePicker-button").element as HTMLButtonElement;

    api.focus();
    await nextTick();
    expect(document.activeElement).toBe(trigger);

    api.blur();
    await nextTick();
    expect(document.activeElement).not.toBe(trigger);
    expect(api.UNSAFE_getDOMNode()).toBe(wrapper.get(".react-spectrum-DateRangePicker").element);
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

  it("opens range picker popover with Alt+ArrowDown on the group", async () => {
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

    await wrapper.get(".react-spectrum-DateRangePicker-group").trigger("keydown", { key: "ArrowDown", altKey: true });
    await nextTick();

    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeTruthy();
  });

  it("renders range picker dialog wrapper with id when open", async () => {
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

    const dialog = document.body.querySelector(".react-spectrum-DateRangePicker-dialog") as HTMLElement | null;
    expect(dialog).toBeTruthy();
    expect(dialog?.getAttribute("id")).toBeTruthy();
    expect(dialog?.getAttribute("aria-labelledby")).toBeTruthy();
  });

  it("opens range picker popover with Alt+ArrowUp on the group", async () => {
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

    await wrapper.get(".react-spectrum-DateRangePicker-group").trigger("keydown", { key: "ArrowUp", altKey: true });
    await nextTick();

    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeTruthy();
  });

  it("does not open range picker popover with Alt+ArrowDown when read-only", async () => {
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        isReadOnly: true,
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DateRangePicker-group").trigger("keydown", { key: "ArrowDown", altKey: true });
    await nextTick();

    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeNull();
  });

  it("opens range picker popover by default when defaultOpen is true", async () => {
    mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        defaultOpen: true,
      },
      attachTo: document.body,
    });

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

  it("inherits range disabled and quiet state from Provider", async () => {
    const wrapper = mount(
      defineComponent({
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
                h(DateRangePicker as any, {
                  "aria-label": "Date range picker",
                  defaultValue: {
                    start: new CalendarDate(2019, 6, 5),
                    end: new CalendarDate(2019, 6, 8),
                  },
                })
            );
        },
      }),
      { attachTo: document.body }
    );

    const root = wrapper.get(".react-spectrum-DateRangePicker");
    const trigger = wrapper.get(".react-spectrum-DateRangePicker-button");
    expect(root.classes()).toContain("is-disabled");
    expect(root.classes()).toContain("is-quiet");
    expect(trigger.attributes("disabled")).toBeDefined();

    await trigger.trigger("click");
    await nextTick();

    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeNull();
  });

  it("inherits range invalid state from Provider", () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider as any,
              {
                theme,
                validationState: "invalid",
              },
              () =>
                h(DateRangePicker as any, {
                  "aria-label": "Date range picker",
                  defaultValue: {
                    start: new CalendarDate(2019, 6, 5),
                    end: new CalendarDate(2019, 6, 8),
                  },
                })
            );
        },
      }),
      { attachTo: document.body }
    );

    expect(wrapper.get(".react-spectrum-DateRangePicker").classes()).toContain("is-invalid");
  });

  it("prefers local range validationState over Provider default", () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider as any,
              {
                theme,
                validationState: "invalid",
              },
              () =>
                h(DateRangePicker as any, {
                  "aria-label": "Date range picker",
                  defaultValue: {
                    start: new CalendarDate(2019, 6, 5),
                    end: new CalendarDate(2019, 6, 8),
                  },
                  validationState: "valid",
                })
            );
        },
      }),
      { attachTo: document.body }
    );

    expect(wrapper.get(".react-spectrum-DateRangePicker").classes()).not.toContain("is-invalid");
  });

  it("inherits range required state from Provider", () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider as any,
              {
                theme,
                isRequired: true,
              },
              () =>
                h(DateRangePicker as any, {
                  "aria-label": "Date range picker",
                  defaultValue: {
                    start: new CalendarDate(2019, 6, 5),
                    end: new CalendarDate(2019, 6, 8),
                  },
                })
            );
        },
      }),
      { attachTo: document.body }
    );

    expect(wrapper.get(".react-spectrum-DateRangePicker-group").attributes("aria-required")).toBe("true");
  });

  it("prevents opening when range picker is read-only", async () => {
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        isReadOnly: true,
      },
      attachTo: document.body,
    });

    const trigger = wrapper.get(".react-spectrum-DateRangePicker-button");
    expect(trigger.attributes("disabled")).toBeDefined();

    await trigger.trigger("click");
    await nextTick();

    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeNull();
  });

  it("does not emit range onOpenChange when read-only attempts click/keyboard open", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        isReadOnly: true,
        onOpenChange,
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DateRangePicker-button").trigger("click");
    await wrapper.get(".react-spectrum-DateRangePicker-group").trigger("keydown", { key: "ArrowDown", altKey: true });
    await nextTick();

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeNull();
  });

  it("suppresses range key callbacks when read-only", async () => {
    const onKeyDown = vi.fn();
    const onKeyUp = vi.fn();
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        isReadOnly: true,
        onKeyDown,
        onKeyUp,
      },
      attachTo: document.body,
    });

    const group = wrapper.get(".react-spectrum-DateRangePicker-group");
    await group.trigger("keydown", { key: "a" });
    await group.trigger("keyup", { key: "a" });
    await nextTick();

    expect(onKeyDown).not.toHaveBeenCalled();
    expect(onKeyUp).not.toHaveBeenCalled();
  });

  it("sets aria-required on range picker group when required", () => {
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        isRequired: true,
      },
      attachTo: document.body,
    });

    expect(wrapper.get(".react-spectrum-DateRangePicker-group").attributes("aria-required")).toBe("true");
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

  it("keeps range picker popover open after complete selection when shouldCloseOnSelect returns false", async () => {
    const onChange = vi.fn();
    const shouldCloseOnSelect = vi.fn(() => false);
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        placeholderValue: new CalendarDate(2019, 6, 5),
        shouldCloseOnSelect,
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
    expect(shouldCloseOnSelect).toHaveBeenCalled();
    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeTruthy();
    expect(wrapper.get(".react-spectrum-DateRangePicker-button").attributes("aria-expanded")).toBe("true");
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

  it("updates range picker trigger aria-expanded across open and close", async () => {
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        placeholderValue: new CalendarDate(2019, 6, 5),
      },
      attachTo: document.body,
    });

    const trigger = wrapper.get(".react-spectrum-DateRangePicker-button");
    expect(trigger.attributes("aria-expanded")).toBe("false");

    await trigger.trigger("click");
    await nextTick();
    expect(wrapper.get(".react-spectrum-DateRangePicker-button").attributes("aria-expanded")).toBe("true");

    const day10 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "10");
    const day12 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "12");
    expect(day10).toBeTruthy();
    expect(day12).toBeTruthy();
    pressElement(day10!);
    pressElement(day12!);
    await nextTick();

    expect(wrapper.get(".react-spectrum-DateRangePicker-button").attributes("aria-expanded")).toBe("false");
  });

  it("forwards range onFocusChange for group focus transitions", async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const onFocusChange = vi.fn();
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        onFocus,
        onBlur,
        onFocusChange,
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DateRangePicker-group").trigger("focusin");
    await nextTick();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onFocusChange).toHaveBeenCalledWith(true);

    await wrapper.get(".react-spectrum-DateRangePicker-group").trigger("focusout", { relatedTarget: null });
    await nextTick();
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(onFocusChange).toHaveBeenCalledWith(false);
  });

  it("does not emit range focus-change false when focus moves into dialog", async () => {
    const onFocusChange = vi.fn();
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        onFocusChange,
      },
      attachTo: document.body,
    });

    const group = wrapper.get(".react-spectrum-DateRangePicker-group");
    await group.trigger("focusin");
    await nextTick();
    expect(onFocusChange).toHaveBeenCalledWith(true);

    await wrapper.get(".react-spectrum-DateRangePicker-button").trigger("click");
    await nextTick();
    const calendar = document.body.querySelector(".react-spectrum-Calendar") as HTMLElement | null;
    expect(calendar).toBeTruthy();

    onFocusChange.mockClear();
    const focusOut = new FocusEvent("focusout", { bubbles: true });
    Object.defineProperty(focusOut, "relatedTarget", { value: calendar });
    group.element.dispatchEvent(focusOut);
    await nextTick();

    expect(onFocusChange).not.toHaveBeenCalled();
  });

  it("does not emit range onBlur when focus moves into dialog", async () => {
    const onBlur = vi.fn();
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        onBlur,
      },
      attachTo: document.body,
    });

    const group = wrapper.get(".react-spectrum-DateRangePicker-group");
    await group.trigger("focusin");
    await wrapper.get(".react-spectrum-DateRangePicker-button").trigger("click");
    await nextTick();

    const calendar = document.body.querySelector(".react-spectrum-Calendar") as HTMLElement | null;
    expect(calendar).toBeTruthy();

    const focusOut = new FocusEvent("focusout", { bubbles: true });
    Object.defineProperty(focusOut, "relatedTarget", { value: calendar });
    group.element.dispatchEvent(focusOut);
    await nextTick();

    expect(onBlur).not.toHaveBeenCalled();
  });

  it("forwards range onKeyUp while closed and suppresses it while open", async () => {
    const onKeyUp = vi.fn();
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        onKeyUp,
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DateRangePicker-group").trigger("keyup", { key: "a" });
    expect(onKeyUp).toHaveBeenCalledTimes(1);

    await wrapper.get(".react-spectrum-DateRangePicker-button").trigger("click");
    await nextTick();
    await wrapper.get(".react-spectrum-DateRangePicker-group").trigger("keyup", { key: "a" });

    expect(onKeyUp).toHaveBeenCalledTimes(1);
  });

  it("forwards range onKeyDown while closed and suppresses it while open", async () => {
    const onKeyDown = vi.fn();
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        onKeyDown,
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DateRangePicker-group").trigger("keydown", { key: "a" });
    expect(onKeyDown).toHaveBeenCalledTimes(1);

    await wrapper.get(".react-spectrum-DateRangePicker-button").trigger("click");
    await nextTick();
    await wrapper.get(".react-spectrum-DateRangePicker-group").trigger("keydown", { key: "a" });

    expect(onKeyDown).toHaveBeenCalledTimes(1);
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

  it("emits range open request in controlled mode without opening until prop update", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        isOpen: false,
        onOpenChange,
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DateRangePicker-button").trigger("click");
    await nextTick();

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeNull();

    await wrapper.setProps({ isOpen: true });
    await nextTick();

    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeTruthy();
  });

  it("emits range keyboard open request in controlled mode without opening until prop update", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        isOpen: false,
        onOpenChange,
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DateRangePicker-group").trigger("keydown", { key: "ArrowDown", altKey: true });
    await nextTick();

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeNull();

    await wrapper.setProps({ isOpen: true });
    await nextTick();

    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeTruthy();
  });

  it("emits range keyboard ArrowUp open request in controlled mode without opening until prop update", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        isOpen: false,
        onOpenChange,
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DateRangePicker-group").trigger("keydown", { key: "ArrowUp", altKey: true });
    await nextTick();

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeNull();

    await wrapper.setProps({ isOpen: true });
    await nextTick();

    expect(document.body.querySelector(".react-spectrum-Calendar")).toBeTruthy();
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
        ariaDescribedby: "team-range-description",
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
    expect(group.attributes("aria-describedby")).toContain("team-range-description");
  });

  it("forwards custom id to range picker group", () => {
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        id: "trip-range-field",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
      },
      attachTo: document.body,
    });

    expect(wrapper.get(".react-spectrum-DateRangePicker-group").attributes("id")).toBe("trip-range-field");
  });

  it("applies invalid, disabled, and quiet classes to range picker root", () => {
    const invalidWrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        validationState: "invalid",
      },
      attachTo: document.body,
    });
    const disabledWrapper = mount(DateRangePicker as any, {
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
    const quietWrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        isQuiet: true,
      },
      attachTo: document.body,
    });

    expect(invalidWrapper.get(".react-spectrum-DateRangePicker").classes()).toContain("is-invalid");
    expect(disabledWrapper.get(".react-spectrum-DateRangePicker").classes()).toContain("is-disabled");
    expect(quietWrapper.get(".react-spectrum-DateRangePicker").classes()).toContain("is-quiet");
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

  it("renders functional range error messages when invalid", () => {
    const errorMessage = vi.fn(() => "Choose a valid range from callback");
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        validationState: "invalid",
        errorMessage,
      },
      attachTo: document.body,
    });

    expect(wrapper.text()).toContain("Choose a valid range from callback");
    expect(errorMessage).toHaveBeenCalled();
    const callArgs = errorMessage.mock.calls as unknown[][];
    const payload = (callArgs.at(0)?.[0] ?? {}) as { validationErrors?: unknown[] };
    expect(Array.isArray(payload?.validationErrors)).toBe(true);
  });

  it("renders validation errors from a custom range validate callback", () => {
    const validate = vi.fn(() => "Range failed custom validation");
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        validate,
      },
      attachTo: document.body,
    });

    expect(wrapper.text()).toContain("Range failed custom validation");
    expect(wrapper.get(".react-spectrum-DateRangePicker").classes()).toContain("is-invalid");
    expect(validate).toHaveBeenCalled();
  });

  it("defers custom range validate errors in native validationBehavior until commit", async () => {
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        placeholderValue: new CalendarDate(2019, 6, 5),
        validationBehavior: "native",
        validate: () => "Range failed native validation",
      },
      attachTo: document.body,
    });

    expect(wrapper.find(".react-spectrum-DateRangePicker-error").exists()).toBe(false);

    await wrapper.get(".react-spectrum-DateRangePicker-button").trigger("click");
    await nextTick();

    const day10 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "10");
    const day12 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "12");
    expect(day10).toBeTruthy();
    expect(day12).toBeTruthy();
    pressElement(day10!);
    pressElement(day12!);
    await nextTick();

    expect(wrapper.get(".react-spectrum-DateRangePicker-error").text()).toContain("Range failed native validation");
  });

  it("renders range description text when provided", () => {
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        description: "Choose travel dates",
      },
      attachTo: document.body,
    });

    const description = wrapper.get(".react-spectrum-DateRangePicker-description");
    expect(description.text()).toContain("Choose travel dates");
    expect(description.attributes("style")).toBeUndefined();
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

  it("passes isDateUnavailable through to range-calendar overlay", async () => {
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 5),
          end: new CalendarDate(2019, 6, 8),
        },
        isDateUnavailable: (date: { day: number }) => date.day === 17,
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DateRangePicker-button").trigger("click");
    await nextTick();

    const day17 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "17") as HTMLElement | undefined;
    expect(day17).toBeTruthy();
    expect(day17?.getAttribute("aria-disabled")).toBe("true");
  });

  it("passes minValue and maxValue through to range-calendar overlay", async () => {
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        defaultValue: {
          start: new CalendarDate(2019, 6, 15),
          end: new CalendarDate(2019, 6, 18),
        },
        minValue: new CalendarDate(2019, 6, 10),
        maxValue: new CalendarDate(2019, 6, 20),
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DateRangePicker-button").trigger("click");
    await nextTick();

    const day9 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "9") as HTMLElement | undefined;
    const day10 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "10") as HTMLElement | undefined;
    expect(day9).toBeTruthy();
    expect(day10).toBeTruthy();
    expect(day9?.getAttribute("aria-disabled")).toBe("true");
    expect(day10?.getAttribute("aria-disabled")).toBeNull();
  });

  it("does not commit range selection when end date is unavailable", async () => {
    const onChange = vi.fn();
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        placeholderValue: new CalendarDate(2019, 6, 10),
        isDateUnavailable: (date: { day: number }) => date.day === 12,
        onChange,
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DateRangePicker-button").trigger("click");
    await nextTick();

    const day10 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "10");
    const day12 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "12");
    const day14 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "14");
    expect(day10).toBeTruthy();
    expect(day12).toBeTruthy();
    expect(day14).toBeTruthy();

    pressElement(day10!);
    pressElement(day12!);
    await nextTick();

    expect(onChange).not.toHaveBeenCalled();

    pressElement(day14!);
    await nextTick();

    expect(onChange).toHaveBeenCalledTimes(1);
    const value = onChange.mock.calls[0]?.[0] as { start: CalendarDate; end: CalendarDate };
    expect(value.start.day).toBe(10);
    expect(value.end.day).toBe(11);
  });

  it("does not commit range selection when end date is out of bounds", async () => {
    const onChange = vi.fn();
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        placeholderValue: new CalendarDate(2019, 6, 10),
        minValue: new CalendarDate(2019, 6, 10),
        maxValue: new CalendarDate(2019, 6, 20),
        onChange,
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DateRangePicker-button").trigger("click");
    await nextTick();

    const day9 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "9");
    const day10 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "10");
    const day12 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "12");
    expect(day9).toBeTruthy();
    expect(day10).toBeTruthy();
    expect(day12).toBeTruthy();

    pressElement(day10!);
    pressElement(day9!);
    await nextTick();

    expect(onChange).not.toHaveBeenCalled();

    pressElement(day12!);
    await nextTick();

    expect(onChange).toHaveBeenCalledTimes(1);
    const value = onChange.mock.calls[0]?.[0] as { start: CalendarDate; end: CalendarDate };
    expect(value.start.day).toBe(10);
    expect(value.end.day).toBe(12);
  });

  it("constrains range selection across unavailable dates by default", async () => {
    const onChange = vi.fn();
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        placeholderValue: new CalendarDate(2019, 6, 10),
        isDateUnavailable: (date: { day: number }) => date.day === 12,
        onChange,
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DateRangePicker-button").trigger("click");
    await nextTick();

    const day10 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "10");
    const day14 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "14");
    expect(day10).toBeTruthy();
    expect(day14).toBeTruthy();

    pressElement(day10!);
    pressElement(day14!);
    await nextTick();

    expect(onChange).toHaveBeenCalledTimes(1);
    const value = onChange.mock.calls[0]?.[0] as { start: CalendarDate; end: CalendarDate };
    expect(value.start.day).toBe(10);
    expect(value.end.day).toBe(11);
  });

  it("allows non-contiguous range selection when enabled", async () => {
    const onChange = vi.fn();
    const wrapper = mount(DateRangePicker as any, {
      props: {
        "aria-label": "Date range picker",
        placeholderValue: new CalendarDate(2019, 6, 10),
        isDateUnavailable: (date: { day: number }) => date.day === 12,
        allowsNonContiguousRanges: true,
        onChange,
      },
      attachTo: document.body,
    });

    await wrapper.get(".react-spectrum-DateRangePicker-button").trigger("click");
    await nextTick();

    const day10 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "10");
    const day14 = Array.from(document.body.querySelectorAll(".react-spectrum-Calendar-date")).find((node) => node.textContent === "14");
    expect(day10).toBeTruthy();
    expect(day14).toBeTruthy();

    pressElement(day10!);
    pressElement(day14!);
    await nextTick();

    expect(onChange).toHaveBeenCalledTimes(1);
    const value = onChange.mock.calls[0]?.[0] as { start: CalendarDate; end: CalendarDate };
    expect(value.start.day).toBe(10);
    expect(value.end.day).toBe(14);
  });
});
