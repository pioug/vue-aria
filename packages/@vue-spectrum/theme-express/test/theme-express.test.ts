import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { describe, expect, it } from "vitest";
import {
  provideSpectrumProvider,
  useSpectrumProviderDOMProps,
  type SpectrumTheme,
} from "@vue-spectrum/provider";
import { theme } from "../src";

describe("@vue-spectrum/theme-express", () => {
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

  it("adds express classes on top of the default baseline", () => {
    let mediumClassName = "";
    let largeClassName = "";

    const MediumReader = defineComponent({
      name: "ThemeExpressMediumReader",
      setup() {
        provideSpectrumProvider({
          theme,
          colorScheme: "light",
          scale: "medium",
        });

        mediumClassName = useSpectrumProviderDOMProps().value.class ?? "";
        return () => h("div");
      },
    });

    const LargeReader = defineComponent({
      name: "ThemeExpressLargeReader",
      setup() {
        provideSpectrumProvider({
          theme,
          colorScheme: "dark",
          scale: "large",
        });

        largeClassName = useSpectrumProviderDOMProps().value.class ?? "";
        return () => h("div");
      },
    });

    mount(MediumReader);
    mount(LargeReader);

    expect(mediumClassName).toContain("spectrum");
    expect(mediumClassName).toContain("spectrum--express");
    expect(mediumClassName).toContain("spectrum--express-medium");
    expect(mediumClassName).toContain("spectrum--medium");

    expect(largeClassName).toContain("spectrum");
    expect(largeClassName).toContain("spectrum--express");
    expect(largeClassName).toContain("spectrum--express-large");
    expect(largeClassName).toContain("spectrum--large");
  });
});
