import { theme as themeDark } from "@vue-spectrum/theme-default-dark";
import { theme as themeExpress } from "@vue-spectrum/theme-default-express";
import { theme as themeLight } from "@vue-spectrum/theme-default-light";
import { createApp, defineComponent, h } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Provider } from "../src/Provider";

const mediaQueryLight = "(prefers-color-scheme: light)";
const mediaQueryDark = "(prefers-color-scheme: dark)";
const mediaQueryAnyPointerFine = "(any-pointer: fine)";

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

function mount(component: unknown) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const app = createApp(component as Parameters<typeof createApp>[0]);
  app.mount(container);
  return {
    container,
    unmount() {
      app.unmount();
      container.remove();
    },
  };
}

describe("Provider theme variants", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("supports theme-light variant classes", () => {
    mockMatchMedia(new Set([mediaQueryDark]));
    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme: themeLight,
                "data-testid": "provider",
              },
              () => h("div", "hello")
            );
        },
      })
    );

    const provider = container.querySelector('[data-testid="provider"]') as HTMLElement | null;
    expect(provider?.classList.contains("spectrum--darkest")).toBe(true);
    unmount();
  });

  it("supports theme-dark variant classes", () => {
    mockMatchMedia(new Set([mediaQueryLight]));
    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme: themeDark,
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

  it("supports theme-express variant classes", () => {
    mockMatchMedia(new Set([mediaQueryLight, mediaQueryAnyPointerFine]));
    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme: themeExpress,
                "data-testid": "provider",
              },
              () => h("div", "hello")
            );
        },
      })
    );

    const provider = container.querySelector('[data-testid="provider"]') as HTMLElement | null;
    expect(provider?.classList.contains("express")).toBe(true);
    expect(provider?.classList.contains("medium")).toBe(true);
    unmount();
  });
});
