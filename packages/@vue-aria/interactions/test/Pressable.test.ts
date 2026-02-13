import { h } from "vue";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { Pressable } from "../src/Pressable";

describe("Pressable", () => {
  it("automatically makes child focusable", () => {
    const wrapper = mount(Pressable, {
      slots: {
        default: () => [h("span", { role: "button" }, "Button")],
      },
    });

    expect(wrapper.get('[role="button"]').attributes("tabindex")).toBe("0");
  });
});
