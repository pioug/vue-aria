import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { h, nextTick } from "vue";
import { ActionButton } from "../src/ActionButton";
import { pressElement } from "./helpers";

describe("ActionButton", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("handles defaults", async () => {
    const onPress = vi.fn();
    const wrapper = mount(ActionButton as any, {
      props: {
        onPress,
      },
      slots: {
        default: () => "Click Me",
      },
      attachTo: document.body,
    });

    const button = wrapper.get("button");
    await pressElement(button);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(button.attributes("aria-pressed")).toBeUndefined();
    expect(button.attributes("aria-checked")).toBeUndefined();
  });

  it("allows custom props to pass through", () => {
    const wrapper = mount(ActionButton as any, {
      attrs: {
        "data-foo": "bar",
      },
      slots: {
        default: () => "Click Me",
      },
    });

    expect(wrapper.get("button").attributes("data-foo")).toBe("bar");
  });

  it("applies quiet and static color classes", () => {
    const wrapper = mount(ActionButton as any, {
      props: {
        isQuiet: true,
        staticColor: "white",
      },
      slots: {
        default: () => "Edit",
      },
    });

    const button = wrapper.get("button");
    expect(button.classes()).toContain("spectrum-ActionButton--quiet");
    expect(button.classes()).toContain("spectrum-ActionButton--staticColor");
    expect(button.classes()).toContain("spectrum-ActionButton--staticWhite");
  });

  it("renders hold affordance and supports hideButtonText content", async () => {
    const wrapper = mount(ActionButton as any, {
      props: {
        holdAffordance: true,
        hideButtonText: true,
      },
      slots: {
        default: () => [
          h("span", { class: "spectrum-Icon", "aria-hidden": "true" }, "✎"),
          h("span", null, "Edit"),
        ],
      },
    });

    await nextTick();
    expect(wrapper.find(".spectrum-ActionButton-hold").exists()).toBe(true);
    expect(wrapper.find(".spectrum-Icon").exists()).toBe(true);
  });
});
