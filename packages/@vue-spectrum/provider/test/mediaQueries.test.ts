import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useColorScheme } from "../src";
import type { SpectrumTheme } from "../src";

const theme: SpectrumTheme = {
  global: {},
  light: { "spectrum--light": "spectrum--light" },
  dark: { "spectrum--dark": "spectrum--dark" },
  medium: { "spectrum--medium": "spectrum--medium" },
  large: { "spectrum--large": "spectrum--large" },
};

function installMatchMediaStub(activeQueries: string[] = []): void {
  const querySet = new Set(activeQueries);

  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: querySet.has(query),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
}

function readColorScheme(defaultColorScheme: "light" | "dark"): string {
  let colorScheme = "";

  const App = defineComponent({
    setup() {
      colorScheme = useColorScheme(theme, defaultColorScheme).value;
      return () => h("div");
    },
  });

  mount(App);

  return colorScheme;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useColorScheme", () => {
  it("uses OS as default - dark", () => {
    installMatchMediaStub(["(prefers-color-scheme: dark)"]);
    expect(readColorScheme("light")).toBe("dark");
  });

  it("uses OS as default - light", () => {
    installMatchMediaStub(["(prefers-color-scheme: light)"]);
    expect(readColorScheme("dark")).toBe("light");
  });

  it("uses default light if OS is not useable", () => {
    installMatchMediaStub();
    expect(readColorScheme("light")).toBe("light");
  });

  it("uses default dark if OS is not useable", () => {
    installMatchMediaStub();
    expect(readColorScheme("dark")).toBe("dark");
  });
});
