import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import { describe, expect, it } from "vitest";
import { UNSAFE_PortalProvider } from "@vue-aria/overlays";
import { DEFAULT_SPECTRUM_THEME_CLASS_MAP, Provider } from "@vue-spectrum/provider";
import { Content, Footer, Header } from "@vue-spectrum/view";
import { Link } from "@vue-spectrum/link";
import { ContextualHelp } from "../src";

async function flushOverlay(): Promise<void> {
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

describe("ContextualHelp", () => {
  it("attaches a ref to the trigger button", () => {
    const contextualHelpRef = ref<{ UNSAFE_getDOMNode: () => HTMLElement | null } | null>(
      null
    );
    const App = defineComponent({
      name: "ContextualHelpRefHarness",
      setup() {
        return () =>
          h(
            ContextualHelp,
            {
              ref: contextualHelpRef,
            },
            {
              default: () => h(Header, null, () => "Test title"),
            }
          );
      },
    });

    const wrapper = mount(App);
    const button = wrapper.get("button");
    expect(contextualHelpRef.value?.UNSAFE_getDOMNode()).toBe(
      button.element as HTMLElement
    );
    wrapper.unmount();
  });

  it("renders quiet action button", () => {
    const wrapper = mount(ContextualHelp, {
      slots: {
        default: () => h(Header, null, () => "Test title"),
      },
    });

    const button = wrapper.get("button");
    expect(button.classes()).toContain("spectrum-ActionButton--quiet");
  });

  it("opens a popover", async () => {
    const wrapper = mount(ContextualHelp, {
      attachTo: document.body,
      slots: {
        default: () => h(Header, null, () => "Test title"),
      },
    });

    await wrapper.get("button").trigger("click");
    await flushOverlay();

    expect(document.body.querySelector("[role=\"dialog\"]")).not.toBeNull();
    expect(document.body.querySelector("[data-testid=\"popover\"]")).not.toBeNull();
    expect(document.body.querySelector("[data-testid=\"popover-arrow\"]")).toBeNull();
    expect(document.body.textContent).toContain("Test title");

    wrapper.unmount();
  });

  it("renders content", async () => {
    const wrapper = mount(ContextualHelp, {
      attachTo: document.body,
      slots: {
        default: () => [
          h(Header, null, () => "Test title"),
          h(Content, null, () => "Help content"),
          h(
            Footer,
            null,
            () =>
              h(
                Link,
                null,
                {
                  default: () => "Test link",
                }
              )
          ),
        ],
      },
    });

    await wrapper.get("button").trigger("click");
    await flushOverlay();

    expect(document.body.textContent).toContain("Help content");

    wrapper.unmount();
  });

  it("renders a link", async () => {
    const wrapper = mount(ContextualHelp, {
      attachTo: document.body,
      slots: {
        default: () => [
          h(Header, null, () => "Test title"),
          h(Content, null, () => "Help content"),
          h(
            Footer,
            null,
            () =>
              h(
                Link,
                null,
                {
                  default: () => "Test link",
                }
              )
          ),
        ],
      },
    });

    await wrapper.get("button").trigger("click");
    await flushOverlay();

    expect(document.body.textContent).toContain("Test link");
    const footer = document.body.querySelector("footer");
    expect(footer).not.toBeNull();
    expect(footer?.className).toContain("react-spectrum-ContextualHelp-footer");

    wrapper.unmount();
  });

  it("includes a default aria-label", () => {
    const wrapper = mount(ContextualHelp, {
      slots: {
        default: () => h(Header, null, () => "Test title"),
      },
    });

    const button = wrapper.get("button");
    expect(button.attributes("aria-label")).toBe("Help");
  });

  it("includes a default aria-label for info variant", () => {
    const wrapper = mount(ContextualHelp, {
      props: {
        variant: "info",
      },
      slots: {
        default: () => h(Header, null, () => "Test title"),
      },
    });

    const button = wrapper.get("button");
    expect(button.attributes("aria-label")).toBe("Information");
  });

  it("localizes default aria labels from provider locale", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: DEFAULT_SPECTRUM_THEME_CLASS_MAP,
        locale: "fr-FR",
      },
      slots: {
        default: () =>
          h(
            ContextualHelp,
            {
              variant: "help",
            },
            {
              default: () => h(Header, null, () => "Test title"),
            }
          ),
      },
    });

    const button = wrapper.get("button");
    expect(button.attributes("aria-label")).toBe("Aide");
  });

  it("supports a custom aria-label", () => {
    const wrapper = mount(ContextualHelp, {
      props: {
        "aria-label": "test",
      } as Record<string, unknown>,
      slots: {
        default: () => h(Header, null, () => "Test title"),
      },
    });

    const button = wrapper.get("button");
    expect(button.attributes("aria-label")).toBe("test");
  });

  it("supports a custom aria-labelledby", () => {
    const wrapper = mount(ContextualHelp, {
      props: {
        "aria-labelledby": "test",
      } as Record<string, unknown>,
      slots: {
        default: () => h(Header, null, () => "Test title"),
      },
    });

    const button = wrapper.get("button");
    expect(button.attributes("aria-label")).toBeUndefined();
    expect(button.attributes("aria-labelledby")).toBe("test");
  });

  it("forwards placement to the popover trigger", async () => {
    const wrapper = mount(ContextualHelp, {
      attachTo: document.body,
      props: {
        placement: "top",
      },
      slots: {
        default: () => h(Header, null, () => "Test title"),
      },
    });

    await wrapper.get("button").trigger("click");
    await flushOverlay();

    const popover = document.body.querySelector("[data-testid=\"popover\"]");
    expect(popover).not.toBeNull();
    expect(popover?.getAttribute("data-placement")).not.toBeNull();

    wrapper.unmount();
  });

  it("renders contextual help popover in portal container from UNSAFE_PortalProvider", async () => {
    const customContainer = document.createElement("div");
    customContainer.setAttribute("data-testid", "custom-container");
    document.body.appendChild(customContainer);

    const wrapper = mount(
      {
        render() {
          return h(
            UNSAFE_PortalProvider,
            {
              getContainer: () => customContainer,
            },
            {
              default: () =>
                h(
                  ContextualHelp,
                  null,
                  {
                    default: () => h(Header, null, () => "Test title"),
                  }
                ),
            }
          );
        },
      },
      {
        attachTo: document.body,
      }
    );

    try {
      await wrapper.get("button").trigger("click");
      await flushOverlay();

      const popover = document.body.querySelector("[data-testid=\"popover\"]");
      expect(popover).not.toBeNull();
      expect(popover?.closest("[data-testid=\"custom-container\"]")).toBe(customContainer);
    } finally {
      wrapper.unmount();
      customContainer.remove();
    }
  });

  it("supports nested UNSAFE_PortalProvider null override for contextual help", async () => {
    const customContainer = document.createElement("div");
    customContainer.setAttribute("data-testid", "custom-container");
    document.body.appendChild(customContainer);

    const wrapper = mount(
      {
        render() {
          return h(
            UNSAFE_PortalProvider,
            {
              getContainer: () => customContainer,
            },
            {
              default: () =>
                h(
                  UNSAFE_PortalProvider,
                  {
                    getContainer: null,
                  },
                  {
                    default: () =>
                      h(
                        ContextualHelp,
                        null,
                        {
                          default: () => h(Header, null, () => "Test title"),
                        }
                      ),
                  }
                ),
            }
          );
        },
      },
      {
        attachTo: document.body,
      }
    );

    try {
      await wrapper.get("button").trigger("click");
      await flushOverlay();

      const popover = document.body.querySelector("[data-testid=\"popover\"]");
      expect(popover).not.toBeNull();
      expect(popover?.closest("[data-testid=\"custom-container\"]")).not.toBe(customContainer);
    } finally {
      wrapper.unmount();
      customContainer.remove();
    }
  });
});
