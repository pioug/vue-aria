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
    vi.restoreAllMocks();
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

  it("navigates nested landmarks in DOM order", async () => {
    const App = defineComponent({
      setup() {
        const mainRef = ref<HTMLElement | null>(null);
        const region1Ref = ref<HTMLElement | null>(null);
        const region2Ref = ref<HTMLElement | null>(null);

        const mainAdapter = {
          get current() {
            return mainRef.value;
          },
          set current(value: Element | null) {
            mainRef.value = value as HTMLElement | null;
          },
        };
        const region1Adapter = {
          get current() {
            return region1Ref.value;
          },
          set current(value: Element | null) {
            region1Ref.value = value as HTMLElement | null;
          },
        };
        const region2Adapter = {
          get current() {
            return region2Ref.value;
          },
          set current(value: Element | null) {
            region2Ref.value = value as HTMLElement | null;
          },
        };

        const { landmarkProps: mainProps } = useLandmark({ role: "main" }, mainAdapter);
        const { landmarkProps: region1Props } = useLandmark({ role: "region", "aria-label": "Region 1" }, region1Adapter);
        const { landmarkProps: region2Props } = useLandmark({ role: "region", "aria-label": "Region 2" }, region2Adapter);

        return () =>
          h("div", [
            h("main", { ...mainProps, ref: mainRef }, [
              h("article", { ...region1Props, ref: region1Ref }, "Region 1"),
              h("p", "Between"),
              h("article", { ...region2Props, ref: region2Ref }, "Region 2"),
            ]),
          ]);
      },
    });

    const wrapper = mount(App, { attachTo: document.body });
    await nextTick();
    const main = wrapper.get("main").element as HTMLElement;
    const regions = wrapper.findAll("article").map((node) => node.element as HTMLElement);
    const region1 = regions[0];
    const region2 = regions[1];

    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "F6", bubbles: true, cancelable: true }));
    await nextTick();
    expect(document.activeElement).toBe(main);

    main.dispatchEvent(new KeyboardEvent("keydown", { key: "F6", bubbles: true, cancelable: true }));
    await nextTick();
    expect(document.activeElement).toBe(region1);

    region1.dispatchEvent(new KeyboardEvent("keydown", { key: "F6", bubbles: true, cancelable: true }));
    await nextTick();
    expect(document.activeElement).toBe(region2);

    region2.dispatchEvent(new KeyboardEvent("keydown", { key: "F6", bubbles: true, cancelable: true }));
    await nextTick();
    expect(document.activeElement).toBe(main);

    main.dispatchEvent(new KeyboardEvent("keydown", { key: "F6", shiftKey: true, bubbles: true, cancelable: true }));
    await nextTick();
    expect(document.activeElement).toBe(region2);

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

  it("ensures keyboard listeners are active while a controller is alive", () => {
    const onLandmarkNavigation = vi.fn((event: Event) => event.preventDefault());
    window.addEventListener("react-aria-landmark-navigation", onLandmarkNavigation as EventListener);

    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "F6", bubbles: true, cancelable: true }));
    expect(onLandmarkNavigation).not.toHaveBeenCalled();

    const controller = UNSTABLE_createLandmarkController();
    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "F6", bubbles: true, cancelable: true }));
    expect(onLandmarkNavigation).toHaveBeenCalledTimes(1);

    controller.dispose();
    onLandmarkNavigation.mockClear();

    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "F6", bubbles: true, cancelable: true }));
    expect(onLandmarkNavigation).not.toHaveBeenCalled();
    window.removeEventListener("react-aria-landmark-navigation", onLandmarkNavigation as EventListener);
  });

  it("allows duplicate role landmarks when labels are unique", async () => {
    const RegionA = defineComponent({
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
        const { landmarkProps } = useLandmark({ role: "region", "aria-label": "Region A" }, refAdapter);
        return () => h("article", { ...landmarkProps, ref: elementRef }, "A");
      },
    });
    const RegionB = defineComponent({
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
        const { landmarkProps } = useLandmark({ role: "region", "aria-label": "Region B" }, refAdapter);
        return () => h("article", { ...landmarkProps, ref: elementRef }, "B");
      },
    });
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const App = defineComponent({
      setup() {
        return () => h("div", [h(RegionA), h(RegionB)]);
      },
    });

    const wrapper = mount(App, { attachTo: document.body });
    await nextTick();
    expect(warnSpy).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it("warns when duplicate role landmarks are not labeled", async () => {
    const Region = createLandmark("article", "region", "Region");
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const App = defineComponent({
      setup() {
        return () => h("div", [h(Region), h(Region)]);
      },
    });

    const wrapper = mount(App, { attachTo: document.body });
    await nextTick();
    expect(warnSpy).toHaveBeenCalled();
    const firstMessage = String(warnSpy.mock.calls[0]?.[0] ?? "");
    expect(firstMessage).toContain("more than one landmark");
    wrapper.unmount();
  });

  it("warns when duplicate role landmarks share the same label", async () => {
    const RegionA = defineComponent({
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
        const { landmarkProps } = useLandmark({ role: "region", "aria-label": "Shared" }, refAdapter);
        return () => h("article", { ...landmarkProps, ref: elementRef }, "A");
      },
    });
    const RegionB = defineComponent({
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
        const { landmarkProps } = useLandmark({ role: "region", "aria-label": "Shared" }, refAdapter);
        return () => h("article", { ...landmarkProps, ref: elementRef }, "B");
      },
    });
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const App = defineComponent({
      setup() {
        return () => h("div", [h(RegionA), h(RegionB)]);
      },
    });

    const wrapper = mount(App, { attachTo: document.body });
    await nextTick();
    expect(warnSpy).toHaveBeenCalled();
    const joinedMessages = warnSpy.mock.calls.map((call) => String(call[0])).join("\n");
    expect(joinedMessages).toContain("must have unique labels");
    wrapper.unmount();
  });

  it("stores the landmark manager singleton on document", () => {
    const controller = UNSTABLE_createLandmarkController();
    const manager = (document as Document & Record<symbol, unknown>)[landmarkSymbol] as Record<string, unknown> | undefined;
    expect(manager).toBeDefined();
    expect(typeof manager?.version).toBe("number");
    expect(typeof manager?.createLandmarkController).toBe("function");
    expect(typeof manager?.registerLandmark).toBe("function");
    controller.dispose();
  });

  it("replaces the singleton manager with a newer version", async () => {
    const Main = createLandmark("main", "main", "Main");
    const App = defineComponent({
      setup() {
        return () => h("div", [h(Main)]);
      },
    });

    const wrapper = mount(App, { attachTo: document.body });
    await nextTick();

    const controller = UNSTABLE_createLandmarkController();
    const newController = {
      navigate: vi.fn(),
      focusNext: vi.fn(),
      focusPrevious: vi.fn(),
      focusMain: vi.fn(),
      dispose: vi.fn(),
    };

    const manager = (document as Document & Record<symbol, { version: number } | undefined>)[landmarkSymbol];
    const unregister = vi.fn();
    const testLandmarkManager = {
      version: (manager?.version ?? 0) + 1,
      createLandmarkController: vi.fn(() => newController),
      registerLandmark: vi.fn(() => unregister),
    };

    (document as Document & Record<symbol, unknown>)[landmarkSymbol] = testLandmarkManager;
    document.dispatchEvent(new CustomEvent("react-aria-landmark-manager-change"));
    await nextTick();

    expect(testLandmarkManager.registerLandmark).toHaveBeenCalledTimes(1);
    expect(testLandmarkManager.createLandmarkController).toHaveBeenCalledTimes(1);

    controller.navigate("forward");
    expect(newController.navigate).toHaveBeenCalledWith("forward", undefined);

    controller.focusNext();
    expect(newController.focusNext).toHaveBeenCalledTimes(1);

    controller.focusPrevious();
    expect(newController.focusPrevious).toHaveBeenCalledTimes(1);

    controller.focusMain();
    expect(newController.focusMain).toHaveBeenCalledTimes(1);

    controller.dispose();
    expect(newController.dispose).toHaveBeenCalledTimes(1);

    wrapper.unmount();
    expect(unregister).toHaveBeenCalledTimes(1);
  });
});
