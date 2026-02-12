import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { Well } from "../src";

describe("Well", () => {
  it("supports UNSAFE_className", () => {
    const wrapper = mount(Well, {
      props: {
        UNSAFE_className: "myClass",
        "data-testid": "well-vue",
      } as Record<string, unknown>,
      slots: {
        default: () => "My Well",
      },
    });

    const className = wrapper.get("[data-testid=\"well-vue\"]").attributes("class");
    expect(className).toContain("spectrum-Well");
    expect(className).toContain("myClass");
  });

  it("supports additional properties", () => {
    const wrapper = mount(Well, {
      props: {
        "data-testid": "well-vue",
      } as Record<string, unknown>,
      slots: {
        default: () => "My Well",
      },
    });

    expect(wrapper.get("[data-testid=\"well-vue\"]").attributes("data-testid")).toBe(
      "well-vue"
    );
  });

  it("supports children", () => {
    const wrapper = mount(Well, {
      slots: {
        default: () => "My Well",
      },
    });

    expect(wrapper.text()).toContain("My Well");
  });

  it("v3 forward ref exists and supports children and props", () => {
    const wellRef = ref<{ UNSAFE_getDOMNode: () => HTMLElement | null } | null>(
      null
    );
    const App = defineComponent({
      name: "WellRefTestApp",
      setup() {
        return () =>
          h(
            Well,
            {
              ref: wellRef,
              "data-testid": "well-forward-ref",
            },
            () => "Well Text"
          );
      },
    });

    const wrapper = mount(App);
    const well = wrapper.findComponent(Well);

    expect(wellRef.value?.UNSAFE_getDOMNode()).toBe(well.element);
    expect(wellRef.value?.UNSAFE_getDOMNode()?.textContent).toContain("Well Text");
    expect(wellRef.value?.UNSAFE_getDOMNode()?.getAttribute("data-testid")).toBe(
      "well-forward-ref"
    );
  });

  it("v3 supports aria-label with a role", () => {
    const wrapper = mount(Well, {
      props: {
        role: "region",
        "aria-label": "well",
      } as Record<string, unknown>,
      slots: {
        default: () => "Well",
      },
    });

    expect(wrapper.attributes("role")).toBe("region");
    expect(wrapper.attributes("aria-label")).toBe("well");
  });

  it("v3 warns user if label is provided without a role", () => {
    const spyWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    mount(Well, {
      props: {
        "aria-label": "well",
      } as Record<string, unknown>,
      slots: {
        default: () => "Well",
      },
    });

    expect(spyWarn).toHaveBeenCalledWith("A labelled Well must have a role.");
    spyWarn.mockRestore();
  });
});
