import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { Divider } from "../src/Divider";

describe("@vue-spectrum/s2 Divider", () => {
  it("renders vertical divider attrs", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(Divider, {
            orientation: "vertical",
            size: "S",
          }),
      },
    });

    const divider = wrapper.get(".s2-Divider");
    expect(divider.element.tagName).toBe("DIV");
    expect(divider.attributes("role")).toBe("separator");
    expect(divider.classes()).toContain("spectrum-Rule--vertical");
    expect(divider.classes()).toContain("spectrum-Rule--small");
  });

  it("renders horizontal divider by default", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () => h(Divider),
      },
    });

    const divider = wrapper.get(".s2-Divider");
    expect(divider.element.tagName).toBe("HR");
    expect(divider.classes()).toContain("spectrum-Rule--horizontal");
  });
});
