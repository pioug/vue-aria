import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { Provider } from "@vue-spectrum/provider";
import { Slider } from "../src";

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
    const user = userEvent.setup();
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
    (input.element as HTMLInputElement).focus();

    await user.keyboard("{PageUp}");
    expect((input.element as HTMLInputElement).value).toBe("60");

    await user.keyboard("{Home}");
    expect((input.element as HTMLInputElement).value).toBe("0");

    await user.keyboard("{End}");
    expect((input.element as HTMLInputElement).value).toBe("100");
  });

  it("snaps default keyboard page size to a step multiple (range 0-230, step 10)", async () => {
    const user = userEvent.setup();
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
    (input.element as HTMLInputElement).focus();

    await user.keyboard("{PageUp}");
    expect((input.element as HTMLInputElement).value).toBe("70");
    await user.keyboard("{PageDown}");
    expect((input.element as HTMLInputElement).value).toBe("50");
  });

  it("snaps default keyboard page size down when range-derived value is fractional", async () => {
    const user = userEvent.setup();
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
    (input.element as HTMLInputElement).focus();

    await user.keyboard("{PageUp}");
    expect((input.element as HTMLInputElement).value).toBe("62");
    await user.keyboard("{PageDown}");
    expect((input.element as HTMLInputElement).value).toBe("60");
  });

  it("snaps default keyboard page size up when range-derived value is fractional", async () => {
    const user = userEvent.setup();
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
    (input.element as HTMLInputElement).focus();

    await user.keyboard("{PageUp}");
    expect((input.element as HTMLInputElement).value).toBe("-36");
    await user.keyboard("{PageDown}");
    expect((input.element as HTMLInputElement).value).toBe("-40");
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
