import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import { describe, expect, it } from "vitest";
import { Provider } from "@vue-spectrum/provider";
import { RangeSlider } from "../src";

function createTheme() {
  return {
    global: { spectrum: "spectrum" },
    light: { "spectrum--light": "spectrum--light" },
    dark: { "spectrum--dark": "spectrum--dark" },
    medium: { "spectrum--medium": "spectrum--medium" },
    large: { "spectrum--large": "spectrum--large" },
  };
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
});
