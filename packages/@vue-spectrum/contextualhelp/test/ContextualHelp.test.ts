import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { ContextualHelp } from "../src";

describe("ContextualHelp", () => {
  it("renders contextual help wrapper", () => {
    const wrapper = mount(ContextualHelp, {
      slots: {
        default: () => "Help",
      },
      attrs: {
        "data-testid": "contextual-help",
      },
    });

    const help = wrapper.get('[data-testid="contextual-help"]');
    expect(help.element.tagName).toBe("SPAN");
    expect(help.classes()).toContain("spectrum-ContextualHelp");
    expect(help.classes()).toContain("spectrum-ContextualHelp--help");
  });

  it("supports info variant", () => {
    const wrapper = mount(ContextualHelp, {
      props: {
        variant: "info",
      },
      attrs: {
        "data-testid": "contextual-help",
      },
    });

    expect(wrapper.get('[data-testid="contextual-help"]').classes()).toContain("spectrum-ContextualHelp--info");
    expect(wrapper.get('[data-testid="contextual-help"]').classes()).not.toContain("spectrum-ContextualHelp--help");
  });

  it("supports UNSAFE_className", () => {
    const wrapper = mount(ContextualHelp, {
      props: {
        UNSAFE_className: "my-contextual-help",
      },
      attrs: {
        "data-testid": "contextual-help",
      },
    });

    expect(wrapper.get('[data-testid="contextual-help"]').classes()).toContain("my-contextual-help");
  });
});
