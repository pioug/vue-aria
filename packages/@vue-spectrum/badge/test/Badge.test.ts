import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import { describe, expect, it } from "vitest";
import { Text } from "@vue-spectrum/text";
import { Badge } from "../src";

const CheckmarkCircle = defineComponent({
  name: "CheckmarkCircle",
  setup() {
    return () => h("svg", { role: "img", "aria-hidden": "true" });
  },
});

describe("Badge", () => {
  it("supports text-only content", () => {
    const wrapper = mount(Badge, {
      props: {
        "data-testid": "badge",
      } as Record<string, unknown>,
      slots: {
        default: () => "Badge of honor",
      },
    });

    const badge = wrapper.get("[data-testid=\"badge\"]");
    expect(badge.text()).toContain("Badge of honor");
  });

  it("supports icon-only content", () => {
    const wrapper = mount(Badge, {
      props: {
        "data-testid": "badge",
      } as Record<string, unknown>,
      slots: {
        default: () => [h(CheckmarkCircle)],
      },
    });

    const badge = wrapper.get("[data-testid=\"badge\"]");
    expect(badge.find("[role=\"img\"]").exists()).toBe(true);
  });

  it("supports icon and text content together", () => {
    const wrapper = mount(Badge, {
      props: {
        "data-testid": "badge",
      } as Record<string, unknown>,
      slots: {
        default: () => [h(CheckmarkCircle), h(Text, null, () => "Badge of honor")],
      },
    });

    const badge = wrapper.get("[data-testid=\"badge\"]");
    expect(badge.find("[role=\"img\"]").exists()).toBe(true);
    expect(badge.text()).toContain("Badge of honor");
  });

  it("exposes UNSAFE_getDOMNode through component refs", () => {
    const badgeRef = ref<{ UNSAFE_getDOMNode: () => HTMLElement | null } | null>(
      null
    );
    const App = defineComponent({
      name: "BadgeRefTestApp",
      setup() {
        return () =>
          h(
            Badge,
            {
              ref: badgeRef,
              "data-testid": "badge",
            },
            () => "Badge of honor"
          );
      },
    });

    const wrapper = mount(App);
    const badge = wrapper.findComponent(Badge);
    expect(badgeRef.value?.UNSAFE_getDOMNode()).toBe(badge.element);
  });
});
