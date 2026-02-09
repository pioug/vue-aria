import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import { afterEach, describe, expect, it } from "vitest";
import { provideSSR } from "@vue-aria/ssr";
import { useIsMobileDevice } from "../src";

let originalScreenWidthDescriptor: PropertyDescriptor | undefined;

function setScreenWidth(width: number): void {
  if (!originalScreenWidthDescriptor) {
    originalScreenWidthDescriptor = Object.getOwnPropertyDescriptor(window.screen, "width");
  }

  Object.defineProperty(window.screen, "width", {
    configurable: true,
    get() {
      return width;
    },
  });
}

afterEach(() => {
  if (originalScreenWidthDescriptor) {
    Object.defineProperty(window.screen, "width", originalScreenWidthDescriptor);
    originalScreenWidthDescriptor = undefined;
  }
});

describe("useIsMobileDevice", () => {
  it("returns true on small screens", () => {
    setScreenWidth(640);

    const App = defineComponent({
      setup() {
        const isMobile = useIsMobileDevice();
        return () => h("div", { "data-mobile": String(isMobile.value) });
      },
    });

    const wrapper = mount(App);
    expect(wrapper.get("div").attributes("data-mobile")).toBe("true");
  });

  it("returns false on larger screens", () => {
    setScreenWidth(1200);

    const App = defineComponent({
      setup() {
        const isMobile = useIsMobileDevice();
        return () => h("div", { "data-mobile": String(isMobile.value) });
      },
    });

    const wrapper = mount(App);
    expect(wrapper.get("div").attributes("data-mobile")).toBe("false");
  });

  it("reacts to window resize updates", async () => {
    setScreenWidth(640);

    const App = defineComponent({
      setup() {
        const isMobile = useIsMobileDevice();
        return () => h("div", { "data-mobile": String(isMobile.value) });
      },
    });

    const wrapper = mount(App);
    expect(wrapper.get("div").attributes("data-mobile")).toBe("true");

    setScreenWidth(900);
    window.dispatchEvent(new Event("resize"));
    await nextTick();

    expect(wrapper.get("div").attributes("data-mobile")).toBe("false");
  });

  it("returns false during SSR", () => {
    setScreenWidth(640);

    const Child = defineComponent({
      setup() {
        const isMobile = useIsMobileDevice();
        return () => h("div", { "data-mobile": String(isMobile.value) });
      },
    });

    const App = defineComponent({
      setup() {
        provideSSR({ isSSR: true });
        return () => h(Child);
      },
    });

    const wrapper = mount(App);
    expect(wrapper.get("div").attributes("data-mobile")).toBe("false");
  });
});
