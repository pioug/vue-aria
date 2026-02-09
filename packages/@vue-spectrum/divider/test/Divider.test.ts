import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import { describe, expect, it } from "vitest";
import { Divider } from "../src";

describe("Divider", () => {
  it("renders horizontal separators in all size variants", () => {
    const cases = [
      { size: undefined, className: "spectrum-Rule--large" },
      { size: "M" as const, className: "spectrum-Rule--medium" },
      { size: "S" as const, className: "spectrum-Rule--small" },
    ];

    for (const testCase of cases) {
      const wrapper = mount(Divider, {
        props: {
          size: testCase.size,
          "aria-label": "divides",
        } as Record<string, unknown>,
      });

      expect(wrapper.element.tagName.toLowerCase()).toBe("hr");
      expect(wrapper.attributes("aria-label")).toBe("divides");
      expect(wrapper.attributes("aria-orientation")).toBeUndefined();
      expect(wrapper.classes()).toContain(testCase.className);
    }
  });

  it("renders vertical separators with aria-orientation", () => {
    const cases = [
      { size: undefined, className: "spectrum-Rule--large" },
      { size: "M" as const, className: "spectrum-Rule--medium" },
      { size: "S" as const, className: "spectrum-Rule--small" },
    ];

    for (const testCase of cases) {
      const wrapper = mount(Divider, {
        props: {
          orientation: "vertical",
          size: testCase.size,
          "aria-label": "divides",
        } as Record<string, unknown>,
      });

      expect(wrapper.element.tagName.toLowerCase()).toBe("div");
      expect(wrapper.attributes("role")).toBe("separator");
      expect(wrapper.attributes("aria-orientation")).toBe("vertical");
      expect(wrapper.attributes("aria-label")).toBe("divides");
      expect(wrapper.classes()).toContain(testCase.className);
    }
  });

  it("supports aria-labelledby", () => {
    const App = defineComponent({
      name: "DividerAriaLabelledbyTestApp",
      setup() {
        return () =>
          h("div", [
            h("span", { id: "test" }, "Test"),
            h(Divider, {
              orientation: "vertical",
              "aria-labelledby": "test",
            }),
          ]);
      },
    });

    const wrapper = mount(App);
    const divider = wrapper.findComponent(Divider);

    expect(divider.attributes("aria-labelledby")).toBe("test");
  });

  it("supports custom data attributes", () => {
    const wrapper = mount(Divider, {
      props: {
        orientation: "vertical",
        "data-testid": "test",
      } as Record<string, unknown>,
    });

    expect(wrapper.attributes("data-testid")).toBe("test");
  });

  it("does not include aria-orientation by default", () => {
    const wrapper = mount(Divider, {
      props: {
        "aria-label": "divides",
      } as Record<string, unknown>,
    });

    expect(wrapper.attributes("aria-orientation")).toBeUndefined();
  });

  it("exposes UNSAFE_getDOMNode through component refs", () => {
    const dividerRef = ref<{ UNSAFE_getDOMNode: () => HTMLElement | null } | null>(
      null
    );
    const App = defineComponent({
      name: "DividerRefTestApp",
      setup() {
        return () => h(Divider, { ref: dividerRef, "aria-label": "divides" });
      },
    });

    const wrapper = mount(App);
    const divider = wrapper.findComponent(Divider);
    expect(dividerRef.value?.UNSAFE_getDOMNode()).toBe(divider.element);
  });
});
