import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { describe, expect, it } from "vitest";
import { DismissButton } from "../src/DismissButton";

describe("DismissButton", () => {
  it("has default aria-label", () => {
    const wrapper = mount(DismissButton, { attachTo: document.body });
    const button = wrapper.get("button");
    expect(button.attributes("aria-label")).toBe("Dismiss");
    wrapper.unmount();
  });

  it("accepts aria-label", () => {
    const wrapper = mount(DismissButton, {
      attrs: { "aria-label": "foo" },
      attachTo: document.body,
    });
    const button = wrapper.get("button");
    expect(button.attributes("aria-label")).toBe("foo");
    wrapper.unmount();
  });

  it("accepts aria-labelledby and aria-label", () => {
    const Example = defineComponent({
      setup() {
        return () =>
          h("div", [
            h("span", { id: "span-id" }, "bar"),
            h(DismissButton, { "aria-labelledby": "span-id", "aria-label": "foo", id: "self" }),
          ]);
      },
    });

    const wrapper = mount(Example, { attachTo: document.body });
    const button = wrapper.get("button");
    expect(button.attributes("aria-labelledby")).toContain("self");
    expect(button.attributes("aria-labelledby")).toContain("span-id");
    expect(button.attributes("aria-label")).toBe("foo");
    wrapper.unmount();
  });
});
