import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { Tooltip } from "../src/Tooltip";

describe("Tooltip", () => {
  it("supports children", () => {
    const wrapper = mount(Tooltip as any, {
      slots: {
        default: () => "This is a tooltip",
      },
    });
    const tooltip = wrapper.get('[role="tooltip"]');
    expect(tooltip.attributes("role")).toBe("tooltip");
    expect(tooltip.text()).toContain("This is a tooltip");
  });

  it("supports aria-label", () => {
    const wrapper = mount(Tooltip as any, {
      attrs: {
        "aria-label": "Tooltip",
      },
    });
    const tooltip = wrapper.get('[role="tooltip"]');
    expect(tooltip.attributes("aria-label")).toBe("Tooltip");
  });

  it("supports aria-labelledby", () => {
    const wrapper = mount(Tooltip as any, {
      attrs: {
        "aria-labelledby": "test",
      },
    });
    const tooltip = wrapper.get('[role="tooltip"]');
    expect(tooltip.attributes("aria-labelledby")).toBe("test");
  });

  it("supports a DOM ref exposure", () => {
    const wrapper = mount(Tooltip as any, {
      slots: {
        default: () => "This is a tooltip",
      },
    });
    const tooltip = wrapper.get('[role="tooltip"]');
    expect((wrapper.vm as any).UNSAFE_getDOMNode()).toBe(tooltip.element);
  });

  it("renders semantic icon variants", () => {
    const wrapper = mount(Tooltip as any, {
      props: {
        variant: "info",
        showIcon: true,
      },
      slots: {
        default: () => "Info",
      },
    });
    expect(wrapper.find(".spectrum-Tooltip-typeIcon").exists()).toBe(true);
  });
});
