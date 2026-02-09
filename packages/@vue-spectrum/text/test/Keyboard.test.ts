import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { Keyboard } from "../src";

describe("Keyboard", () => {
  it("renders keyboard semantics via kbd", () => {
    const wrapper = mount(Keyboard, {
      attrs: {
        "data-testid": "kbd",
      },
      slots: {
        default: "Cmd+K",
      },
    });

    const keyboard = wrapper.get("kbd");
    expect(keyboard.attributes("data-testid")).toBe("kbd");
    expect(keyboard.text()).toBe("Cmd+K");
  });
});
