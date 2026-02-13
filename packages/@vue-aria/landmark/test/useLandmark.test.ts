import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { UNSTABLE_createLandmarkController, useLandmark } from "../src";

const landmarkSymbol = Symbol.for("react-aria-landmark-manager");

function createLandmark(tag: "main" | "nav" | "article", role: "main" | "navigation" | "region", text: string) {
  return defineComponent({
    name: `Landmark${role}`,
    setup() {
      const elementRef = ref<HTMLElement | null>(null);
      const refAdapter = {
        get current() {
          return elementRef.value;
        },
        set current(value: Element | null) {
          elementRef.value = value as HTMLElement | null;
        },
      };
      const { landmarkProps } = useLandmark({ role }, refAdapter);
      return () => h(tag, { ...landmarkProps, ref: elementRef }, text);
    },
  });
}

describe("useLandmark", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    const doc = document as Document & Record<symbol, unknown>;
    delete doc[landmarkSymbol];
  });

  it("returns landmark props", () => {
    const Probe = defineComponent({
      setup() {
        const elementRef = ref<HTMLElement | null>(null);
        const refAdapter = {
          get current() {
            return elementRef.value;
          },
          set current(value: Element | null) {
            elementRef.value = value as HTMLElement | null;
          },
        };
        const { landmarkProps } = useLandmark({ role: "region", "aria-label": "Sidebar region" }, refAdapter);
        return () => h("article", { ...landmarkProps, ref: elementRef });
      },
    });

    const wrapper = mount(Probe, { attachTo: document.body });
    const region = wrapper.get("article");
    expect(region.attributes("role")).toBe("region");
    expect(region.attributes("aria-label")).toBe("Sidebar region");
    wrapper.unmount();
  });

  it("navigates landmarks with F6", async () => {
    const Navigation = createLandmark("nav", "navigation", "Navigation");
    const Main = createLandmark("main", "main", "Main");
    const App = defineComponent({
      setup() {
        return () => h("div", [h(Navigation), h(Main)]);
      },
    });

    const wrapper = mount(App, { attachTo: document.body });
    await nextTick();
    const nav = wrapper.get("nav").element as HTMLElement;
    const main = wrapper.get("main").element as HTMLElement;

    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "F6", bubbles: true, cancelable: true }));
    await nextTick();
    expect(document.activeElement).toBe(nav);

    nav.dispatchEvent(new KeyboardEvent("keydown", { key: "F6", bubbles: true, cancelable: true }));
    await nextTick();
    expect(document.activeElement).toBe(main);

    main.dispatchEvent(new KeyboardEvent("keydown", { key: "F6", bubbles: true, cancelable: true }));
    await nextTick();
    expect(document.activeElement).toBe(nav);

    wrapper.unmount();
  });

  it("focuses main landmark on Alt+F6", async () => {
    const Navigation = createLandmark("nav", "navigation", "Navigation");
    const Main = createLandmark("main", "main", "Main");
    const App = defineComponent({
      setup() {
        return () => h("div", [h(Navigation), h(Main)]);
      },
    });

    const wrapper = mount(App, { attachTo: document.body });
    await nextTick();
    const nav = wrapper.get("nav").element as HTMLElement;
    const main = wrapper.get("main").element as HTMLElement;

    nav.focus();
    nav.dispatchEvent(new KeyboardEvent("keydown", { key: "F6", altKey: true, bubbles: true, cancelable: true }));
    await nextTick();
    expect(document.activeElement).toBe(main);

    wrapper.unmount();
  });

  it("does not handle Alt+F6 when there is no main landmark", async () => {
    const Navigation = defineComponent({
      setup() {
        const elementRef = ref<HTMLElement | null>(null);
        const refAdapter = {
          get current() {
            return elementRef.value;
          },
          set current(value: Element | null) {
            elementRef.value = value as HTMLElement | null;
          },
        };
        const { landmarkProps } = useLandmark({ role: "navigation" }, refAdapter);
        return () =>
          h("nav", { ...landmarkProps, ref: elementRef }, [h("a", { href: "#", "data-testid": "nav-link" }, "Link")]);
      },
    });
    const Region = createLandmark("article", "region", "Region");
    const App = defineComponent({
      setup() {
        return () => h("div", [h(Navigation), h(Region)]);
      },
    });

    const wrapper = mount(App, { attachTo: document.body });
    await nextTick();
    const link = wrapper.get('[data-testid="nav-link"]').element as HTMLAnchorElement;
    link.focus();
    link.dispatchEvent(new KeyboardEvent("keydown", { key: "F6", altKey: true, bubbles: true, cancelable: true }));
    await nextTick();
    expect(document.activeElement).toBe(link);
    wrapper.unmount();
  });

  it("supports backward wrap navigation with Shift+F6", async () => {
    const Navigation = createLandmark("nav", "navigation", "Navigation");
    const Main = createLandmark("main", "main", "Main");
    const App = defineComponent({
      setup() {
        return () => h("div", [h(Navigation), h(Main)]);
      },
    });

    const wrapper = mount(App, { attachTo: document.body });
    await nextTick();
    const nav = wrapper.get("nav").element as HTMLElement;
    const main = wrapper.get("main").element as HTMLElement;

    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "F6", bubbles: true, cancelable: true }));
    await nextTick();
    expect(document.activeElement).toBe(nav);

    nav.dispatchEvent(new KeyboardEvent("keydown", { key: "F6", shiftKey: true, bubbles: true, cancelable: true }));
    await nextTick();
    expect(document.activeElement).toBe(main);
    wrapper.unmount();
  });

  it("fires a custom navigation event when wrapping forward", async () => {
    const Navigation = createLandmark("nav", "navigation", "Navigation");
    const Main = createLandmark("main", "main", "Main");
    const App = defineComponent({
      setup() {
        return () => h("div", [h(Navigation), h(Main)]);
      },
    });

    const wrapper = mount(App, { attachTo: document.body });
    await nextTick();
    const nav = wrapper.get("nav").element as HTMLElement;
    const main = wrapper.get("main").element as HTMLElement;
    const onWrap = vi.fn();
    main.addEventListener("react-aria-landmark-navigation", onWrap as EventListener);

    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "F6", bubbles: true, cancelable: true }));
    await nextTick();
    nav.dispatchEvent(new KeyboardEvent("keydown", { key: "F6", bubbles: true, cancelable: true }));
    await nextTick();
    main.dispatchEvent(new KeyboardEvent("keydown", { key: "F6", bubbles: true, cancelable: true }));
    await nextTick();

    expect(onWrap).toHaveBeenCalledTimes(1);
    const customEvent = onWrap.mock.calls[0]?.[0] as CustomEvent;
    expect(customEvent.detail).toEqual({ direction: "forward" });
    expect(document.activeElement).toBe(nav);
    wrapper.unmount();
  });

  it("skips aria-hidden landmarks when navigating", async () => {
    const Navigation = createLandmark("nav", "navigation", "Navigation");
    const HiddenRegion = defineComponent({
      setup() {
        const elementRef = ref<HTMLElement | null>(null);
        const refAdapter = {
          get current() {
            return elementRef.value;
          },
          set current(value: Element | null) {
            elementRef.value = value as HTMLElement | null;
          },
        };
        const { landmarkProps } = useLandmark({ role: "region" }, refAdapter);
        return () => h("article", { ...landmarkProps, ref: elementRef, "aria-hidden": "true" }, "Hidden");
      },
    });
    const Main = createLandmark("main", "main", "Main");
    const App = defineComponent({
      setup() {
        return () => h("div", [h(Navigation), h(HiddenRegion), h(Main)]);
      },
    });

    const wrapper = mount(App, { attachTo: document.body });
    await nextTick();
    const nav = wrapper.get("nav").element as HTMLElement;
    const main = wrapper.get("main").element as HTMLElement;

    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "F6", bubbles: true, cancelable: true }));
    await nextTick();
    expect(document.activeElement).toBe(nav);

    nav.dispatchEvent(new KeyboardEvent("keydown", { key: "F6", bubbles: true, cancelable: true }));
    await nextTick();
    expect(document.activeElement).toBe(main);
    wrapper.unmount();
  });

  it("sets tabIndex -1 on a focused landmark", async () => {
    const Navigation = createLandmark("nav", "navigation", "Navigation");
    const App = defineComponent({
      setup() {
        return () => h("div", [h(Navigation)]);
      },
    });

    const wrapper = mount(App, { attachTo: document.body });
    await nextTick();
    const nav = wrapper.get("nav");

    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "F6", bubbles: true, cancelable: true }));
    await nextTick();
    expect(document.activeElement).toBe(nav.element);
    expect(nav.attributes("tabindex")).toBe("-1");
    wrapper.unmount();
  });

  it("supports controller navigation", async () => {
    const Navigation = createLandmark("nav", "navigation", "Navigation");
    const Main = createLandmark("main", "main", "Main");
    const App = defineComponent({
      setup() {
        return () => h("div", [h(Navigation), h(Main)]);
      },
    });

    const wrapper = mount(App, { attachTo: document.body });
    await nextTick();
    const nav = wrapper.get("nav").element as HTMLElement;
    const main = wrapper.get("main").element as HTMLElement;

    const controller = UNSTABLE_createLandmarkController();
    expect(controller.focusNext({ from: document.body as unknown as Element })).toBe(true);
    await nextTick();
    expect(document.activeElement).toBe(nav);

    expect(controller.focusNext({ from: nav })).toBe(true);
    await nextTick();
    expect(document.activeElement).toBe(main);

    expect(controller.focusPrevious({ from: main })).toBe(true);
    await nextTick();
    expect(document.activeElement).toBe(nav);

    expect(controller.focusMain()).toBe(true);
    await nextTick();
    expect(document.activeElement).toBe(main);

    controller.dispose();
    wrapper.unmount();
  });
});
