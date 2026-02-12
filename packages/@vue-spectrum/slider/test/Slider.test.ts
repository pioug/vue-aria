import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { Provider } from "@vue-spectrum/provider";
import { Slider } from "../src";
import { press, testKeypresses } from "./utils";

function createTheme() {
  return {
    global: { spectrum: "spectrum" },
    light: { "spectrum--light": "spectrum--light" },
    dark: { "spectrum--dark": "spectrum--dark" },
    medium: { "spectrum--medium": "spectrum--medium" },
    large: { "spectrum--large": "spectrum--large" },
  };
}

function setTrackRect(element: Element, width = 100, height = 100): void {
  Object.defineProperty(element, "getBoundingClientRect", {
    value: () => ({
      top: 0,
      left: 0,
      width,
      height,
      right: width,
      bottom: height,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }),
  });
}

function createPointerEvent(
  type: string,
  init: Partial<PointerEventInit> & {
    pointerId?: number;
    pointerType?: "mouse" | "touch" | "pen";
    pageX?: number;
    pageY?: number;
  } = {}
): PointerEvent {
  if (typeof PointerEvent !== "undefined") {
    return new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      ...init,
    });
  }

  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    button: init.button ?? 0,
    clientX: init.clientX ?? init.pageX ?? 0,
    clientY: init.clientY ?? init.pageY ?? 0,
  });

  Object.defineProperties(event, {
    pointerId: {
      value: init.pointerId ?? 1,
      enumerable: true,
    },
    pointerType: {
      value: init.pointerType ?? "mouse",
      enumerable: true,
    },
    pageX: {
      value: init.pageX ?? init.clientX ?? 0,
      enumerable: true,
    },
    pageY: {
      value: init.pageY ?? init.clientY ?? 0,
      enumerable: true,
    },
  });

  return event as unknown as PointerEvent;
}

