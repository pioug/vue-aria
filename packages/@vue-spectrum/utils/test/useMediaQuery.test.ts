import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { provideSSR } from "@vue-aria/ssr";
import { useMediaQuery } from "../src";

interface QueryRecord {
  matches: boolean;
  listeners: Set<(event: MediaQueryListEvent) => void>;
}

function installMatchMediaStub(initialMatches: Record<string, boolean> = {}) {
  const records = new Map<string, QueryRecord>();

  const getRecord = (query: string): QueryRecord => {
    let record = records.get(query);
    if (!record) {
      record = {
        matches: initialMatches[query] ?? false,
        listeners: new Set(),
      };
      records.set(query, record);
    }
    return record;
  };

  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => {
      const record = getRecord(query);
      return {
        get matches() {
          return record.matches;
        },
        media: query,
        onchange: null,
        addListener: (listener: (event: MediaQueryListEvent) => void) => {
          record.listeners.add(listener);
        },
        removeListener: (listener: (event: MediaQueryListEvent) => void) => {
          record.listeners.delete(listener);
        },
        addEventListener: (
          type: "change",
          listener: (event: MediaQueryListEvent) => void
        ) => {
          if (type === "change") {
            record.listeners.add(listener);
          }
        },
        removeEventListener: (
          type: "change",
          listener: (event: MediaQueryListEvent) => void
        ) => {
          if (type === "change") {
            record.listeners.delete(listener);
          }
        },
        dispatchEvent: vi.fn(),
      };
    })
  );

  return {
    setMatch(query: string, matches: boolean): void {
      const record = getRecord(query);
      record.matches = matches;
      const event = { matches } as MediaQueryListEvent;
      for (const listener of record.listeners) {
        listener(event);
      }
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useMediaQuery", () => {
  it("reads the initial query result", () => {
    installMatchMediaStub({
      "(min-width: 768px)": true,
    });

    const App = defineComponent({
      setup() {
        const matches = useMediaQuery("(min-width: 768px)");
        return () => h("div", { "data-matches": String(matches.value) });
      },
    });

    const wrapper = mount(App);
    expect(wrapper.get("div").attributes("data-matches")).toBe("true");
  });

  it("updates when media query listeners fire", async () => {
    const matchMedia = installMatchMediaStub({
      "(min-width: 1024px)": false,
    });

    const App = defineComponent({
      setup() {
        const matches = useMediaQuery("(min-width: 1024px)");
        return () => h("div", { "data-matches": String(matches.value) });
      },
    });

    const wrapper = mount(App);
    expect(wrapper.get("div").attributes("data-matches")).toBe("false");

    matchMedia.setMatch("(min-width: 1024px)", true);
    await nextTick();

    expect(wrapper.get("div").attributes("data-matches")).toBe("true");
  });

  it("returns false while SSR mode is active", () => {
    installMatchMediaStub({
      "(min-width: 768px)": true,
    });

    const Child = defineComponent({
      setup() {
        const matches = useMediaQuery("(min-width: 768px)");
        return () => h("div", { "data-matches": String(matches.value) });
      },
    });

    const App = defineComponent({
      setup() {
        provideSSR({ isSSR: true });
        return () => h(Child);
      },
    });

    const wrapper = mount(App);
    expect(wrapper.get("div").attributes("data-matches")).toBe("false");
  });
});
