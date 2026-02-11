import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { describe, expect, it } from "vitest";
import {
  provideSpectrumProvider,
  useSpectrumProviderDOMProps,
  type SpectrumTheme,
} from "@vue-spectrum/provider";
import { theme } from "../src";

describe("@vue-spectrum/theme-dark", () => {
  it("exports the baseline theme sections", () => {
    const keys: Array<keyof SpectrumTheme> = [
      "global",
      "light",
      "dark",
      "medium",
      "large",
    ];

    for (const key of keys) {
      expect(theme[key]).toBeDefined();
      expect(Object.keys(theme[key] ?? {})).not.toHaveLength(0);
    }
  });

  it("supports dark-first provider class resolution", () => {
    let lightClassName = "";
    let darkClassName = "";

    const LightReader = defineComponent({
      name: "ThemeDarkLightReader",
      setup() {
        provideSpectrumProvider({
          theme,
          colorScheme: "light",
          scale: "medium",
        });

        lightClassName = useSpectrumProviderDOMProps().value.class ?? "";
        return () => h("div");
      },
    });

    const DarkReader = defineComponent({
      name: "ThemeDarkReader",
      setup() {
        provideSpectrumProvider({
          theme,
          colorScheme: "dark",
          scale: "large",
        });

        darkClassName = useSpectrumProviderDOMProps().value.class ?? "";
        return () => h("div");
      },
    });

    mount(LightReader);
    mount(DarkReader);

    expect(lightClassName).toContain("spectrum");
    expect(lightClassName).toContain("spectrum--dark");
    expect(lightClassName).toContain("spectrum--medium");

    expect(darkClassName).toContain("spectrum");
    expect(darkClassName).toContain("spectrum--darkest");
    expect(darkClassName).toContain("spectrum--large");
  });
});
