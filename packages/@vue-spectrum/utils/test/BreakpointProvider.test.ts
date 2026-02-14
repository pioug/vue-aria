import { createApp, computed, defineComponent, h, nextTick, ref, watchEffect } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BreakpointProvider, useBreakpoint, useMatchedBreakpoints } from "../src/BreakpointProvider";

type MatchMediaChangeListener = (event: MediaQueryListEvent) => void;

interface MockMediaQueryList {
  media: string;
  matches: boolean;
  onchange: MatchMediaChangeListener | null;
  addListener: (listener: MatchMediaChangeListener) => void;
  removeListener: (listener: MatchMediaChangeListener) => void;
  addEventListener: (type: string, listener: MatchMediaChangeListener) => void;
  removeEventListener: (type: string, listener: MatchMediaChangeListener) => void;
  dispatchEvent: (event: Event) => boolean;
}

function createMatchMediaController(initialActiveQueries: Set<string>) {
  let activeQueries = new Set(initialActiveQueries);
  const lists = new Map<string, MockMediaQueryList>();
  const listeners = new Map<string, Set<MatchMediaChangeListener>>();

  const getListeners = (query: string) => {
    let set = listeners.get(query);
    if (!set) {
      set = new Set();
      listeners.set(query, set);
    }
    return set;
  };

  const matchMedia = vi.fn().mockImplementation((query: string): MockMediaQueryList => {
    const existing = lists.get(query);
    if (existing) {
      return existing;
    }

    const list: MockMediaQueryList = {
      media: query,
      matches: activeQueries.has(query),
      onchange: null,
      addListener: (listener) => {
        getListeners(query).add(listener);
      },
      removeListener: (listener) => {
        getListeners(query).delete(listener);
      },
      addEventListener: (type, listener) => {
        if (type === "change") {
          getListeners(query).add(listener);
        }
      },
      removeEventListener: (type, listener) => {
        if (type === "change") {
          getListeners(query).delete(listener);
        }
      },
      dispatchEvent: () => true,
    };
    lists.set(query, list);
    return list;
  });

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: matchMedia,
  });

  return {
    setActiveQueries(nextQueries: Set<string>) {
      activeQueries = new Set(nextQueries);
      for (const [query, list] of lists) {
        list.matches = activeQueries.has(query);
      }
    },
  };
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

describe("BreakpointProvider", () => {
  let matchMediaController: ReturnType<typeof createMatchMediaController>;

  beforeEach(() => {
    matchMediaController = createMatchMediaController(new Set());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("computes matched breakpoints and only updates when the range changes", async () => {
    matchMediaController.setActiveQueries(new Set(["(min-width: 768px)"]));
    const changes: string[] = [];

    const Probe = defineComponent({
      name: "BreakpointProbe",
      setup() {
        const matchedBreakpoints = useMatchedBreakpoints({ S: 640, M: 768, L: 1024 });
        const current = computed(() => matchedBreakpoints.value[0] ?? "base");
        const previous = ref<string | null>(null);

        watchEffect(() => {
          if (current.value !== previous.value) {
            changes.push(current.value);
            previous.value = current.value;
          }
        });

        return () => h("div", { "data-testid": "probe", "data-current": current.value });
      },
    });

    const { container, unmount } = mount(Probe);
    const probe = container.querySelector('[data-testid="probe"]') as HTMLElement | null;
    expect(probe?.dataset.current).toBe("M");
    expect(changes).toEqual(["M"]);

    matchMediaController.setActiveQueries(new Set(["(min-width: 1024px)"]));
    window.dispatchEvent(new Event("resize"));
    await nextTick();

    expect(probe?.dataset.current).toBe("L");
    expect(changes).toEqual(["M", "L"]);

    window.dispatchEvent(new Event("resize"));
    await nextTick();
    expect(changes).toEqual(["M", "L"]);

    unmount();
  });

  it("exposes matched breakpoints through context", () => {
    const Probe = defineComponent({
      name: "ContextProbe",
      setup() {
        const context = useBreakpoint();
        return () =>
          h("div", {
            "data-testid": "probe",
            "data-breakpoints": context ? context.value.matchedBreakpoints.join(",") : "none",
          });
      },
    });

    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(BreakpointProvider, { matchedBreakpoints: ["L", "base"] }, () => h(Probe));
        },
      })
    );

    const probe = container.querySelector('[data-testid="probe"]') as HTMLElement | null;
    expect(probe?.dataset.breakpoints).toBe("L,base");
    unmount();
  });
});
