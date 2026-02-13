import { defineComponent, h, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { VisuallyHidden } from "../src";

function Example(props: { isFocusable?: boolean }) {
  return defineComponent({
    setup() {
      return () =>
        h("div", [
          h("button", "This is button A"),
          h(
            VisuallyHidden,
            { isFocusable: props.isFocusable },
            {
              default: () => [
                h(
                  "button",
                  props.isFocusable
                    ? "With isFocusable, I should show my text on focus"
                    : "With no isFocusable, I should not show my text on focus"
                ),
              ],
            }
          ),
          h("button", "This is button C"),
        ]);
    },
  });
}

describe("VisuallyHidden", () => {
  it("hides element", async () => {
    const wrapper = mount(Example({ isFocusable: false }), { attachTo: document.body });

    const buttons = wrapper.findAll("button");
    const hiddenContainer = buttons[1]?.element.parentElement as HTMLElement;
    const hiddenStyle = hiddenContainer.getAttribute("style") ?? "";

    expect(hiddenStyle.length).toBeGreaterThan(0);

    (buttons[1]?.element as HTMLButtonElement).focus();
    await nextTick();

    expect(hiddenContainer.getAttribute("style")).toBe(hiddenStyle);

    wrapper.unmount();
  });

  it("unhides element if focused and isFocusable", async () => {
    const wrapper = mount(Example({ isFocusable: true }), { attachTo: document.body });

    const buttons = wrapper.findAll("button");
    const hiddenContainer = buttons[1]?.element.parentElement as HTMLElement;
    const hiddenStyle = hiddenContainer.getAttribute("style") ?? "";

    expect(hiddenStyle.length).toBeGreaterThan(0);

    (buttons[1]?.element as HTMLButtonElement).focus();
    await nextTick();

    expect(hiddenContainer.getAttribute("style") ?? "").not.toBe(hiddenStyle);
    expect(hiddenContainer.getAttribute("style") ?? "").toBe("");

    wrapper.unmount();
  });
});
