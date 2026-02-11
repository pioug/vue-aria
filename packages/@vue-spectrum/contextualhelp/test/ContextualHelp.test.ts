import { mount } from "@vue/test-utils";
import { h, nextTick } from "vue";
import { describe, expect, it } from "vitest";
import { Content, Footer, Header } from "@vue-spectrum/view";
import { Link } from "@vue-spectrum/link";
import { ContextualHelp } from "../src";

async function flushOverlay(): Promise<void> {
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

describe("ContextualHelp", () => {
  it("renders a quiet action button", () => {
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
    expect(document.body.textContent).toContain("Test title");

    wrapper.unmount();
  });

  it("renders content and footer link", async () => {
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
    const footer = document.body.querySelector("footer");
    expect(footer).not.toBeNull();
    expect(footer?.textContent).toContain("Test link");
    expect(footer?.className).toContain(
      "react-spectrum-ContextualHelp-footer"
    );

    wrapper.unmount();
  });

  it("includes default aria-label", () => {
    const wrapper = mount(ContextualHelp, {
      slots: {
        default: () => h(Header, null, () => "Test title"),
      },
    });

    const button = wrapper.get("button");
    expect(button.attributes("aria-label")).toBe("Help");
  });

  it("includes default aria-label for info variant", () => {
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

  it("supports custom aria-label", () => {
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

  it("supports custom aria-labelledby", () => {
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
});
