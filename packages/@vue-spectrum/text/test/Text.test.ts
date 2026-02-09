import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { Text } from "../src";

describe("Text", () => {
  it("renders a span with role none", () => {
    const wrapper = mount(Text, {
      attrs: {
        "data-testid": "text",
      },
      slots: {
        default: "Plain text",
      },
    });

    const text = wrapper.get("span");
    expect(text.attributes("role")).toBe("none");
    expect(text.attributes("data-testid")).toBe("text");
    expect(text.text()).toBe("Plain text");
  });

  it("allows explicit role override", () => {
    const wrapper = mount(Text, {
      attrs: {
        role: "presentation",
      },
      slots: {
        default: "Role override",
      },
    });

    expect(wrapper.get("span").attributes("role")).toBe("presentation");
  });
});
