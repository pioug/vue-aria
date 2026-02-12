import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { afterEach, describe, expect, it } from "vitest";
import { UNSAFE_PortalProvider, useUNSAFE_PortalContext } from "../src";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("UNSAFE_PortalProvider", () => {
  it("returns an empty portal context outside of a provider", () => {
    let getContainer: (() => HTMLElement | null) | null | undefined;

    const Probe = defineComponent({
      setup() {
        getContainer = useUNSAFE_PortalContext().getContainer;
        return () => null;
      },
    });

    const wrapper = mount(Probe, {
      attachTo: document.body,
    });

    expect(getContainer).toBeUndefined();
    wrapper.unmount();
  });

  it("provides a portal container getter", () => {
    const container = document.createElement("div");
    let getContainer: (() => HTMLElement | null) | null | undefined;

    const Probe = defineComponent({
      setup() {
        getContainer = useUNSAFE_PortalContext().getContainer;
        return () => null;
      },
    });

    const wrapper = mount(UNSAFE_PortalProvider, {
      attachTo: document.body,
      props: {
        getContainer: () => container,
      },
      slots: {
        default: () => h(Probe),
      },
    });

    expect(getContainer?.()).toBe(container);
    wrapper.unmount();
  });

  it("inherits parent portal container when nested", () => {
    const container = document.createElement("div");
    let getContainer: (() => HTMLElement | null) | null | undefined;

    const Probe = defineComponent({
      setup() {
        getContainer = useUNSAFE_PortalContext().getContainer;
        return () => null;
      },
    });

    const wrapper = mount(UNSAFE_PortalProvider, {
      attachTo: document.body,
      props: {
        getContainer: () => container,
      },
      slots: {
        default: () =>
          h(
            UNSAFE_PortalProvider,
            {},
            {
              default: () => h(Probe),
            }
          ),
      },
    });

    expect(getContainer?.()).toBe(container);
    wrapper.unmount();
  });

  it("clears parent portal container when nested provider uses null", () => {
    const container = document.createElement("div");
    let getContainer: (() => HTMLElement | null) | null | undefined;

    const Probe = defineComponent({
      setup() {
        getContainer = useUNSAFE_PortalContext().getContainer;
        return () => null;
      },
    });

    const wrapper = mount(UNSAFE_PortalProvider, {
      attachTo: document.body,
      props: {
        getContainer: () => container,
      },
      slots: {
        default: () =>
          h(
            UNSAFE_PortalProvider,
            {
              getContainer: null,
            },
            {
              default: () => h(Probe),
            }
          ),
      },
    });

    expect(getContainer).toBeUndefined();
    wrapper.unmount();
  });
});
