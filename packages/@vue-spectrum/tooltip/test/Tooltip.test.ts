import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import { describe, expect, it } from "vitest";
import { Tooltip } from "../src";

describe("Tooltip", () => {
  it("supports children", () => {
    const wrapper = mount(Tooltip, {
      slots: {
        default: () => "This is a tooltip",
      },
    });

    const tooltip = wrapper.get("[role=\"tooltip\"]");
    expect(tooltip.attributes("role")).toBe("tooltip");
    expect(tooltip.text()).toContain("This is a tooltip");
  });

  it("supports aria-label", () => {
    const wrapper = mount(Tooltip, {
      props: {
        "aria-label": "Tooltip",
      } as Record<string, unknown>,
    });

    const tooltip = wrapper.get("[role=\"tooltip\"]");
    expect(tooltip.attributes("aria-label")).toBe("Tooltip");
  });

  it("supports aria-labelledby", () => {
    const wrapper = mount(Tooltip, {
      props: {
        "aria-labelledby": "test",
      } as Record<string, unknown>,
    });

    const tooltip = wrapper.get("[role=\"tooltip\"]");
    expect(tooltip.attributes("aria-labelledby")).toBe("test");
  });

  it("supports a ref", () => {
    const tooltipRef = ref<{ UNSAFE_getDOMNode: () => HTMLElement | null } | null>(
      null
    );
    const App = defineComponent({
      name: "TooltipRefApp",
      setup() {
        return () =>
          h(
            Tooltip,
            {
              ref: tooltipRef,
            },
            {
              default: () => "This is a tooltip",
            }
          );
      },
    });

    const wrapper = mount(App);
    const tooltip = wrapper.get("[role=\"tooltip\"]");
    expect(tooltipRef.value?.UNSAFE_getDOMNode()).toBe(tooltip.element);
  });
});
