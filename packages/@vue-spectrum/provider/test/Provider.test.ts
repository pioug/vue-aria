import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  Provider,
  useProvider,
} from "../src";
import type { SpectrumTheme } from "../src";

const theme: SpectrumTheme = {
  global: { spectrum: "spectrum" },
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

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Provider", () => {
  it("throws when no theme exists in root provider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(() =>
      mount(Provider, {
        slots: {
          default: () => h("div"),
        },
      })
    ).toThrowError("theme not found, the parent provider must have a theme provided");

    consoleError.mockRestore();
    consoleWarn.mockRestore();
  });

  it("uses OS dark mode by default", () => {
    installMatchMediaStub(["(prefers-color-scheme: dark)"]);

    const wrapper = mount(Provider, {
      props: {
        theme,
      },
      slots: {
        default: () => h("div", "hello"),
      },
    });

    expect(wrapper.get("div").classes()).toContain("spectrum--dark");
  });

  it("supports explicit color scheme overrides", () => {
    installMatchMediaStub(["(prefers-color-scheme: dark)"]);

    const wrapper = mount(Provider, {
      props: {
        theme,
        colorScheme: "light",
      },
      slots: {
        default: () => h("div", "hello"),
      },
    });

    expect(wrapper.get("div").classes()).toContain("spectrum--light");
  });

  it("returns provider DOM attributes, classes, locale and direction", () => {
    const wrapper = mount(Provider, {
      props: {
        theme,
        colorScheme: "dark",
        scale: "large",
        locale: "ar-EG",
        UNSAFE_className: "custom-provider",
        UNSAFE_style: {
          padding: "8px",
        },
      },
      slots: {
        default: () => h("div", "hello"),
      },
    });

    const provider = wrapper.get("div");
    expect(provider.classes()).toContain("custom-provider");
    expect(provider.classes()).toContain("spectrum--dark");
    expect(provider.classes()).toContain("spectrum--large");
    expect(provider.attributes("lang")).toBe("ar-EG");
    expect(provider.attributes("dir")).toBe("rtl");
    expect(provider.attributes("style")).toContain("color-scheme: dark");
    expect(provider.attributes("style")).toContain("padding: 8px");
  });

  it("inherits nearest ancestor values without adding an extra DOM wrapper", () => {
    let innerColorScheme = "";

    const Reader = defineComponent({
      name: "ProviderReader",
      setup() {
        innerColorScheme = useProvider().value.colorScheme;
        return () => h("span", { "data-testid": "inner" }, "inner");
      },
    });

    const App = defineComponent({
      name: "NestedProviderApp",
      setup() {
        return () =>
          h(Provider, { theme, colorScheme: "dark" }, {
            default: () =>
              h(Provider, null, {
                default: () => h(Reader),
              }),
          });
      },
    });

    const wrapper = mount(App);

    expect(innerColorScheme).toBe("dark");
    expect(wrapper.findAll(".spectrum")).toHaveLength(1);
  });

  it("renders a nested wrapper when nested provider changes visual context", () => {
    const App = defineComponent({
      name: "OverrideProviderApp",
      setup() {
        return () =>
          h(Provider, { theme, colorScheme: "dark" }, {
            default: () =>
              h(Provider, { colorScheme: "light" }, {
                default: () => h("span", "inner"),
              }),
          });
      },
    });

    const wrapper = mount(App);
    const wrappers = wrapper.findAll(".spectrum");

    expect(wrappers).toHaveLength(2);
    expect(wrappers[0].classes()).toContain("spectrum--dark");
    expect(wrappers[1].classes()).toContain("spectrum--light");
  });

  it("tracks reactive color scheme prop updates", async () => {
    const wrapper = mount(Provider, {
      props: {
        theme,
        colorScheme: "light",
      },
      slots: {
        default: () => h("div", "hello"),
      },
    });

    expect(wrapper.get("div").classes()).toContain("spectrum--light");

    await wrapper.setProps({ colorScheme: "dark" });

    expect(wrapper.get("div").classes()).toContain("spectrum--dark");
  });
});
