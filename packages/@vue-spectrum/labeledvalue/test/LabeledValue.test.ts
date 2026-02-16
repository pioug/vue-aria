import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { LabeledValue } from "../src";

describe("LabeledValue", () => {
  it("renders labeled value", () => {
    const wrapper = mount(LabeledValue, {
      attrs: {
        "data-testid": "labeled-value",
      },
      slots: {
        default: () => "value",
      },
    });

    const el = wrapper.get('[data-testid="labeled-value"]');
    expect(el.element.tagName).toBe("SPAN");
    expect(el.text()).toBe("value");
    expect(el.classes()).toContain("spectrum-LabeledValue");
  });
});
