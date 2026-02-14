import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
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
});
