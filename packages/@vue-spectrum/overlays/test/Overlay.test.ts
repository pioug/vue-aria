import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import { describe, expect, it } from "vitest";
import { Overlay } from "../src";

const ExampleOverlay = defineComponent({
  name: "ExampleOverlay",
  setup() {
    return () => h("span", { "data-testid": "contents" }, "Overlay");
  },
});

describe("Overlay", () => {
  it("should render nothing if isOpen is not set", () => {
    const overlayRef = ref<{ UNSAFE_getDOMNode: () => HTMLElement | null } | null>(
      null
    );
    const App = defineComponent({
      name: "OverlayClosedApp",
      setup() {
        return () =>
          h(
            Overlay,
            {
              ref: overlayRef,
            },
            {
              default: () => h(ExampleOverlay),
            }
          );
      },
    });

    const wrapper = mount(App, {
      attachTo: document.body,
    });

    expect(overlayRef.value?.UNSAFE_getDOMNode()).toBe(null);
    expect(wrapper.find("[data-testid=\"contents\"]").exists()).toBe(false);

    wrapper.unmount();
  });

  it("should render into a portal in the body", async () => {
    const providerRef = ref<HTMLElement | null>(null);
    const overlayRef = ref<{ UNSAFE_getDOMNode: () => HTMLElement | null } | null>(
      null
    );

    const App = defineComponent({
      name: "OverlayOpenApp",
      setup() {
        return () =>
          h("div", { ref: providerRef }, [
            h(
              Overlay,
              {
                isOpen: true,
                ref: overlayRef,
              },
              {
                default: () => h(ExampleOverlay),
              }
            ),
          ]);
      },
    });

    const wrapper = mount(App, {
      attachTo: document.body,
    });
    await wrapper.vm.$nextTick();

    const overlayNode = overlayRef.value?.UNSAFE_getDOMNode() ?? null;
    expect(overlayNode).not.toBe(null);
    expect(overlayNode).not.toBe(providerRef.value);
    expect(overlayNode?.parentNode).toBe(document.body);

    wrapper.unmount();
  });
});
