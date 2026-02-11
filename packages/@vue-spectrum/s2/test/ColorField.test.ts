import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { ColorField } from "../src/ColorField";

describe("@vue-spectrum/s2 ColorField", () => {
  it("renders baseline attrs", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(ColorField, {
            label: "Color",
            defaultValue: "#ff0000",
            size: "S",
          }),
      },
    });

    const root = wrapper.get(".s2-ColorField");
    expect(root.classes()).toContain("s2-ColorField--S");

    const input = wrapper.get("input");
    expect(input.element).toBeInstanceOf(HTMLInputElement);
    expect((input.element as HTMLInputElement).value).toBe("#FF0000");
  });

  it("commits color changes on blur", async () => {
    const onChange = vi.fn();

    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(ColorField, {
            label: "Color",
            defaultValue: "#00ff00",
            onChange,
          }),
      },
    });

    const input = wrapper.get("input");
    await input.setValue("#112233");
    await input.trigger("blur");

    expect(onChange).toHaveBeenCalledWith("#112233");
  });
});
