import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { describe, expect, it } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { useProvider } from "@vue-spectrum/provider";
import { Provider } from "../src/Provider";

describe("@vue-spectrum/s2 Provider", () => {
  it("renders provider classes and custom element type", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
        colorScheme: "dark",
        scale: "large",
        background: "layer-1",
        elementType: "section",
      },
      slots: {
        default: () => h("div", "content"),
      },
    });

    expect(wrapper.element.tagName).toBe("SECTION");
    expect(wrapper.classes()).toContain("s2-Provider");
    expect(wrapper.attributes("data-s2-background")).toBe("layer-1");
    expect(wrapper.attributes("lang")).toBe("en-US");
    expect(wrapper.attributes("dir")).toBe("ltr");
    expect(wrapper.attributes("class")).toContain("spectrum--dark");
    expect(wrapper.attributes("class")).toContain("spectrum--large");
  });

  it("provides provider context to children", () => {
    let snapshot: { colorScheme: string; scale: string } | null = null;
    const Reader = defineComponent({
      name: "S2ProviderReader",
      setup() {
        const provider = useProvider();
        snapshot = {
          colorScheme: provider.value.colorScheme,
          scale: provider.value.scale,
        };
        return () => h("div");
      },
    });

    mount(Provider, {
      props: {
        theme: defaultTheme,
        colorScheme: "light",
        scale: "medium",
      },
      slots: {
        default: () => h(Reader),
      },
    });

    expect(snapshot).toEqual({
      colorScheme: "light",
      scale: "medium",
    });
  });
});
