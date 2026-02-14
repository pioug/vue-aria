import { createApp, defineComponent, h } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Provider, useProviderProps } from "../src/Provider";
import type { Theme } from "../src/types";

const theme: Theme = {
  global: {},
  light: { "spectrum--light": "spectrum--light" },
  dark: { "spectrum--dark": "spectrum--dark" },
  medium: { "spectrum--medium": "spectrum--medium" },
  large: { "spectrum--large": "spectrum--large" },
};

const mediaQueryLight = "(prefers-color-scheme: light)";
const mediaQueryDark = "(prefers-color-scheme: dark)";

function mockMatchMedia(activeQueries: Set<string>) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: activeQueries.has(query),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function mount(component: any) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const app = createApp(component);
  app.mount(container);
  return {
    container,
    unmount() {
      app.unmount();
      container.remove();
    },
  };
}

describe("Provider", () => {
  beforeEach(() => {
    mockMatchMedia(new Set());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("uses OS theme by default - dark", () => {
    mockMatchMedia(new Set([mediaQueryDark]));

    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme,
                "data-testid": "provider",
              },
              () => h("div", "hello")
            );
        },
      })
    );

    const provider = container.querySelector('[data-testid="provider"]') as HTMLElement | null;
    expect(provider).not.toBeNull();
    expect(provider?.classList.contains("spectrum--dark")).toBe(true);
    unmount();
  });

  it("can be set to dark regardless of OS setting", () => {
    mockMatchMedia(new Set([mediaQueryLight]));

    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme,
                colorScheme: "dark",
                "data-testid": "provider",
              },
              () => h("div", "hello")
            );
        },
      })
    );

    const provider = container.querySelector('[data-testid="provider"]') as HTMLElement | null;
    expect(provider?.classList.contains("spectrum--dark")).toBe(true);
    unmount();
  });

  it("nested providers follow their ancestors by default", () => {
    mockMatchMedia(new Set([mediaQueryLight]));

    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme,
                colorScheme: "dark",
                "data-testid": "provider-1",
              },
              () =>
                h(
                  Provider,
                  {
                    "data-testid": "provider-2",
                  },
                  () => h("div", "hello")
                )
            );
        },
      })
    );

    const provider1 = container.querySelector('[data-testid="provider-1"]') as HTMLElement | null;
    const provider2 = container.querySelector('[data-testid="provider-2"]') as HTMLElement | null;
    expect(provider1?.classList.contains("spectrum--dark")).toBe(true);
    expect(provider2?.classList.contains("spectrum--dark")).toBe(true);
    unmount();
  });

  it("nested providers can be explicitly set to something else", () => {
    mockMatchMedia(new Set([mediaQueryLight]));

    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme,
                colorScheme: "dark",
                "data-testid": "provider-1",
              },
              () =>
                h(
                  Provider,
                  {
                    colorScheme: "light",
                    "data-testid": "provider-2",
                  },
                  () => h("div", "hello")
                )
            );
        },
      })
    );

    const provider1 = container.querySelector('[data-testid="provider-1"]') as HTMLElement | null;
    const provider2 = container.querySelector('[data-testid="provider-2"]') as HTMLElement | null;
    expect(provider1?.classList.contains("spectrum--dark")).toBe(true);
    expect(provider2?.classList.contains("spectrum--light")).toBe(true);
    unmount();
  });

  it("passes inherited provider props via useProviderProps", () => {
    const Probe = defineComponent({
      name: "Probe",
      setup() {
        const merged = useProviderProps({});

        return () =>
          h("div", {
            "data-testid": "probe",
            "data-readonly": String((merged as { isReadOnly?: boolean }).isReadOnly),
          });
      },
    });

    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme,
                isReadOnly: true,
              },
              () => h(Probe)
            );
        },
      })
    );

    const probe = container.querySelector('[data-testid="probe"]') as HTMLElement | null;
    expect(probe?.dataset.readonly).toBe("true");
    unmount();
  });

  it("throws when no theme is provided and no parent provider exists", () => {
    expect(() =>
      mount(
        defineComponent({
          setup() {
            return () => h(Provider, {}, () => h("div", "hello"));
          },
        })
      )
    ).toThrowError("theme not found");
  });
});
