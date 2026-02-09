import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { provideSSR } from "@vue-aria/ssr";
import {
  BreakpointProvider,
  useBreakpoint,
  useMatchedBreakpoints,
  useStyleProps,
  viewStyleProps,
} from "../src";

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

describe("breakpoint utilities", () => {
  it("computes matched breakpoints ordered from largest to base", async () => {
    const viewport = installViewportMatchMedia(800);

    const App = defineComponent({
      setup() {
        const matched = useMatchedBreakpoints({
          S: 640,
          M: 768,
          L: 1024,
        });

        return () => h("div", { "data-breakpoints": matched.value.join(",") });
      },
    });

    const wrapper = mount(App);
    expect(wrapper.get("div").attributes("data-breakpoints")).toBe("M,S,base");

    viewport.setWidth(1200);
    window.dispatchEvent(new Event("resize"));
    await nextTick();

    expect(wrapper.get("div").attributes("data-breakpoints")).toBe("L,M,S,base");
  });

  it("returns base breakpoint in SSR mode", () => {
    installViewportMatchMedia(1200);

    const Child = defineComponent({
      setup() {
        const matched = useMatchedBreakpoints({
          S: 640,
          M: 768,
        });

        return () => h("div", { "data-breakpoints": matched.value.join(",") });
      },
    });

    const App = defineComponent({
      setup() {
        provideSSR({ isSSR: true });
        return () => h(Child);
      },
    });

    const wrapper = mount(App);
    expect(wrapper.get("div").attributes("data-breakpoints")).toBe("base");
  });

  it("provides breakpoint context and integrates with useStyleProps", () => {
    const Child = defineComponent({
      setup() {
        const context = useBreakpoint();
        const { styleProps } = useStyleProps(
          {
            width: { base: "100px", M: "200px" },
          },
          viewStyleProps
        );

        return () =>
          h("div", {
            "data-breakpoints": context?.value.matchedBreakpoints.join(","),
            "data-width": String(styleProps.style.width),
          });
      },
    });

    const App = defineComponent({
      setup() {
        return () =>
          h(
            BreakpointProvider,
            {
              matchedBreakpoints: ["M", "base"],
            },
            {
              default: () => h(Child),
            }
          );
      },
    });

    const wrapper = mount(App);
    expect(wrapper.get("div").attributes("data-breakpoints")).toBe("M,base");
    expect(wrapper.get("div").attributes("data-width")).toBe("200px");
  });
});
