import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { RangeSlider } from "../src/Slider";

describe("@vue-spectrum/s2 RangeSlider", () => {
  it("renders baseline attrs and range values", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(RangeSlider, {
            label: "Range",
            defaultValue: {
              start: 20,
              end: 40,
            },
            size: "L",
          }),
      },
    });

    const root = wrapper.get(".s2-RangeSlider");
    expect(root.classes()).toContain("s2-RangeSlider--L");

    const inputs = wrapper.findAll('input[type="range"]');
    expect(inputs.length).toBe(2);
    expect((inputs[0]?.element as HTMLInputElement).value).toBe("20");
    expect((inputs[1]?.element as HTMLInputElement).value).toBe("40");
  });

  it("emits range value changes", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(RangeSlider, {
            label: "Range",
            defaultValue: {
              start: 20,
              end: 40,
            },
            onChange,
          }),
      },
    });

    const inputs = wrapper.findAll('input[type="range"]');
    await inputs[0]?.setValue("30");

    expect(onChange).toHaveBeenCalled();
    const range = onChange.mock.calls.at(-1)?.[0];
    expect(range?.start).toBe(30);
  });
});
