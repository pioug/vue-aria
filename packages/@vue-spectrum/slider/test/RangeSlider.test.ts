import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { I18nProvider } from "@vue-aria/i18n";
import { RangeSlider } from "../src";

function pressKey(input: HTMLInputElement, key: string) {
  input.focus();
  input.dispatchEvent(
    new KeyboardEvent("keydown", {
      key,
      bubbles: true,
      cancelable: true,
    })
  );
  input.dispatchEvent(
    new KeyboardEvent("keyup", {
      key,
      bubbles: true,
      cancelable: true,
    })
  );
}

function dispatchMouse(target: EventTarget, type: "mousedown" | "mousemove" | "mouseup", value: number) {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    button: 0,
    clientX: value,
    clientY: value,
  });
  Object.defineProperty(event, "pageX", { value });
  Object.defineProperty(event, "pageY", { value });
  target.dispatchEvent(event);
}

describe("Spectrum RangeSlider", () => {
  it("supports aria-label", () => {
    const wrapper = mount(RangeSlider as any, {
      attrs: {
        "aria-label": "The Label",
      },
    });

    const group = wrapper.find('[role="group"]');
    expect(group.exists()).toBe(true);
    expect(group.attributes("aria-label")).toBe("The Label");

    wrapper.unmount();
  });

  it("supports label and minimum/maximum thumb labeling", () => {
    const wrapper = mount(RangeSlider as any, {
      props: {
        label: "The Label",
      },
    });

    const group = wrapper.find('[role="group"]');
    const labelId = group.attributes("aria-labelledby");
    expect(labelId).toBeTruthy();

    const sliders = wrapper.findAll('input[type="range"]');
    expect(sliders).toHaveLength(2);
    expect(sliders[0].attributes("aria-label")).toBe("Minimum");
    expect(sliders[1].attributes("aria-label")).toBe("Maximum");
    expect(sliders[0].attributes("aria-labelledby")).toContain(labelId ?? "");
    expect(sliders[1].attributes("aria-labelledby")).toContain(labelId ?? "");

    const output = wrapper.find("output");
    expect(output.text()).toBe("0 – 100");
    expect(output.attributes("for")).toBe(
      `${sliders[0].attributes("id")} ${sliders[1].attributes("id")}`
    );

    wrapper.unmount();
  });

  it("supports showValueLabel false", () => {
    const wrapper = mount(RangeSlider as any, {
      props: {
        label: "The Label",
        showValueLabel: false,
      },
    });

    expect(wrapper.text()).toContain("The Label");
    expect(wrapper.find("output").exists()).toBe(false);

    wrapper.unmount();
  });

  it("supports defaultValue and thumb changes", async () => {
    const wrapper = mount(RangeSlider as any, {
      props: {
        label: "The Label",
        defaultValue: { start: 20, end: 40 },
      },
    });

    const sliders = wrapper.findAll('input[type="range"]');
    expect((sliders[0].element as HTMLInputElement).value).toBe("20");
    expect((sliders[1].element as HTMLInputElement).value).toBe("40");
    expect(wrapper.find("output").text()).toBe("20 – 40");

    await sliders[0].setValue("30");
    expect((sliders[0].element as HTMLInputElement).value).toBe("30");
    expect(wrapper.find("output").text()).toBe("30 – 40");

    await sliders[1].setValue("50");
    expect((sliders[1].element as HTMLInputElement).value).toBe("50");
    expect(wrapper.find("output").text()).toBe("30 – 50");

    wrapper.unmount();
  });

  it("supports controlled updates via onChange", async () => {
    const onChangeValues: Array<{ start: number; end: number }> = [];
    const Test = defineComponent({
      setup() {
        const value = ref({ start: 20, end: 40 });
        const onChange = (next: { start: number; end: number }) => {
          onChangeValues.push(next);
          value.value = next;
        };

        return () =>
          h(RangeSlider as any, {
            label: "The Label",
            value: value.value,
            onChange,
          });
      },
    });

    const wrapper = mount(Test as any);
    const sliders = wrapper.findAll('input[type="range"]');

    await sliders[0].setValue("30");
    await sliders[1].setValue("50");

    expect((sliders[0].element as HTMLInputElement).value).toBe("30");
    expect((sliders[1].element as HTMLInputElement).value).toBe("50");
    expect(onChangeValues).toEqual([
      { start: 30, end: 40 },
      { start: 30, end: 50 },
    ]);

    wrapper.unmount();
  });

  it("supports custom getValueLabel formatting", async () => {
    const Test = defineComponent({
      setup() {
        const value = ref({ start: 10, end: 40 });
        return () =>
          h(RangeSlider as any, {
            label: "The Label",
            value: value.value,
            onChange: (next: { start: number; end: number }) => {
              value.value = next;
            },
            getValueLabel: (next: { start: number; end: number }) =>
              `A${next.start}B${next.end}C`,
          });
      },
    });

    const wrapper = mount(Test as any);
    const sliders = wrapper.findAll('input[type="range"]');
    expect(wrapper.find("output").text()).toBe("A10B40C");
    expect(sliders[0].attributes("aria-valuetext")).toBe("10");
    expect(sliders[1].attributes("aria-valuetext")).toBe("40");

    await sliders[0].setValue("5");
    expect(wrapper.find("output").text()).toBe("A5B40C");
    await sliders[1].setValue("60");
    expect(wrapper.find("output").text()).toBe("A5B60C");

    wrapper.unmount();
  });

  it("supports disabled state for both thumbs", () => {
    const wrapper = mount(RangeSlider as any, {
      props: {
        label: "The Label",
        isDisabled: true,
      },
    });

    const sliders = wrapper.findAll('input[type="range"]');
    expect(sliders).toHaveLength(2);
    expect(sliders[0].attributes("disabled")).toBeDefined();
    expect(sliders[1].attributes("disabled")).toBeDefined();

    wrapper.unmount();
  });

  it("can focus each thumb", () => {
    const wrapper = mount(RangeSlider as any, {
      props: {
        label: "The Label",
        defaultValue: { start: 20, end: 50 },
      },
      attachTo: document.body,
    });

    const sliders = wrapper.findAll('input[type="range"]');
    (sliders[0].element as HTMLInputElement).focus();
    expect(document.activeElement).toBe(sliders[0].element);

    (sliders[1].element as HTMLInputElement).focus();
    expect(document.activeElement).toBe(sliders[1].element);

    wrapper.unmount();
  });

  it("supports form reset with controlled values", async () => {
    const Test = defineComponent({
      setup() {
        const value = ref({ start: 10, end: 40 });
        return () =>
          h("form", {}, [
            h(RangeSlider as any, {
              label: "Value",
              value: value.value,
              onChange: (next: { start: number; end: number }) => {
                value.value = next;
              },
            }),
            h("input", { type: "reset", "data-testid": "reset" }),
          ]);
      },
    });

    const wrapper = mount(Test as any, { attachTo: document.body });
    const sliders = wrapper.findAll('input[type="range"]');
    expect((sliders[0].element as HTMLInputElement).value).toBe("10");
    expect((sliders[1].element as HTMLInputElement).value).toBe("40");

    await sliders[0].setValue("30");
    await sliders[1].setValue("60");
    expect((sliders[0].element as HTMLInputElement).value).toBe("30");
    expect((sliders[1].element as HTMLInputElement).value).toBe("60");

    await wrapper.get('[data-testid="reset"]').trigger("click");
    await nextTick();
    expect((sliders[0].element as HTMLInputElement).value).toBe("10");
    expect((sliders[1].element as HTMLInputElement).value).toBe("40");

    wrapper.unmount();
  });

  it("prefixes values with plus signs when range spans negative to positive", async () => {
    const wrapper = mount(RangeSlider as any, {
      props: {
        label: "The Label",
        minValue: -50,
        maxValue: 50,
        defaultValue: { start: 10, end: 20 },
      },
    });

    const sliders = wrapper.findAll('input[type="range"]');
    expect(wrapper.find("output").text()).toBe("+10 – +20");
    expect(sliders[0].attributes("aria-valuetext")).toBe("+10");
    expect(sliders[1].attributes("aria-valuetext")).toBe("+20");

    await sliders[0].setValue("-35");
    expect(wrapper.find("output").text()).toBe("-35 – +20");
    expect(sliders[0].attributes("aria-valuetext")).toBe("-35");

    await sliders[1].setValue("0");
    expect(wrapper.find("output").text()).toBe("-35 – 0");
    expect(sliders[1].attributes("aria-valuetext")).toBe("0");

    wrapper.unmount();
  });

  it("supports custom formatOptions", async () => {
    const wrapper = mount(RangeSlider as any, {
      props: {
        label: "The Label",
        minValue: 0,
        maxValue: 1,
        step: 0.01,
        defaultValue: { start: 0.2, end: 0.6 },
        formatOptions: { style: "percent" },
      },
    });

    const sliders = wrapper.findAll('input[type="range"]');
    expect(wrapper.find("output").text()).toBe("20% – 60%");
    expect(sliders[0].attributes("aria-valuetext")).toBe("20%");
    expect(sliders[1].attributes("aria-valuetext")).toBe("60%");

    await sliders[0].setValue("0.3");
    expect(wrapper.find("output").text()).toBe("30% – 60%");
    expect(sliders[0].attributes("aria-valuetext")).toBe("30%");

    await sliders[1].setValue("0.7");
    expect(wrapper.find("output").text()).toBe("30% – 70%");
    expect(sliders[1].attributes("aria-valuetext")).toBe("70%");

    wrapper.unmount();
  });

  it("supports thumb form names", () => {
    const wrapper = mount(RangeSlider as any, {
      props: {
        label: "Value",
        value: { start: 10, end: 40 },
        startName: "minCookies",
        endName: "maxCookies",
        form: "test",
      },
    });

    const sliders = wrapper.findAll('input[type="range"]');
    expect(sliders[0].attributes("name")).toBe("minCookies");
    expect(sliders[0].attributes("form")).toBe("test");
    expect(sliders[1].attributes("name")).toBe("maxCookies");
    expect(sliders[1].attributes("form")).toBe("test");

    wrapper.unmount();
  });

  it("clicking the label focuses the first thumb input", async () => {
    const wrapper = mount(RangeSlider as any, {
      props: {
        label: "The Label",
        defaultValue: { start: 40, end: 70 },
      },
      attachTo: document.body,
    });

    const label = wrapper.find("label.spectrum-Slider-label");
    const sliders = wrapper.findAll('input[type="range"]');
    await label.trigger("click");

    expect(document.activeElement).toBe(sliders[0].element);
    wrapper.unmount();
  });

  it("can click on track to move the nearest handle", async () => {
    const onChange = vi.fn();
    const rectSpy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(() => ({
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        right: 100,
        bottom: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }));

    const wrapper = mount(RangeSlider as any, {
      props: {
        label: "The Label",
        defaultValue: { start: 40, end: 70 },
        onChange,
      },
      attachTo: document.body,
    });

    const sliders = wrapper.findAll('input[type="range"]');
    const controls = wrapper.find(".spectrum-Slider-controls");

    dispatchMouse(controls.element, "mousedown", 20);
    await nextTick();
    expect(document.activeElement).toBe(sliders[0].element);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith({ start: 20, end: 70 });

    dispatchMouse(window, "mouseup", 20);

    onChange.mockClear();
    dispatchMouse(controls.element, "mousedown", 60);
    await nextTick();
    expect(document.activeElement).toBe(sliders[1].element);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith({ start: 20, end: 60 });

    dispatchMouse(window, "mouseup", 60);

    onChange.mockClear();
    dispatchMouse(controls.element, "mousedown", 90);
    await nextTick();
    expect(document.activeElement).toBe(sliders[1].element);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith({ start: 20, end: 90 });

    dispatchMouse(window, "mouseup", 90);

    wrapper.unmount();
    rectSpy.mockRestore();
  });

  it("cannot click on track to move handles when disabled", () => {
    const onChange = vi.fn();
    const rectSpy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(() => ({
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        right: 100,
        bottom: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }));

    const wrapper = mount(RangeSlider as any, {
      props: {
        label: "The Label",
        defaultValue: { start: 40, end: 70 },
        onChange,
        isDisabled: true,
      },
      attachTo: document.body,
    });

    const sliders = wrapper.findAll('input[type="range"]');
    const controls = wrapper.find(".spectrum-Slider-controls");
    dispatchMouse(controls.element, "mousedown", 20);

    expect(document.activeElement).not.toBe(sliders[0].element);
    expect(document.activeElement).not.toBe(sliders[1].element);
    expect(onChange).not.toHaveBeenCalled();

    dispatchMouse(window, "mouseup", 20);

    wrapper.unmount();
    rectSpy.mockRestore();
  });

  it("can click and drag each handle", () => {
    const onChange = vi.fn();
    const rectSpy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(() => ({
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        right: 100,
        bottom: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }));

    const wrapper = mount(RangeSlider as any, {
      props: {
        label: "The Label",
        defaultValue: { start: 20, end: 50 },
        onChange,
      },
      attachTo: document.body,
    });

    const sliders = wrapper.findAll('input[type="range"]');
    const thumbs = wrapper.findAll(".spectrum-Slider-handle");

    dispatchMouse(thumbs[0].element, "mousedown", 20);
    expect(onChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(sliders[0].element);

    dispatchMouse(window, "mousemove", 10);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith({ start: 10, end: 50 });

    dispatchMouse(window, "mousemove", -10);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith({ start: 0, end: 50 });

    dispatchMouse(window, "mousemove", 120);
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenLastCalledWith({ start: 50, end: 50 });

    dispatchMouse(window, "mouseup", 120);
    expect(onChange).toHaveBeenCalledTimes(3);

    onChange.mockClear();
    dispatchMouse(thumbs[1].element, "mousedown", 50);
    expect(onChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(sliders[1].element);

    dispatchMouse(window, "mousemove", 60);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith({ start: 50, end: 60 });

    dispatchMouse(window, "mousemove", -10);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith({ start: 50, end: 50 });

    dispatchMouse(window, "mousemove", 120);
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenLastCalledWith({ start: 50, end: 100 });

    dispatchMouse(window, "mouseup", 120);
    expect(onChange).toHaveBeenCalledTimes(3);

    wrapper.unmount();
    rectSpy.mockRestore();
  });

  it("cannot click and drag handles when disabled", () => {
    const onChange = vi.fn();
    const rectSpy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(() => ({
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        right: 100,
        bottom: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }));

    const wrapper = mount(RangeSlider as any, {
      props: {
        label: "The Label",
        defaultValue: { start: 20, end: 50 },
        onChange,
        isDisabled: true,
      },
      attachTo: document.body,
    });

    const sliders = wrapper.findAll('input[type="range"]');
    const thumbs = wrapper.findAll(".spectrum-Slider-handle");

    dispatchMouse(thumbs[0].element, "mousedown", 20);
    expect(onChange).not.toHaveBeenCalled();
    expect(document.activeElement).not.toBe(sliders[0].element);

    dispatchMouse(window, "mousemove", 10);
    dispatchMouse(window, "mouseup", 10);
    expect(onChange).not.toHaveBeenCalled();

    dispatchMouse(thumbs[1].element, "mousedown", 50);
    expect(onChange).not.toHaveBeenCalled();
    expect(document.activeElement).not.toBe(sliders[1].element);

    dispatchMouse(window, "mousemove", 60);
    dispatchMouse(window, "mouseup", 60);
    expect(onChange).not.toHaveBeenCalled();

    wrapper.unmount();
    rectSpy.mockRestore();
  });

  it("supports keyboard interactions in LTR", async () => {
    const wrapper = mount(RangeSlider as any, {
      props: {
        label: "The Label",
        defaultValue: { start: 20, end: 50 },
        minValue: 0,
        maxValue: 100,
      },
      attachTo: document.body,
    });

    const sliders = wrapper.findAll('input[type="range"]');
    const left = sliders[0].element as HTMLInputElement;
    const right = sliders[1].element as HTMLInputElement;

    pressKey(left, "ArrowRight");
    await nextTick();
    expect(left.value).toBe("21");

    pressKey(left, "ArrowLeft");
    await nextTick();
    expect(left.value).toBe("20");

    pressKey(right, "ArrowRight");
    await nextTick();
    expect(right.value).toBe("51");

    pressKey(right, "ArrowLeft");
    await nextTick();
    expect(right.value).toBe("50");

    pressKey(left, "Home");
    await nextTick();
    expect(left.value).toBe("0");

    pressKey(right, "End");
    await nextTick();
    expect(right.value).toBe("100");

    wrapper.unmount();
  });

  it("supports keyboard directionality in RTL", async () => {
    const App = defineComponent({
      setup() {
        return () =>
          h(I18nProvider, { locale: "ar-AE" }, {
            default: () => [
              h(RangeSlider as any, {
                label: "The Label",
                defaultValue: { start: 20, end: 50 },
              }),
            ],
          });
      },
    });

    const wrapper = mount(App as any, { attachTo: document.body });
    const sliders = wrapper.findAll('input[type="range"]');
    const left = sliders[0].element as HTMLInputElement;
    const right = sliders[1].element as HTMLInputElement;

    pressKey(left, "ArrowRight");
    await nextTick();
    expect(left.value).toBe("19");

    pressKey(right, "ArrowLeft");
    await nextTick();
    expect(right.value).toBe("51");

    wrapper.unmount();
  });

  it("ignores keyboard interactions when disabled", async () => {
    const wrapper = mount(RangeSlider as any, {
      props: {
        label: "The Label",
        defaultValue: { start: 20, end: 50 },
        isDisabled: true,
      },
      attachTo: document.body,
    });

    const sliders = wrapper.findAll('input[type="range"]');
    const left = sliders[0].element as HTMLInputElement;
    const right = sliders[1].element as HTMLInputElement;

    pressKey(left, "ArrowRight");
    pressKey(right, "ArrowLeft");
    await nextTick();

    expect(left.value).toBe("20");
    expect(right.value).toBe("50");

    wrapper.unmount();
  });

  it("localizes minimum and maximum thumb labels", () => {
    const App = defineComponent({
      setup() {
        return () =>
          h(I18nProvider, { locale: "ar-AE" }, {
            default: () => [
              h(RangeSlider as any, {
                label: "The Label",
              }),
            ],
          });
      },
    });

    const wrapper = mount(App as any);
    const sliders = wrapper.findAll('input[type="range"]');
    expect(sliders[0].attributes("aria-label")).toBe("أدنى");
    expect(sliders[1].attributes("aria-label")).toBe("أقصى");

    wrapper.unmount();
  });
});
