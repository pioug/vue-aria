import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import { describe, expect, it } from "vitest";
import { DEFAULT_SPECTRUM_THEME_CLASS_MAP, Provider } from "@vue-spectrum/provider";
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

  it.each([
    ["info", "i"],
    ["positive", "✓"],
    ["negative", "!"],
  ] as const)(
    "renders a %s variant icon when showIcon is true",
    (variant, symbol) => {
      const wrapper = mount(Tooltip, {
        props: {
          showIcon: true,
          variant,
        },
        slots: {
          default: () => "Tooltip content",
        },
      });

      const icon = wrapper.get(".spectrum-Tooltip-typeIcon");
      expect(icon.attributes("aria-hidden")).toBe("true");
      expect(icon.text()).toBe(symbol);
    }
  );

  it("does not render a variant icon for neutral variant", () => {
    const wrapper = mount(Tooltip, {
      props: {
        showIcon: true,
        variant: "neutral",
      },
      slots: {
        default: () => "Tooltip content",
      },
    });

    expect(wrapper.find(".spectrum-Tooltip-typeIcon").exists()).toBe(false);
  });

  it("maps start/end placement to logical left/right in LTR", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: DEFAULT_SPECTRUM_THEME_CLASS_MAP,
      },
      slots: {
        default: () =>
          h(
            Tooltip,
            {
              isOpen: true,
              placement: "start",
            },
            {
              default: () => "This is a tooltip",
            }
          ),
      },
    });

    const tooltip = wrapper.get("[role=\"tooltip\"]");
    expect(tooltip.classes()).toContain("spectrum-Tooltip--left");
  });

  it("maps start/end placement to logical right/left in RTL", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: DEFAULT_SPECTRUM_THEME_CLASS_MAP,
        direction: "rtl",
      },
      slots: {
        default: () =>
          h(
            Tooltip,
            {
              isOpen: true,
              placement: "start",
            },
            {
              default: () => "This is a tooltip",
            }
          ),
      },
    });

    const tooltip = wrapper.get("[role=\"tooltip\"]");
    expect(tooltip.classes()).toContain("spectrum-Tooltip--right");
  });
});
