import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it } from "vitest";
import { Badge } from "../src";

describe("Badge", () => {
  it("renders text-only badge content", () => {
    const wrapper = mount(Badge, {
      slots: {
        default: () => ["Badge of honor"],
      },
      attrs: {
        "data-testid": "badge",
      },
    });

    const badge = wrapper.get('[data-testid="badge"]');
    expect(badge.text()).toBe("Badge of honor");
    expect(badge.attributes("role")).toBe("presentation");
  });

  it("renders icon-only badge content", () => {
    const wrapper = mount(Badge, {
      slots: {
        default: () => [h("span", { role: "img", "aria-hidden": "true" })],
      },
      attrs: {
        "data-testid": "badge",
      },
    });

    expect(wrapper.get('[data-testid="badge"]').find('[role="img"]').exists()).toBe(true);
  });

  it("renders icon + text badge content", () => {
    const wrapper = mount(Badge, {
      slots: {
        default: () => [h("span", { role: "img", "aria-hidden": "true" }), "Badge of honor"],
      },
      attrs: {
        "data-testid": "badge",
      },
    });

    const badge = wrapper.get('[data-testid="badge"]');
    expect(badge.find('[role="img"]').exists()).toBe(true);
    expect(badge.text()).toBe("Badge of honor");
  });

  it("applies custom class names", () => {
    const wrapper = mount(Badge, {
      props: {
        UNSAFE_className: "my-badge",
      },
      attrs: {
        "data-testid": "badge",
      },
    });
    expect(wrapper.get('[data-testid="badge"]').classes()).toContain("my-badge");
  });

  it("applies variant classes", () => {
    const wrapper = mount(Badge, {
      props: {
        variant: "positive",
      },
      slots: {
        default: () => ["5"],
      },
    });
    expect(wrapper.classes()).toContain("spectrum-Badge--positive");
  });

  it("falls back to count when no slot content is provided", () => {
    const wrapper = mount(Badge, {
      props: {
        count: 3,
      },
    });
    expect(wrapper.text()).toBe("3");
  });
});