describe("Slider", () => {
  it("supports aria-label", () => {
    const wrapper = mount(Slider, {
      attrs: {
        "aria-label": "The Label",
      },
    });

    const group = wrapper.get("[role='group']");
    const input = wrapper.get("input[type='range']");

    expect(group.attributes("aria-label")).toBe("The Label");
    expect(wrapper.text()).toBe("");
    expect(input.attributes("aria-valuetext")).toBe("0");
  });

  it("supports label and value output", () => {
    const wrapper = mount(Slider, {
      props: {
        label: "The Label",
      },
    });

    const group = wrapper.get("[role='group']");
    const input = wrapper.get("input[type='range']");
    const output = wrapper.get("output");

    const labelId = group.attributes("aria-labelledby");
    expect(labelId).toBeTruthy();
    expect(input.attributes("aria-labelledby")).toContain(labelId);
    expect(output.text()).toBe("0");
    expect(output.attributes("aria-live")).toBe("off");
  });

  it("supports showValueLabel false", () => {
    const wrapper = mount(Slider, {
      props: {
        label: "The Label",
        showValueLabel: false,
      },
    });

    expect(wrapper.find("output").exists()).toBe(false);
  });

  it("supports disabled", async () => {
    const user = userEvent.setup();
    const wrapper = mount(
      defineComponent({
        name: "SliderDisabledHarness",
        setup() {
          return () =>
            h("div", [
              h("button", { "data-testid": "before" }, "Before"),
              h(Slider, {
                label: "The Label",
                defaultValue: 20,
                isDisabled: true,
              }),
              h("button", { "data-testid": "after" }, "After"),
            ]);
        },
      }),
      {
        attachTo: document.body,
      }
    );

    const input = wrapper.get("input[type='range']");
    expect(input.attributes("disabled")).toBeDefined();

    const before = wrapper.get("[data-testid='before']").element;
    const after = wrapper.get("[data-testid='after']").element;

    await user.tab();
    expect(document.activeElement).toBe(before);
    await user.tab();
    expect(document.activeElement).toBe(after);
  });

  it("can be focused", async () => {
    const user = userEvent.setup();
    const wrapper = mount(
      defineComponent({
        name: "SliderFocusableHarness",
        setup() {
          return () =>
            h("div", [
              h("button", { "data-testid": "before" }, "Before"),
              h(Slider, {
                label: "The Label",
                defaultValue: 20,
              }),
              h("button", { "data-testid": "after" }, "After"),
            ]);
        },
      }),
      {
        attachTo: document.body,
      }
    );

    const input = wrapper.get("input[type='range']").element as HTMLInputElement;
    const before = wrapper.get("[data-testid='before']").element;
    const after = wrapper.get("[data-testid='after']").element;

    input.focus();
    expect(document.activeElement).toBe(input);

    await user.tab();
    expect(document.activeElement).toBe(after);
    await user.tab({ shift: true });
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(before);
  });

  it("supports defaultValue and change", async () => {
    const wrapper = mount(Slider, {
      props: {
        label: "The Label",
        defaultValue: 20,
      },
    });

    const input = wrapper.get("input[type='range']");
    expect((input.element as HTMLInputElement).value).toBe("20");

    await input.setValue("40");
    expect((input.element as HTMLInputElement).value).toBe("40");
    expect(wrapper.get("output").text()).toBe("40");
  });

  it("supports controlled value", async () => {
    const Harness = defineComponent({
      name: "SliderControlledHarness",
      setup() {
        const value = ref(50);

        return () =>
          h(Slider, {
            label: "The Label",
            value: value.value,
            onChange: (next: number) => {
              value.value = next;
            },
          });
      },
    });

    const wrapper = mount(Harness);
    const input = wrapper.get("input[type='range']");
    expect((input.element as HTMLInputElement).value).toBe("50");

    await input.setValue("55");
    expect((input.element as HTMLInputElement).value).toBe("55");
    expect(wrapper.get("output").text()).toBe("55");
  });

  it.each([
    {
      name: "defaultValue minValue",
      props: {
        defaultValue: 20,
        minValue: 50,
      },
      expected: "50",
    },
    {
      name: "defaultValue maxValue",
      props: {
        defaultValue: 20,
        maxValue: 10,
      },
      expected: "10",
    },
    {
      name: "defaultValue minValue step",
      props: {
        defaultValue: 20,
        minValue: 50,
        step: 3,
      },
      expected: "50",
    },
    {
      name: "defaultValue maxValue step",
      props: {
        defaultValue: 20,
        maxValue: 10,
        step: 3,
      },
      expected: "9",
    },
    {
      name: "value minValue",
      props: {
        value: 20,
        minValue: 50,
      },
      expected: "50",
    },
    {
      name: "value maxValue",
      props: {
        value: 20,
        maxValue: 10,
      },
      expected: "10",
    },
    {
      name: "value minValue step",
      props: {
        value: 20,
        minValue: 50,
        step: 3,
      },
      expected: "50",
    },
    {
      name: "value maxValue step",
      props: {
        value: 20,
        maxValue: 10,
        step: 3,
      },
      expected: "9",
    },
  ])(
    "clamps value/defaultValue to the allowed range ($name)",
    ({ props, expected }) => {
      const wrapper = mount(Slider, {
        props: {
          label: "The Label",
          ...props,
        },
      });

      const input = wrapper.get("input[type='range']");
      expect((input.element as HTMLInputElement).value).toBe(expected);
      expect(input.attributes("aria-valuetext")).toBe(expected);
      expect(wrapper.get("output").text()).toBe(expected);
    }
  );

  it("supports custom getValueLabel", async () => {
    const wrapper = mount(Slider, {
      props: {
        label: "The Label",
        value: 50,
        getValueLabel: (value: number) => `A${value}B`,
      },
    });
    const input = wrapper.get("input[type='range']");

    expect(wrapper.get("output").text()).toBe("A50B");
    expect(input.attributes("aria-valuetext")).toBe("50");
  });

  it("supports formatOptions", async () => {
    const wrapper = mount(Slider, {
      props: {
        label: "The Label",
        minValue: 0,
        maxValue: 1,
        step: 0.01,
        defaultValue: 0.2,
        formatOptions: { style: "percent" },
      },
    });

    const input = wrapper.get("input[type='range']");
    expect(wrapper.get("output").text()).toBe("20%");
    expect(input.attributes("aria-valuetext")).toBe("20%");

    await input.setValue("0.5");
    expect(wrapper.get("output").text()).toBe("50%");
    expect(input.attributes("aria-valuetext")).toBe("50%");
  });

  it("prefixes the value with a plus sign if needed", async () => {
    const wrapper = mount(Slider, {
      props: {
        label: "The Label",
        minValue: -50,
        maxValue: 50,
        defaultValue: 10,
      },
    });

    const input = wrapper.get("input[type='range']");
    expect(wrapper.get("output").text()).toBe("+10");
    expect(input.attributes("aria-valuetext")).toBe("+10");

    await input.setValue("0");
    expect(wrapper.get("output").text()).toBe("0");
    expect(input.attributes("aria-valuetext")).toBe("0");
  });

  it("supports form name and form", () => {
    const wrapper = mount(Slider, {
      props: {
        label: "Value",
        value: 10,
        name: "cookies",
        form: "test",
      },
    });

    const input = wrapper.get("input[type='range']");
    expect(input.attributes("name")).toBe("cookies");
    expect(input.attributes("form")).toBe("test");
  });

  it("supports form reset", async () => {
    const user = userEvent.setup();
    const Harness = defineComponent({
      name: "SliderFormResetHarness",
      setup() {
        const value = ref(10);

        return () =>
          h("form", [
            h(Slider, {
              label: "Value",
              value: value.value,
              onChange: (nextValue: number) => {
                value.value = nextValue;
              },
            }),
            h("input", {
              type: "reset",
              "data-testid": "reset",
              onClick: () => {
                value.value = 10;
              },
            }),
          ]);
      },
    });

    const wrapper = mount(Harness);
    const input = wrapper.get("input[type='range']");

    expect((input.element as HTMLInputElement).value).toBe("10");
    await input.setValue("55");
    expect((input.element as HTMLInputElement).value).toBe("55");

    await user.click(wrapper.get("[data-testid='reset']").element);
    expect((input.element as HTMLInputElement).value).toBe("10");
  });

  it("supports disabled from Provider", () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme: createTheme(),
                isDisabled: true,
              },
              {
                default: () =>
                  h(Slider, {
                    label: "The Label",
                    defaultValue: 20,
                  }),
              }
            );
        },
      })
    );

    const input = wrapper.get("input[type='range']");
    expect(input.attributes("disabled")).toBeDefined();
  });

  it("supports keyboard page/home/end interactions", async () => {
    const wrapper = mount(Slider, {
      attachTo: document.body,
      props: {
        label: "The Label",
        defaultValue: 50,
        minValue: 0,
        maxValue: 100,
      },
    });

    const input = wrapper.get("input[type='range']");
    const slider = input.element as HTMLInputElement;
    await testKeypresses([slider, slider], [
      { left: press.PageUp, result: +10 },
      { left: press.Home, result: "0" },
      { left: press.End, result: "100" },
    ]);
  });

  it("snaps default keyboard page size to a step multiple (range 0-230, step 10)", async () => {
    const wrapper = mount(Slider, {
      attachTo: document.body,
      props: {
        label: "The Label",
        minValue: 0,
        maxValue: 230,
        defaultValue: 50,
        step: 10,
      },
    });

    const input = wrapper.get("input[type='range']");
    const slider = input.element as HTMLInputElement;
    await testKeypresses([slider, slider], [
      { left: press.PageUp, result: +20 },
      { left: press.PageDown, result: -20 },
    ]);
  });

  it("snaps default keyboard page size down when range-derived value is fractional", async () => {
    const wrapper = mount(Slider, {
      attachTo: document.body,
      props: {
        label: "The Label",
        minValue: 50,
        maxValue: 75,
        defaultValue: 60,
        step: 2,
      },
    });

    const input = wrapper.get("input[type='range']");
    const slider = input.element as HTMLInputElement;
    await testKeypresses([slider, slider], [
      { left: press.PageUp, result: +2 },
      { left: press.PageDown, result: -2 },
    ]);
  });

  it("snaps default keyboard page size up when range-derived value is fractional", async () => {
    const wrapper = mount(Slider, {
      attachTo: document.body,
      props: {
        label: "The Label",
        minValue: -50,
        maxValue: -15,
        defaultValue: -40,
        step: 2,
      },
    });

    const input = wrapper.get("input[type='range']");
    const slider = input.element as HTMLInputElement;
    await testKeypresses([slider, slider], [
      { left: press.PageUp, result: +4 },
      { left: press.PageDown, result: -4 },
    ]);
  });

  it("supports clicking the track", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Slider, {
      props: {
        label: "The Label",
        defaultValue: 50,
        onChange,
      },
      attachTo: document.body,
    });

    const controls = wrapper.get(".spectrum-Slider-controls");
    setTrackRect(controls.element, 100, 100);

    await controls.trigger("mousedown", { button: 0, clientX: 20, pageX: 20 });
    await nextTick();

    const input = wrapper.get("input[type='range']");
    expect((input.element as HTMLInputElement).value).toBe("20");
    expect(onChange).toHaveBeenCalledWith(20);
  });

  it("cannot click on track to move handle when disabled", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Slider, {
      props: {
        label: "The Label",
        defaultValue: 50,
        isDisabled: true,
        onChange,
      },
      attachTo: document.body,
    });

    const controls = wrapper.get(".spectrum-Slider-controls");
    setTrackRect(controls.element, 100, 100);
    await controls.trigger("mousedown", { button: 0, clientX: 20, pageX: 20 });
    await nextTick();

    const input = wrapper.get("input[type='range']");
    expect((input.element as HTMLInputElement).value).toBe("50");
    expect(onChange).not.toHaveBeenCalled();
    expect(document.activeElement).not.toBe(input.element);
  });

  it("cannot click and drag handle when disabled", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Slider, {
      props: {
        label: "The Label",
        defaultValue: 50,
        isDisabled: true,
        onChange,
      },
      attachTo: document.body,
    });

    const controls = wrapper.get(".spectrum-Slider-controls");
    const handle = wrapper.get(".spectrum-Slider-handle");
    const input = wrapper.get("input[type='range']");
    setTrackRect(controls.element, 100, 100);

    handle.element.dispatchEvent(
      createPointerEvent("pointerdown", {
        pointerId: 1,
        pointerType: "mouse",
        button: 0,
        clientX: 50,
        pageX: 50,
      })
    );

    expect(onChange).not.toHaveBeenCalled();
    expect(document.activeElement).not.toBe(input.element);

    window.dispatchEvent(
      createPointerEvent("pointermove", {
        pointerId: 1,
        pointerType: "mouse",
        clientX: 10,
        pageX: 10,
      })
    );
    await nextTick();
    expect(onChange).not.toHaveBeenCalled();

    window.dispatchEvent(
      createPointerEvent("pointerup", {
        pointerId: 1,
        pointerType: "mouse",
        clientX: 10,
        pageX: 10,
      })
    );
    expect(onChange).not.toHaveBeenCalled();
  });

  it("focuses first thumb when clicking label", async () => {
    const wrapper = mount(Slider, {
      props: {
        label: "The Label",
      },
      attachTo: document.body,
    });

    await wrapper.get("label").trigger("click");
    const input = wrapper.get("input[type='range']").element;
    expect(document.activeElement).toBe(input);
  });
});
