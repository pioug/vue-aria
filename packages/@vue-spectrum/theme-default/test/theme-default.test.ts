import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { describe, expect, it } from "vitest";
import {
  provideSpectrumProvider,
  useSpectrumProviderDOMProps,
  type SpectrumTheme,
} from "@vue-spectrum/provider";
import { theme } from "../src";

describe("@vue-spectrum/theme-default", () => {
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

  it("integrates with provider DOM class resolution", () => {
    let className = "";

    const Reader = defineComponent({
      name: "ThemeDefaultReader",
      setup() {
        provideSpectrumProvider({
          theme,
          colorScheme: "dark",
          scale: "large",
        });

        className = useSpectrumProviderDOMProps().value.class ?? "";
        return () => h("div");
      },
    });

    mount(Reader);

    expect(className).toContain("spectrum");
    expect(className).toContain("spectrum--dark");
    expect(className).toContain("spectrum--large");
  });
});
