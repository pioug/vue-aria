import { mount } from "@vue/test-utils";
import { computed, defineComponent, h, nextTick, watch } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  Provider,
  useProvider,
} from "../src";
import type { SpectrumTheme } from "../src";
import { useMatchedBreakpoints } from "@vue-spectrum/utils";

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

function installMutableMatchMediaStub(initial: Record<string, boolean>) {
  const state = new Map<string, boolean>(Object.entries(initial));
  const listeners = new Map<string, Set<(event: MediaQueryListEvent) => void>>();

  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => {
      if (!listeners.has(query)) {
        listeners.set(query, new Set());
      }

      const queryListeners = listeners.get(query)!;
      return {
        get matches() {
          return Boolean(state.get(query));
        },
        media: query,
        onchange: null,
        addListener: (listener: (event: MediaQueryListEvent) => void) => {
          queryListeners.add(listener);
        },
        removeListener: (listener: (event: MediaQueryListEvent) => void) => {
          queryListeners.delete(listener);
        },
        addEventListener: (_type: "change", listener: (event: MediaQueryListEvent) => void) => {
          queryListeners.add(listener);
        },
        removeEventListener: (
          _type: "change",
          listener: (event: MediaQueryListEvent) => void
        ) => {
          queryListeners.delete(listener);
        },
        dispatchEvent: vi.fn(),
      };
    })
  );

  return {
    setQueryMatch(query: string, matches: boolean): void {
      state.set(query, matches);
      const event = {
        matches,
        media: query,
      } as MediaQueryListEvent;
      for (const listener of listeners.get(query) ?? []) {
        listener(event);
      }
    },
  };
}

function installViewportMatchMedia(initialWidth = 800) {
  let width = initialWidth;

  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => {
      const match = /\(min-width:\s*(\d+)px\)/.exec(query);
      const minWidth = match ? Number(match[1]) : Number.POSITIVE_INFINITY;

      return {
        matches: width >= minWidth,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    })
  );

  return {
    setWidth(nextWidth: number): void {
      width = nextWidth;
    },
  };
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

  it("Uses OS theme by default - dark", () => {
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

  it("Uses OS theme by default - light", () => {
    installMatchMediaStub(["(prefers-color-scheme: light)"]);

    const wrapper = mount(Provider, {
      props: {
        theme,
      },
      slots: {
        default: () => h("div", "hello"),
      },
    });

    expect(wrapper.get("div").classes()).toContain("spectrum--light");
  });

  it("Can be set to dark regardless of OS setting", () => {
    installMatchMediaStub(["(prefers-color-scheme: light)"]);

    const wrapper = mount(Provider, {
      props: {
        theme,
        colorScheme: "dark",
      },
      slots: {
        default: () => h("div", "hello"),
      },
    });

    expect(wrapper.get("div").classes()).toContain("spectrum--dark");
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

  it("Nested providers follow their ancestors by default, not the OS", () => {
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

  it("Nested providers can be explicitly set to something else", () => {
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

  it("Nested providers can update to follow their ancestors", async () => {
    const Nested = defineComponent({
      name: "NestedProvider",
      props: {
        scheme: {
          type: String,
          required: true,
        },
      },
      setup(localProps) {
        return () =>
          h(Provider, { theme, colorScheme: localProps.scheme }, {
            default: () =>
              h(Provider, null, {
                default: () => h("span", "inner"),
              }),
          });
      },
    });

    const wrapper = mount(Nested, {
      props: {
        scheme: "dark",
      },
    });

    let wrappers = wrapper.findAll(".spectrum");
    expect(wrappers).toHaveLength(1);
    expect(wrappers[0].classes()).toContain("spectrum--dark");

    await wrapper.setProps({ scheme: "light" });

    wrappers = wrapper.findAll(".spectrum");
    expect(wrappers).toHaveLength(1);
    expect(wrappers[0].classes()).toContain("spectrum--light");
  });

  it("warns once when nested providers have conflicting directions", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    mount(Provider, {
      props: {
        theme,
        locale: "en-US",
      },
      slots: {
        default: () =>
          h(Provider, { locale: "ar-EG" }, {
            default: () => h("div", "hello"),
          }),
      },
    });

    await nextTick();

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      "Language directions cannot be nested. rtl inside ltr."
    );

    warnSpy.mockRestore();
  });

  it("Provider will rerender if the OS preferred changes and it is on auto", async () => {
    const media = installMutableMatchMediaStub({
      "(prefers-color-scheme: dark)": false,
      "(prefers-color-scheme: light)": true,
    });

    const wrapper = mount(Provider, {
      props: {
        theme,
      },
      slots: {
        default: () => h("div", "hello"),
      },
    });

    expect(wrapper.get("div").classes()).toContain("spectrum--light");

    media.setQueryMatch("(prefers-color-scheme: light)", false);
    media.setQueryMatch("(prefers-color-scheme: dark)", true);
    await nextTick();
    await nextTick();

    expect(wrapper.get("div").classes()).toContain("spectrum--dark");
  });

  it("only renders once for multiple resizes in the same range", async () => {
    const viewport = installViewportMatchMedia(768);
    const onBreakpointChange = vi.fn();

    const App = defineComponent({
      name: "ProviderBreakpointHarness",
      setup() {
        const matchedBreakpoints = useMatchedBreakpoints({
          S: 640,
          M: 768,
          L: 1024,
        });
        const breakpoint = computed(() => matchedBreakpoints.value[0] ?? "base");

        watch(
          breakpoint,
          (nextBreakpoint, previousBreakpoint) => {
            if (nextBreakpoint !== previousBreakpoint) {
              onBreakpointChange(nextBreakpoint);
            }
          },
          { immediate: true }
        );

        return () =>
          h(
            Provider,
            {
              theme,
            },
            {
              default: () => h("button", "push me"),
            }
          );
      },
    });

    mount(App);
    expect(onBreakpointChange).toHaveBeenCalledTimes(1);
    expect(onBreakpointChange).toHaveBeenNthCalledWith(1, "M");

    viewport.setWidth(1024);
    window.dispatchEvent(new Event("resize"));
    await nextTick();

    expect(onBreakpointChange).toHaveBeenCalledTimes(2);
    expect(onBreakpointChange).toHaveBeenNthCalledWith(2, "L");

    window.dispatchEvent(new Event("resize"));
    await nextTick();

    expect(onBreakpointChange).toHaveBeenCalledTimes(2);
  });
});
