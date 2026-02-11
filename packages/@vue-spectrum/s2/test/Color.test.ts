import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import {
  ColorArea,
  ColorSlider,
  ColorSwatch,
  ColorSwatchPicker,
  ColorWheel,
} from "../src/Color";
import { Provider } from "../src/Provider";

describe("@vue-spectrum/s2 Color wrappers", () => {
  it("renders baseline classes for color primitives", async () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h("div", null, [
            h(ColorArea, { value: "#ff0000" }),
            h(ColorSlider, { label: "Hue", channel: "hue", defaultValue: 10 }),
            h(ColorSwatch, { color: "#00ff00" }),
            h(ColorSwatchPicker, {
              items: [
                { key: "red", color: "#f00" },
                { key: "green", color: "#0f0" },
              ],
              defaultSelectedKey: "red",
            }),
            h(ColorWheel, { value: "#ff0000" }),
          ]),
      },
    });

    await wrapper.vm.$nextTick();

    wrapper.get(".s2-ColorArea");
    wrapper.get(".s2-ColorSlider");
    wrapper.get(".s2-ColorSwatch");
    wrapper.get(".s2-ColorSwatchPicker");
    wrapper.get(".s2-ColorWheel");
  });

  it("forwards change callbacks for slider and wheel", async () => {
    const onSliderChange = vi.fn();
    const onWheelChange = vi.fn();
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h("div", null, [
            h(ColorSlider, {
              label: "Hue",
              channel: "hue",
              defaultValue: 10,
              onChange: onSliderChange,
            }),
            h(ColorWheel, {
              value: "#ff0000",
              onChange: onWheelChange,
            }),
          ]),
      },
    });

    await wrapper.vm.$nextTick();
    const ranges = wrapper.findAll('input[type="range"]');
    await ranges[0]?.setValue("30");
    await ranges[1]?.setValue("240");

    expect(onSliderChange).toHaveBeenCalled();
    expect(onWheelChange).toHaveBeenCalled();
  });

  it("forwards selection change callbacks for swatch picker", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(ColorSwatchPicker, {
            items: [
              { key: "red", color: "#f00" },
              { key: "green", color: "#0f0" },
            ],
            defaultSelectedKey: "red",
            onSelectionChange,
          }),
      },
    });

    await wrapper.vm.$nextTick();
    const options = wrapper.findAll('[role="option"]');
    await options[1]?.trigger("click");

    expect(onSelectionChange).toHaveBeenCalledWith("green");
  });
});
