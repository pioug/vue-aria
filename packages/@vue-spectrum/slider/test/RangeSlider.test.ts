import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, h, ref } from "vue";
import { I18nProvider } from "@vue-aria/i18n";
import { RangeSlider } from "../src";

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
