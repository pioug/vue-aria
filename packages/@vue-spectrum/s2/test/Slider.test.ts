import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { Slider } from "../src/Slider";

describe("@vue-spectrum/s2 Slider", () => {
  it("renders baseline attrs", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(Slider, {
            label: "Volume",
            defaultValue: 20,
            size: "S",
          }),
      },
    });

    const root = wrapper.get(".s2-Slider");
    expect(root.classes()).toContain("s2-Slider--S");
    const input = wrapper.get('input[type="range"]');
    expect((input.element as HTMLInputElement).value).toBe("20");
  });

  it("emits value changes", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(Slider, {
            label: "Volume",
            defaultValue: 20,
            onChange,
          }),
      },
    });

    const input = wrapper.get('input[type="range"]');
    await input.setValue("45");
    expect(onChange).toHaveBeenCalledWith(45);
  });
});
