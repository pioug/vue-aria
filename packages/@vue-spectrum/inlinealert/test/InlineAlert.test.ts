import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { InlineAlert } from "../src";

describe("InlineAlert", () => {
  it("renders with default and variant classes", () => {
    const wrapper = mount(InlineAlert, {
      attrs: { "data-testid": "alert" },
    });

    const alert = wrapper.get('[data-testid="alert"]');
    expect(alert.classes()).toContain("spectrum-InlineAlert");
    expect(alert.classes()).toContain("spectrum-InlineAlert--info");
  });

  it("supports custom variant", () => {
    const wrapper = mount(InlineAlert, {
      props: { variant: "negative" },
      attrs: { "data-testid": "alert" },
    });

    expect(wrapper.get('[data-testid="alert"]').classes()).toContain("spectrum-InlineAlert--negative");
  });
});
