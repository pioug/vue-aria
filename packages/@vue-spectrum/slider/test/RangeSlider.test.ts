import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { Provider } from "@vue-spectrum/provider";
import { RangeSlider } from "../src";
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

describe("RangeSlider", () => {
  it("supports aria-label", () => {
    const wrapper = mount(RangeSlider, {
      attrs: {
        "aria-label": "The Label",
      },
    });

    expect(wrapper.get("[role='group']").attributes("aria-label")).toBe("The Label");
  });

  it("supports label and localized thumb labels", () => {
    const wrapper = mount(RangeSlider, {
      props: {
        label: "The Label",
      },
    });

    const group = wrapper.get("[role='group']");
    const inputs = wrapper.findAll("input[type='range']");
    expect(inputs).toHaveLength(2);

    const labelId = group.attributes("aria-labelledby");
    expect(labelId).toBeTruthy();
    expect(inputs[0].attributes("aria-label")).toBe("Minimum");
    expect(inputs[1].attributes("aria-label")).toBe("Maximum");
    expect(inputs[0].attributes("aria-labelledby")).toContain(labelId);
    expect(inputs[1].attributes("aria-labelledby")).toContain(labelId);

    expect(wrapper.get("output").text()).toBe("0 \u2013 100");
  });

  it("supports showValueLabel false", () => {
    const wrapper = mount(RangeSlider, {
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
        name: "RangeSliderDisabledHarness",
        setup() {
          return () =>
            h("div", [
              h("button", { "data-testid": "before" }, "Before"),
              h(RangeSlider, {
                label: "The Label",
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

    const inputs = wrapper.findAll("input[type='range']");
    expect(inputs).toHaveLength(2);
    expect(inputs[0].attributes("disabled")).toBeDefined();
    expect(inputs[1].attributes("disabled")).toBeDefined();

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
        name: "RangeSliderFocusableHarness",
        setup() {
          return () =>
            h("div", [
              h("button", { "data-testid": "before" }, "Before"),
              h(RangeSlider, {
                label: "The Label",
                defaultValue: {
                  start: 20,
                  end: 50,
                },
              }),
              h("button", { "data-testid": "after" }, "After"),
            ]);
        },
      }),
      {
        attachTo: document.body,
      }
    );

    const inputs = wrapper.findAll("input[type='range']");
    const before = wrapper.get("[data-testid='before']").element;
    const after = wrapper.get("[data-testid='after']").element;

    await user.tab();
    expect(document.activeElement).toBe(before);
    await user.tab();
    expect(document.activeElement).toBe(inputs[0].element);
    await user.tab();
    expect(document.activeElement).toBe(inputs[1].element);
    await user.tab();
    expect(document.activeElement).toBe(after);
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(inputs[1].element);
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(inputs[0].element);
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(before);
  });

  it("supports defaultValue", async () => {
    const wrapper = mount(RangeSlider, {
      props: {
        label: "The Label",
        defaultValue: {
          start: 20,
          end: 40,
        },
      },
    });

    const inputs = wrapper.findAll("input[type='range']");
    expect((inputs[0].element as HTMLInputElement).value).toBe("20");
    expect((inputs[1].element as HTMLInputElement).value).toBe("40");

    await inputs[0].setValue("30");
    await inputs[1].setValue("50");
    expect(wrapper.get("output").text()).toBe("30 \u2013 50");
  });

  it("supports controlled value", async () => {
    const Harness = defineComponent({
      name: "RangeSliderControlledHarness",
      setup() {
        const value = ref({
          start: 20,
          end: 40,
        });

        return () =>
          h(RangeSlider, {
            label: "The Label",
            value: value.value,
            onChange: (next) => {
              value.value = next;
            },
          });
      },
    });

    const wrapper = mount(Harness);
    const inputs = wrapper.findAll("input[type='range']");

    await inputs[0].setValue("30");
    await inputs[1].setValue("50");

    expect((inputs[0].element as HTMLInputElement).value).toBe("30");
    expect((inputs[1].element as HTMLInputElement).value).toBe("50");
    expect(wrapper.get("output").text()).toBe("30 \u2013 50");
  });

  it("supports custom value label", () => {
    const wrapper = mount(RangeSlider, {
      props: {
        label: "The Label",
        value: {
          start: 10,
          end: 40,
        },
        getValueLabel: (value) => `A${value.start}B${value.end}C`,
      },
    });

    expect(wrapper.get("output").text()).toBe("A10B40C");
    const inputs = wrapper.findAll("input[type='range']");
    expect(inputs[0].attributes("aria-valuetext")).toBe("10");
    expect(inputs[1].attributes("aria-valuetext")).toBe("40");
  });

  it("prefixes the value with a plus sign if needed", async () => {
    const wrapper = mount(RangeSlider, {
      props: {
        label: "The Label",
        minValue: -50,
        maxValue: 50,
        defaultValue: {
          start: 10,
          end: 20,
        },
      },
    });

    const inputs = wrapper.findAll("input[type='range']");
    expect(wrapper.get("output").text()).toBe("+10 \u2013 +20");
    expect(inputs[0].attributes("aria-valuetext")).toBe("+10");
    expect(inputs[1].attributes("aria-valuetext")).toBe("+20");

    await inputs[0].setValue("-35");
    expect(wrapper.get("output").text()).toBe("-35 \u2013 +20");
    expect(inputs[0].attributes("aria-valuetext")).toBe("-35");

    await inputs[1].setValue("0");
    expect(wrapper.get("output").text()).toBe("-35 \u2013 0");
    expect(inputs[1].attributes("aria-valuetext")).toBe("0");
  });

  it("supports custom formatOptions", async () => {
    const wrapper = mount(RangeSlider, {
      props: {
        label: "The Label",
        minValue: 0,
        maxValue: 1,
        step: 0.01,
        defaultValue: {
          start: 0.2,
          end: 0.6,
        },
        formatOptions: { style: "percent" },
      },
    });

    const inputs = wrapper.findAll("input[type='range']");
    expect(wrapper.get("output").text()).toBe("20% \u2013 60%");
    expect(inputs[0].attributes("aria-valuetext")).toBe("20%");
    expect(inputs[1].attributes("aria-valuetext")).toBe("60%");

    await inputs[0].setValue("0.3");
    expect(wrapper.get("output").text()).toBe("30% \u2013 60%");
    expect(inputs[0].attributes("aria-valuetext")).toBe("30%");

    await inputs[1].setValue("0.7");
    expect(wrapper.get("output").text()).toBe("30% \u2013 70%");
    expect(inputs[1].attributes("aria-valuetext")).toBe("70%");
  });

  it("supports startName/endName and form", () => {
    const wrapper = mount(RangeSlider, {
      props: {
        label: "Value",
        value: {
          start: 10,
          end: 40,
        },
        startName: "minCookies",
        endName: "maxCookies",
        form: "test",
      },
    });

    const inputs = wrapper.findAll("input[type='range']");
    expect(inputs[0].attributes("name")).toBe("minCookies");
    expect(inputs[1].attributes("name")).toBe("maxCookies");
    expect(inputs[0].attributes("form")).toBe("test");
    expect(inputs[1].attributes("form")).toBe("test");
  });

  it("supports form reset", async () => {
    const user = userEvent.setup();
    const Harness = defineComponent({
      name: "RangeSliderFormResetHarness",
      setup() {
        const value = ref({
          start: 10,
          end: 40,
        });

        return () =>
          h("form", [
            h(RangeSlider, {
              label: "Value",
              value: value.value,
              onChange: (next) => {
                value.value = next;
              },
            }),
            h("input", {
              type: "reset",
              "data-testid": "reset",
              onClick: () => {
                value.value = { start: 10, end: 40 };
              },
            }),
          ]);
      },
    });

    const wrapper = mount(Harness);
    const inputs = wrapper.findAll("input[type='range']");

    await inputs[0].setValue("30");
    await inputs[1].setValue("60");
    expect((inputs[0].element as HTMLInputElement).value).toBe("30");
    expect((inputs[1].element as HTMLInputElement).value).toBe("60");

    await user.click(wrapper.get("[data-testid='reset']").element);
    expect((inputs[0].element as HTMLInputElement).value).toBe("10");
    expect((inputs[1].element as HTMLInputElement).value).toBe("40");
  });

  it("uses localized minimum/maximum labels", () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme: createTheme(),
                locale: "fr-FR",
              },
              {
                default: () =>
                  h(RangeSlider, {
                    label: "Valeur",
                  }),
              }
            );
        },
      })
    );

    const inputs = wrapper.findAll("input[type='range']");
    expect(inputs[0].attributes("aria-label")).toBe("Minimum");
    expect(inputs[1].attributes("aria-label")).toBe("Maximum");
  });

  it("snaps default page size to a step multiple for keyboard paging", async () => {
    const wrapper = mount(RangeSlider, {
      attachTo: document.body,
      props: {
        label: "The Label",
        minValue: 0,
        maxValue: 230,
        defaultValue: {
          start: 20,
          end: 50,
        },
        step: 10,
      },
    });

    const inputs = wrapper.findAll("input[type='range']");
    const startInput = inputs[0];
    const startSlider = startInput.element as HTMLInputElement;
    await testKeypresses([startSlider, startSlider], [
      { left: press.PageUp, result: +20 },
      { left: press.PageDown, result: -20 },
    ]);
  });

  it("applies snapped fractional default page size for keyboard paging", async () => {
    const wrapper = mount(RangeSlider, {
      attachTo: document.body,
      props: {
        label: "The Label",
        minValue: -50,
        maxValue: -15,
        defaultValue: {
          start: -40,
          end: -20,
        },
        step: 2,
      },
    });

    const inputs = wrapper.findAll("input[type='range']");
    const startInput = inputs[0];
    const startSlider = startInput.element as HTMLInputElement;
    await testKeypresses([startSlider, startSlider], [
      { left: press.PageUp, result: +4 },
      { left: press.PageDown, result: -4 },
    ]);
  });

  it("can click on track to move nearest handle", async () => {
    const onChange = vi.fn();
    const wrapper = mount(RangeSlider, {
      props: {
        label: "The Label",
        defaultValue: {
          start: 40,
          end: 70,
        },
        onChange,
      },
      attachTo: document.body,
    });

    const controls = wrapper.get(".spectrum-Slider-controls");
    setTrackRect(controls.element, 100, 100);
    const tracks = wrapper.findAll(".spectrum-Slider-track");
    const inputs = wrapper.findAll("input[type='range']");
    expect(tracks).toHaveLength(3);

    await tracks[0].trigger("mousedown", { button: 0, clientX: 20, pageX: 20 });
    await nextTick();
    expect(document.activeElement).toBe(inputs[0].element);
    expect(onChange).toHaveBeenLastCalledWith({ start: 20, end: 70 });
    await controls.trigger("mouseup", { button: 0, clientX: 20, pageX: 20 });

    await tracks[1].trigger("mousedown", { button: 0, clientX: 40, pageX: 40 });
    await nextTick();
    expect(document.activeElement).toBe(inputs[0].element);
    expect(onChange).toHaveBeenLastCalledWith({ start: 40, end: 70 });
    await controls.trigger("mouseup", { button: 0, clientX: 40, pageX: 40 });

    await tracks[1].trigger("mousedown", { button: 0, clientX: 60, pageX: 60 });
    await nextTick();
    expect(document.activeElement).toBe(inputs[1].element);
    expect(onChange).toHaveBeenLastCalledWith({ start: 40, end: 60 });
    await controls.trigger("mouseup", { button: 0, clientX: 60, pageX: 60 });

    await tracks[2].trigger("mousedown", { button: 0, clientX: 90, pageX: 90 });
    await nextTick();
    expect(document.activeElement).toBe(inputs[1].element);
    expect(onChange).toHaveBeenLastCalledWith({ start: 40, end: 90 });
    await controls.trigger("mouseup", { button: 0, clientX: 90, pageX: 90 });
  });

  it("cannot click on track to move nearest handle when disabled", async () => {
    const onChange = vi.fn();
    const wrapper = mount(RangeSlider, {
      props: {
        label: "The Label",
        defaultValue: {
          start: 40,
          end: 70,
        },
        isDisabled: true,
        onChange,
      },
      attachTo: document.body,
    });

    const controls = wrapper.get(".spectrum-Slider-controls");
    setTrackRect(controls.element, 100, 100);
    const tracks = wrapper.findAll(".spectrum-Slider-track");
    const inputs = wrapper.findAll("input[type='range']");
    expect(tracks).toHaveLength(3);

    await tracks[0].trigger("mousedown", { button: 0, clientX: 20, pageX: 20 });
    await tracks[1].trigger("mousedown", { button: 0, clientX: 40, pageX: 40 });
    await tracks[1].trigger("mousedown", { button: 0, clientX: 60, pageX: 60 });
    await tracks[2].trigger("mousedown", { button: 0, clientX: 90, pageX: 90 });
    await nextTick();

    expect(onChange).not.toHaveBeenCalled();
    expect((inputs[0].element as HTMLInputElement).value).toBe("40");
    expect((inputs[1].element as HTMLInputElement).value).toBe("70");
    expect(document.activeElement).not.toBe(inputs[0].element);
    expect(document.activeElement).not.toBe(inputs[1].element);
  });

  it("can click and drag handle", async () => {
    const onChange = vi.fn();
    const wrapper = mount(RangeSlider, {
      props: {
        label: "The Label",
        defaultValue: {
          start: 20,
          end: 50,
        },
        onChange,
      },
      attachTo: document.body,
    });

    const controls = wrapper.get(".spectrum-Slider-controls");
    const handles = wrapper.findAll(".spectrum-Slider-handle");
    const inputs = wrapper.findAll("input[type='range']");
    setTrackRect(controls.element, 100, 100);
    expect(handles).toHaveLength(2);

    handles[0].element.dispatchEvent(
      createPointerEvent("pointerdown", {
        pointerId: 1,
        pointerType: "mouse",
        button: 0,
        clientX: 20,
        pageX: 20,
      })
    );
    expect(onChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(inputs[0].element);

    window.dispatchEvent(
      createPointerEvent("pointermove", {
        pointerId: 1,
        pointerType: "mouse",
        clientX: 10,
        pageX: 10,
      })
    );
    await nextTick();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith({ start: 10, end: 50 });

    window.dispatchEvent(
      createPointerEvent("pointermove", {
        pointerId: 1,
        pointerType: "mouse",
        clientX: -10,
        pageX: -10,
      })
    );
    await nextTick();
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith({ start: 0, end: 50 });

    window.dispatchEvent(
      createPointerEvent("pointermove", {
        pointerId: 1,
        pointerType: "mouse",
        clientX: 120,
        pageX: 120,
      })
    );
    await nextTick();
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenLastCalledWith({ start: 50, end: 50 });

    window.dispatchEvent(
      createPointerEvent("pointerup", {
        pointerId: 1,
        pointerType: "mouse",
        clientX: 120,
        pageX: 120,
      })
    );
    expect(onChange).toHaveBeenCalledTimes(3);

    onChange.mockClear();

    handles[1].element.dispatchEvent(
      createPointerEvent("pointerdown", {
        pointerId: 2,
        pointerType: "mouse",
        button: 0,
        clientX: 50,
        pageX: 50,
      })
    );
    expect(onChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(inputs[1].element);

    window.dispatchEvent(
      createPointerEvent("pointermove", {
        pointerId: 2,
        pointerType: "mouse",
        clientX: 60,
        pageX: 60,
      })
    );
    await nextTick();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith({ start: 50, end: 60 });

    window.dispatchEvent(
      createPointerEvent("pointermove", {
        pointerId: 2,
        pointerType: "mouse",
        clientX: -10,
        pageX: -10,
      })
    );
    await nextTick();
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith({ start: 50, end: 50 });

    window.dispatchEvent(
      createPointerEvent("pointermove", {
        pointerId: 2,
        pointerType: "mouse",
        clientX: 120,
        pageX: 120,
      })
    );
    await nextTick();
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenLastCalledWith({ start: 50, end: 100 });

    window.dispatchEvent(
      createPointerEvent("pointerup", {
        pointerId: 2,
        pointerType: "mouse",
        clientX: 120,
        pageX: 120,
      })
    );
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it("cannot click and drag handle when disabled", async () => {
    const onChange = vi.fn();
    const wrapper = mount(RangeSlider, {
      props: {
        label: "The Label",
        defaultValue: {
          start: 20,
          end: 50,
        },
        isDisabled: true,
        onChange,
      },
      attachTo: document.body,
    });

    const controls = wrapper.get(".spectrum-Slider-controls");
    const handles = wrapper.findAll(".spectrum-Slider-handle");
    const inputs = wrapper.findAll("input[type='range']");
    setTrackRect(controls.element, 100, 100);
    expect(handles).toHaveLength(2);

    await handles[0].trigger("mousedown", { button: 0, clientX: 20, pageX: 20 });
    window.dispatchEvent(
      createPointerEvent("pointermove", {
        pointerId: 1,
        pointerType: "mouse",
        clientX: 10,
        pageX: 10,
      })
    );
    window.dispatchEvent(
      createPointerEvent("pointerup", {
        pointerId: 1,
        pointerType: "mouse",
        clientX: 10,
        pageX: 10,
      })
    );
    await nextTick();

    await handles[1].trigger("mousedown", { button: 0, clientX: 50, pageX: 50 });
    window.dispatchEvent(
      createPointerEvent("pointermove", {
        pointerId: 2,
        pointerType: "mouse",
        clientX: 60,
        pageX: 60,
      })
    );
    window.dispatchEvent(
      createPointerEvent("pointerup", {
        pointerId: 2,
        pointerType: "mouse",
        clientX: 60,
        pageX: 60,
      })
    );
    await nextTick();

    expect(onChange).not.toHaveBeenCalled();
    expect((inputs[0].element as HTMLInputElement).value).toBe("20");
    expect((inputs[1].element as HTMLInputElement).value).toBe("50");
    expect(document.activeElement).not.toBe(inputs[0].element);
    expect(document.activeElement).not.toBe(inputs[1].element);
  });

  it("focuses the first thumb when clicking the label", async () => {
    const wrapper = mount(RangeSlider, {
      props: {
        label: "The Label",
        defaultValue: {
          start: 40,
          end: 70,
        },
      },
      attachTo: document.body,
    });

    const inputs = wrapper.findAll("input[type='range']");
    await wrapper.get("label").trigger("click");
    expect(document.activeElement).toBe(inputs[0].element);
  });
});
