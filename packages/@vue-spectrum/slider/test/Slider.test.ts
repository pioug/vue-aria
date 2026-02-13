import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, h, ref } from "vue";
import { Slider } from "../src";

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
});
