import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { ActionButton } from "../src";

describe("ActionButton", () => {
  it("handles defaults", async () => {
    const onPress = vi.fn();
    const user = userEvent.setup();
    const wrapper = mount(ActionButton, {
      props: {
        onPress,
      },
      slots: {
        default: () => "Click Me",
      },
    });

    const button = wrapper.get("button");
    await user.click(button.element);

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(button.attributes("aria-pressed")).toBeUndefined();
    expect(button.attributes("aria-checked")).toBeUndefined();
  });

  it("allows custom props to be passed through", () => {
    const wrapper = mount(ActionButton, {
      props: {
        "data-foo": "bar",
      } as Record<string, unknown>,
      slots: {
        default: () => "Click Me",
      },
    });

    expect(wrapper.get("button").attributes("data-foo")).toBe("bar");
  });
});
