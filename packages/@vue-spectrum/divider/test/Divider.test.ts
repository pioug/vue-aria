import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { Divider } from "../src";

describe("Divider", () => {
  it("renders horizontal divider by default", () => {
    const wrapper = mount(Divider, {
      attrs: {
        "data-testid": "divider",
      },
    });
    const divider = wrapper.get('[data-testid="divider"]');
    expect(divider.element.tagName).toBe("HR");
    expect(divider.classes()).toContain("spectrum-Rule");
    expect(divider.classes()).toContain("spectrum-Rule--large");
    expect(divider.attributes("role")).toBeUndefined();
    expect(divider.attributes("aria-orientation")).toBeUndefined();
  });

  it("supports vertical orientation", () => {
    const wrapper = mount(Divider, {
      props: {
        orientation: "vertical",
      },
      attrs: {
        "data-testid": "divider",
      },
    });
    const divider = wrapper.get('[data-testid="divider"]');
    expect(divider.element.tagName).toBe("DIV");
    expect(divider.attributes("role")).toBe("separator");
    expect(divider.attributes("aria-orientation")).toBe("vertical");
    expect(divider.classes()).toContain("spectrum-Rule--vertical");
  });

  it("supports custom size", () => {
    const wrapper = mount(Divider, {
      props: {
        size: "S",
      },
      attrs: {
        "data-testid": "divider",
      },
    });
    const divider = wrapper.get('[data-testid="divider"]');
    expect(divider.classes()).toContain("spectrum-Rule--small");
  });

  it("supports aria-label and custom class name", () => {
    const wrapper = mount(Divider, {
      props: {
        UNSAFE_className: "my-divider",
      },
      attrs: {
        "data-testid": "divider",
        "aria-label": "divider",
      },
    });

    const divider = wrapper.get('[data-testid="divider"]');
    expect(divider.attributes("aria-label")).toBe("divider");
    expect(divider.classes()).toContain("my-divider");
  });

  it("supports custom data attributes", () => {
    const wrapper = mount(Divider, {
      props: {
        UNSAFE_className: "my-divider",
      },
      attrs: {
        "data-testid": "divider",
        "data-custom": "value",
      },
    });
    expect(wrapper.find("hr").classes()).toContain("my-divider");
    expect(wrapper.get('[data-testid="divider"]').attributes("data-custom")).toBe("value");
  });
});
