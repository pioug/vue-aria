import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { I18nProvider } from "@vue-aria/i18n";
import { Slider } from "../src";

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

describe("Spectrum Slider", () => {
  it("supports aria-label", () => {
    const wrapper = mount(Slider as any, {
      attrs: {
        "aria-label": "The Label",
      },
    });

    const group = wrapper.find('[role="group"]');
    expect(group.exists()).toBe(true);
    expect(group.attributes("aria-label")).toBe("The Label");

    const slider = wrapper.find('input[type="range"]');
    expect(slider.exists()).toBe(true);
    expect(slider.attributes("aria-valuetext")).toBe("0");

    wrapper.unmount();
  });

  it("supports label and value output", () => {
    const wrapper = mount(Slider as any, {
      props: {
        label: "The Label",
      },
    });

    const group = wrapper.find('[role="group"]');
    expect(group.exists()).toBe(true);
    const labelId = group.attributes("aria-labelledby");
    expect(labelId).toBeTruthy();

    const label = wrapper.find(`#${labelId}`);
    expect(label.text()).toContain("The Label");

    const slider = wrapper.find('input[type="range"]');
    expect(slider.attributes("aria-labelledby")).toContain(labelId ?? "");
    expect(slider.attributes("aria-valuetext")).toBe("0");

    const output = wrapper.find("output");
    expect(output.exists()).toBe(true);
    expect(output.text()).toBe("0");
    expect(output.attributes("for")).toBe(slider.attributes("id"));
    expect(output.attributes("aria-live")).toBe("off");

    wrapper.unmount();
  });

  it("supports showValueLabel false", () => {
    const wrapper = mount(Slider as any, {
      props: {
        label: "The Label",
        showValueLabel: false,
      },
    });

    expect(wrapper.text()).toContain("The Label");
    expect(wrapper.find("output").exists()).toBe(false);

    wrapper.unmount();
  });

  it("supports defaultValue and input change", async () => {
    const wrapper = mount(Slider as any, {
      props: {
        label: "The Label",
        defaultValue: 20,
      },
    });

    const slider = wrapper.find('input[type="range"]');
    expect((slider.element as HTMLInputElement).value).toBe("20");
    expect(slider.attributes("aria-valuetext")).toBe("20");
    expect(wrapper.find("output").text()).toBe("20");

    await slider.setValue("40");
    expect((slider.element as HTMLInputElement).value).toBe("40");
    expect(wrapper.find("output").text()).toBe("40");

    wrapper.unmount();
  });

  it.each([
    {
      name: "defaultValue minValue",
      props: { defaultValue: 20, minValue: 50 },
      expected: "50",
    },
    {
      name: "defaultValue maxValue",
      props: { defaultValue: 20, maxValue: 10 },
      expected: "10",
    },
    {
      name: "defaultValue minValue step",
      props: { defaultValue: 20, minValue: 50, step: 3 },
      expected: "50",
    },
    {
      name: "defaultValue maxValue step",
      props: { defaultValue: 20, maxValue: 10, step: 3 },
      expected: "9",
    },
    {
      name: "value minValue",
      props: { value: 20, minValue: 50 },
      expected: "50",
    },
    {
      name: "value maxValue",
      props: { value: 20, maxValue: 10 },
      expected: "10",
    },
    {
      name: "value minValue step",
      props: { value: 20, minValue: 50, step: 3 },
      expected: "50",
    },
    {
      name: "value maxValue step",
      props: { value: 20, maxValue: 10, step: 3 },
      expected: "9",
    },
  ])("clamps value/defaultValue to range: $name", ({ props, expected }) => {
    const wrapper = mount(Slider as any, {
      props: {
        label: "The Label",
        ...(props as Record<string, unknown>),
      },
    });

    const slider = wrapper.find('input[type="range"]');
    expect((slider.element as HTMLInputElement).value).toBe(expected);
    expect(slider.attributes("aria-valuetext")).toBe(expected);
    expect(wrapper.find("output").text()).toBe(expected);

    wrapper.unmount();
  });

  it("supports controlled value updates via onChange", async () => {
    const onChangeValues: number[] = [];
    const Test = defineComponent({
      setup() {
        const value = ref(50);
        const onChange = (next: number) => {
          onChangeValues.push(next);
          value.value = next;
        };
        return () =>
          h(Slider as any, {
            label: "The Label",
            value: value.value,
            onChange,
          });
      },
    });

    const wrapper = mount(Test as any);
    const slider = wrapper.find('input[type="range"]');
    expect((slider.element as HTMLInputElement).value).toBe("50");

    await slider.setValue("55");
    expect((slider.element as HTMLInputElement).value).toBe("55");
    expect(onChangeValues).toEqual([55]);

    wrapper.unmount();
  });

  it("supports custom getValueLabel formatting", async () => {
    const Test = defineComponent({
      setup() {
        const value = ref(50);
        return () =>
          h(Slider as any, {
            label: "The Label",
            value: value.value,
            onChange: (next: number) => {
              value.value = next;
            },
            getValueLabel: (next: number) => `A${next}B`,
          });
      },
    });

    const wrapper = mount(Test as any);
    const slider = wrapper.find('input[type="range"]');
    expect(wrapper.find("output").text()).toBe("A50B");
    expect(slider.attributes("aria-valuetext")).toBe("50");

    await slider.setValue("55");
    expect(wrapper.find("output").text()).toBe("A55B");

    wrapper.unmount();
  });

  it("supports form name wiring", () => {
    const wrapper = mount(Slider as any, {
      props: {
        label: "Value",
        value: 10,
        name: "cookies",
        form: "test",
      },
    });

    const slider = wrapper.find('input[type="range"]');
    expect(slider.attributes("name")).toBe("cookies");
    expect(slider.attributes("form")).toBe("test");
    expect((slider.element as HTMLInputElement).value).toBe("10");

    wrapper.unmount();
  });

  it("supports form reset with controlled value", async () => {
    const Test = defineComponent({
      setup() {
        const value = ref(10);
        return () =>
          h("form", {}, [
            h(Slider as any, {
              label: "Value",
              value: value.value,
              onChange: (next: number) => {
                value.value = next;
              },
            }),
            h("input", { type: "reset", "data-testid": "reset" }),
          ]);
      },
    });

    const wrapper = mount(Test as any, { attachTo: document.body });
    const slider = wrapper.find('input[type="range"]');
    expect((slider.element as HTMLInputElement).value).toBe("10");

    await slider.setValue("55");
    expect((slider.element as HTMLInputElement).value).toBe("55");

    await wrapper.get('[data-testid="reset"]').trigger("click");
    expect((slider.element as HTMLInputElement).value).toBe("10");

    wrapper.unmount();
  });

  it("supports disabled state", async () => {
    const wrapper = mount(Slider as any, {
      props: {
        label: "The Label",
        defaultValue: 20,
        isDisabled: true,
      },
    });

    const slider = wrapper.find('input[type="range"]');
    expect(slider.attributes("disabled")).toBeDefined();
    expect(wrapper.find("output").text()).toBe("20");
    await slider.setValue("40");
    expect(wrapper.find("output").text()).toBe("20");

    wrapper.unmount();
  });

  it("can be focused", () => {
    const wrapper = mount(Slider as any, {
      props: {
        label: "The Label",
        defaultValue: 20,
      },
      attachTo: document.body,
    });

    const slider = wrapper.find('input[type="range"]');
    (slider.element as HTMLInputElement).focus();
    expect(document.activeElement).toBe(slider.element);

    wrapper.unmount();
  });

  it("prefixes value with plus sign when range spans negative to positive", async () => {
    const wrapper = mount(Slider as any, {
      props: {
        label: "The Label",
        minValue: -50,
        maxValue: 50,
        defaultValue: 10,
      },
    });

    const slider = wrapper.find('input[type="range"]');
    expect(wrapper.find("output").text()).toBe("+10");
    expect(slider.attributes("aria-valuetext")).toBe("+10");

    await slider.setValue("0");
    expect(wrapper.find("output").text()).toBe("0");
    expect(slider.attributes("aria-valuetext")).toBe("0");

    wrapper.unmount();
  });

  it("supports custom formatOptions", async () => {
    const wrapper = mount(Slider as any, {
      props: {
        label: "The Label",
        minValue: 0,
        maxValue: 1,
        step: 0.01,
        defaultValue: 0.2,
        formatOptions: { style: "percent" },
      },
    });

    const slider = wrapper.find('input[type="range"]');
    expect(wrapper.find("output").text()).toBe("20%");
    expect(slider.attributes("aria-valuetext")).toBe("20%");

    await slider.setValue("0.5");
    expect(wrapper.find("output").text()).toBe("50%");
    expect(slider.attributes("aria-valuetext")).toBe("50%");

    wrapper.unmount();
  });

  it("clicking the label focuses the thumb input", async () => {
    const wrapper = mount(Slider as any, {
      props: {
        label: "The Label",
      },
      attachTo: document.body,
    });

    const label = wrapper.find("label.spectrum-Slider-label");
    const slider = wrapper.find('input[type="range"]');
    await label.trigger("click");

    expect(document.activeElement).toBe(slider.element);
    wrapper.unmount();
  });

  it("can click on track to move the handle", async () => {
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

    const wrapper = mount(Slider as any, {
      props: {
        label: "The Label",
        defaultValue: 50,
        onChange,
      },
      attachTo: document.body,
    });

    const slider = wrapper.find('input[type="range"]');
    const controls = wrapper.find(".spectrum-Slider-controls");

    const leftClick = new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
      button: 0,
      clientX: 20,
      clientY: 20,
    });
    Object.defineProperty(leftClick, "pageX", { value: 20 });
    Object.defineProperty(leftClick, "pageY", { value: 20 });
    controls.element.dispatchEvent(leftClick);
    await nextTick();
    expect(document.activeElement).toBe(slider.element);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(20);

    const upLeft = new MouseEvent("mouseup", { bubbles: true, cancelable: true, button: 0 });
    Object.defineProperty(upLeft, "pageX", { value: 20 });
    Object.defineProperty(upLeft, "pageY", { value: 20 });
    window.dispatchEvent(upLeft);

    onChange.mockClear();
    const rightClick = new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
      button: 0,
      clientX: 70,
      clientY: 70,
    });
    Object.defineProperty(rightClick, "pageX", { value: 70 });
    Object.defineProperty(rightClick, "pageY", { value: 70 });
    controls.element.dispatchEvent(rightClick);
    await nextTick();
    expect(document.activeElement).toBe(slider.element);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(70);

    const upRight = new MouseEvent("mouseup", { bubbles: true, cancelable: true, button: 0 });
    Object.defineProperty(upRight, "pageX", { value: 70 });
    Object.defineProperty(upRight, "pageY", { value: 70 });
    window.dispatchEvent(upRight);

    wrapper.unmount();
    rectSpy.mockRestore();
  });

  it("cannot click on track to move the handle when disabled", () => {
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

    const wrapper = mount(Slider as any, {
      props: {
        label: "The Label",
        defaultValue: 50,
        onChange,
        isDisabled: true,
      },
      attachTo: document.body,
    });

    const slider = wrapper.find('input[type="range"]');
    const controls = wrapper.find(".spectrum-Slider-controls");
    const click = new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
      button: 0,
      clientX: 20,
      clientY: 20,
    });
    Object.defineProperty(click, "pageX", { value: 20 });
    Object.defineProperty(click, "pageY", { value: 20 });
    controls.element.dispatchEvent(click);

    expect(document.activeElement).not.toBe(slider.element);
    expect(onChange).not.toHaveBeenCalled();

    const up = new MouseEvent("mouseup", { bubbles: true, cancelable: true, button: 0 });
    Object.defineProperty(up, "pageX", { value: 20 });
    Object.defineProperty(up, "pageY", { value: 20 });
    window.dispatchEvent(up);

    wrapper.unmount();
    rectSpy.mockRestore();
  });

  it("supports keyboard interactions in LTR", async () => {
    const wrapper = mount(Slider as any, {
      props: {
        label: "The Label",
        defaultValue: 50,
        minValue: 0,
        maxValue: 100,
      },
      attachTo: document.body,
    });

    const slider = wrapper.find('input[type="range"]');
    const input = slider.element as HTMLInputElement;

    pressKey(input, "ArrowRight");
    await nextTick();
    expect(input.value).toBe("51");

    pressKey(input, "ArrowLeft");
    await nextTick();
    expect(input.value).toBe("50");

    pressKey(input, "PageUp");
    await nextTick();
    expect(input.value).toBe("60");

    pressKey(input, "PageDown");
    await nextTick();
    expect(input.value).toBe("50");

    pressKey(input, "Home");
    await nextTick();
    expect(input.value).toBe("0");

    pressKey(input, "End");
    await nextTick();
    expect(input.value).toBe("100");

    wrapper.unmount();
  });

  it("supports keyboard directionality in RTL", async () => {
    const App = defineComponent({
      setup() {
        return () =>
          h(I18nProvider, { locale: "ar-AE" }, {
            default: () => [
              h(Slider as any, {
                label: "The Label",
                defaultValue: 50,
              }),
            ],
          });
      },
    });

    const wrapper = mount(App as any, { attachTo: document.body });
    const slider = wrapper.find('input[type="range"]');
    const input = slider.element as HTMLInputElement;

    pressKey(input, "ArrowRight");
    await nextTick();
    expect(input.value).toBe("49");

    pressKey(input, "ArrowLeft");
    await nextTick();
    expect(input.value).toBe("50");

    wrapper.unmount();
  });

  it("ignores keyboard interactions when disabled", async () => {
    const wrapper = mount(Slider as any, {
      props: {
        label: "The Label",
        defaultValue: 20,
        isDisabled: true,
      },
      attachTo: document.body,
    });

    const slider = wrapper.find('input[type="range"]');
    const input = slider.element as HTMLInputElement;

    pressKey(input, "ArrowRight");
    await nextTick();
    expect(input.value).toBe("20");

    pressKey(input, "PageUp");
    await nextTick();
    expect(input.value).toBe("20");

    wrapper.unmount();
  });
});
