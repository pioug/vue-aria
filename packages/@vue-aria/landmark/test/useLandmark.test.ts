import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
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
