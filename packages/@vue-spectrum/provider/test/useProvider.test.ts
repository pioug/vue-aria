import { mount } from "@vue/test-utils";
import { computed, defineComponent, h } from "vue";
import { describe, expect, it, vi } from "vitest";
import {
  provideSpectrumProvider,
  useSpectrumProvider,
  useSpectrumProviderDOMProps,
  useSpectrumProviderProps,
} from "../src";
import type { SpectrumTheme } from "../src";

const theme: SpectrumTheme = {
  global: { spectrum: "spectrum" },
  light: { "spectrum--light": "spectrum--light" },
  dark: { "spectrum--dark": "spectrum--dark" },
  medium: { "spectrum--medium": "spectrum--medium" },
  large: { "spectrum--large": "spectrum--large" },
};

const lightOnlyTheme: SpectrumTheme = {
  global: { spectrum: "spectrum" },
  light: { "spectrum--light": "spectrum--light" },
  medium: { "spectrum--medium": "spectrum--medium" },
};

describe("provideSpectrumProvider", () => {
  it("throws when no theme exists in root provider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const Broken = defineComponent({
      setup() {
        const context = provideSpectrumProvider();
        void context.value.theme;
        return () => h("div");
      },
    });

    expect(() => mount(Broken)).toThrowError(
      "theme not found, the parent provider must have a theme provided"
    );

    consoleError.mockRestore();
    consoleWarn.mockRestore();
  });

  it("inherits parent color scheme when nested provider does not override", () => {
    let outerScheme = "";
    let innerScheme = "";

    const Reader = defineComponent({
      setup() {
        innerScheme = useSpectrumProvider().value.colorScheme;
        return () => h("div");
      },
    });

    const Inner = defineComponent({
      setup() {
        provideSpectrumProvider();
        return () => h(Reader);
      },
    });

    const App = defineComponent({
      setup() {
        const context = provideSpectrumProvider({ theme, colorScheme: "dark" });
        outerScheme = context.value.colorScheme;
        return () => h(Inner);
      },
    });

    mount(App);

    expect(outerScheme).toBe("dark");
    expect(innerScheme).toBe("dark");
  });

  it(
    "will render an available color scheme automatically if the previous does not exist on the new theme",
    () => {
    let innerScheme = "";

    const Reader = defineComponent({
      setup() {
        innerScheme = useSpectrumProvider().value.colorScheme;
        return () => h("div");
      },
    });

    const Inner = defineComponent({
      setup() {
        provideSpectrumProvider({ theme: lightOnlyTheme });
        return () => h(Reader);
      },
    });

    const App = defineComponent({
      setup() {
        provideSpectrumProvider({ theme, colorScheme: "dark" });
        return () => h(Inner);
      },
    });

    mount(App);

    expect(innerScheme).toBe("light");
    }
  );

  it("Provider passes props to children", () => {
    let mergedProps: Record<string, unknown> = {};

    const Reader = defineComponent({
      setup() {
        mergedProps = useSpectrumProviderProps({ id: "child", isDisabled: false });
        return () => h("div");
      },
    });

    const App = defineComponent({
      setup() {
        provideSpectrumProvider({ theme, isReadOnly: true, isDisabled: true, isQuiet: true });
        return () => h(Reader);
      },
    });

    mount(App);

    expect(mergedProps).toMatchObject({
      id: "child",
      isDisabled: false,
      isReadOnly: true,
      isQuiet: true,
    });
  });

  it("Nested providers pass props to children", () => {
    let mergedProps: Record<string, unknown> = {};

    const Reader = defineComponent({
      setup() {
        mergedProps = useSpectrumProviderProps({ id: "child", isDisabled: false });
        return () => h("div");
      },
    });

    const Inner = defineComponent({
      setup() {
        provideSpectrumProvider({ isQuiet: true });
        return () => h(Reader);
      },
    });

    const App = defineComponent({
      setup() {
        provideSpectrumProvider({ theme, isReadOnly: true, isDisabled: true });
        return () => h(Inner);
      },
    });

    mount(App);

    expect(mergedProps).toMatchObject({
      id: "child",
      isDisabled: false,
      isReadOnly: true,
      isQuiet: true,
    });
  });

  it("returns provider DOM props with classes, locale and direction", () => {
    let domProps: ReturnType<typeof useSpectrumProviderDOMProps>["value"] | undefined;

    const Reader = defineComponent({
      setup() {
        domProps = useSpectrumProviderDOMProps({ UNSAFE_className: "custom-class" }).value;
        return () => h("div");
      },
    });

    const App = defineComponent({
      setup() {
        provideSpectrumProvider({
          theme,
          colorScheme: "dark",
          scale: "large",
          locale: "ar-EG",
        });

        return () => h(Reader);
      },
    });

    mount(App);

    expect(domProps?.class).toContain("custom-class");
    expect(domProps?.class).toContain("spectrum--dark");
    expect(domProps?.class).toContain("spectrum--large");
    expect(domProps?.lang).toBe("ar-EG");
    expect(domProps?.dir).toBe("rtl");
    expect(domProps?.style.colorScheme).toBe("dark");
  });

  it("tracks reactive provider updates", async () => {
    const Reader = defineComponent({
      props: {
        scheme: {
          type: String,
          required: true,
        },
      },
      setup(props) {
        const context = provideSpectrumProvider({
          theme,
          colorScheme: computed(() => props.scheme),
        });

        return () => h("div", { "data-scheme": context.value.colorScheme });
      },
    });

    const wrapper = mount(Reader, {
      props: {
        scheme: "light",
      },
    });

    expect(wrapper.get("div").attributes("data-scheme")).toBe("light");

    await wrapper.setProps({ scheme: "dark" });

    expect(wrapper.get("div").attributes("data-scheme")).toBe("dark");
  });
});

describe("useSpectrumProvider", () => {
  it("throws when called outside provider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const Broken = defineComponent({
      setup() {
        useSpectrumProvider();
        return () => h("div");
      },
    });

    expect(() => mount(Broken)).toThrowError(
      "No root provider found, please make sure your app is wrapped within a Spectrum provider context."
    );

    consoleError.mockRestore();
    consoleWarn.mockRestore();
  });
});
