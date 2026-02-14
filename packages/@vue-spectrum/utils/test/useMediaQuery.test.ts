import { createApp, defineComponent, h, nextTick } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useMediaQuery } from "../src/useMediaQuery";

interface MockMediaQueryList {
  media: string;
  matches: boolean;
  onchange: ((event: MediaQueryListEvent) => void) | null;
  addListener: (listener: (event: MediaQueryListEvent) => void) => void;
  removeListener: (listener: (event: MediaQueryListEvent) => void) => void;
  addEventListener: (type: string, listener: (event: MediaQueryListEvent) => void) => void;
  removeEventListener: (type: string, listener: (event: MediaQueryListEvent) => void) => void;
  dispatchEvent: (event: Event) => boolean;
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

describe("useMediaQuery", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("returns false when matchMedia is unsupported", () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: undefined,
    });

    const Probe = defineComponent({
      setup() {
        const matches = useMediaQuery("(min-width: 1024px)");
        return () =>
          h("div", {
            "data-testid": "probe",
            "data-matches": String(matches.value),
          });
      },
    });

    const { container, unmount } = mount(Probe);
    const probe = container.querySelector('[data-testid="probe"]') as HTMLElement | null;
    expect(probe?.dataset.matches).toBe("false");
    unmount();
  });

  it("updates when media query match state changes", async () => {
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    const mediaQueryList: MockMediaQueryList = {
      media: "(min-width: 1024px)",
      matches: false,
      onchange: null,
      addListener: (listener) => {
        listeners.add(listener);
      },
      removeListener: (listener) => {
        listeners.delete(listener);
      },
      addEventListener: (type, listener) => {
        if (type === "change") {
          listeners.add(listener);
        }
      },
      removeEventListener: (type, listener) => {
        if (type === "change") {
          listeners.delete(listener);
        }
      },
      dispatchEvent: () => true,
    };

    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: vi.fn().mockImplementation(() => mediaQueryList),
    });

    const Probe = defineComponent({
      setup() {
        const matches = useMediaQuery("(min-width: 1024px)");
        return () =>
          h("div", {
            "data-testid": "probe",
            "data-matches": String(matches.value),
          });
      },
    });

    const { container, unmount } = mount(Probe);
    const probe = container.querySelector('[data-testid="probe"]') as HTMLElement | null;
    expect(probe?.dataset.matches).toBe("false");

    mediaQueryList.matches = true;
    const event = { matches: true, media: mediaQueryList.media } as MediaQueryListEvent;
    for (const listener of listeners) {
      listener(event);
    }
    mediaQueryList.onchange?.(event);
    await nextTick();

    expect(probe?.dataset.matches).toBe("true");
    unmount();
  });
});
