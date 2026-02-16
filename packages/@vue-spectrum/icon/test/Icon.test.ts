import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { Icon, UIIcon, Illustration } from "../src";

describe("Icon", () => {
  it("renders icon span", () => {
    const wrapper = mount(Icon, {
      props: { alt: "info" },
      attrs: { "data-testid": "icon" },
    });

    expect(wrapper.get('[data-testid="icon"]').element.tagName).toBe("SPAN");
    expect(wrapper.get('[data-testid="icon"]').classes()).toContain("spectrum-Icon");
    expect(wrapper.get('[data-testid="icon"]').attributes("aria-label")).toBe("info");
  });

  it("supports UIIcon and Illustration", () => {
    const ui = mount(UIIcon, { attrs: { "data-testid": "ui" } });
    const img = mount(Illustration, { attrs: { "data-testid": "illus" } });

    expect(ui.get('[data-testid="ui"]').classes()).toContain("spectrum-UIIcon");
    expect(img.get('[data-testid="illus"]').classes()).toContain("spectrum-Illustration");
  });
});
