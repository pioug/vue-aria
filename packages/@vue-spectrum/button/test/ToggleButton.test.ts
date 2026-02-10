import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { ToggleButton } from "../src";

describe("ToggleButton", () => {
  it("handles defaults", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    const onChange = vi.fn();
    const wrapper = mount(ToggleButton, {
      props: {
        onPress,
        onChange,
      },
      slots: {
        default: () => "Click Me",
      },
    });

    const button = wrapper.get("button");
    expect(button.attributes("aria-pressed")).toBe("false");

    await user.click(button.element);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(button.attributes("aria-pressed")).toBe("true");
  });

  it("supports defaultSelected", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    const onChange = vi.fn();
    const wrapper = mount(ToggleButton, {
      props: {
        defaultSelected: true,
        onPress,
        onChange,
      },
      slots: {
        default: () => "Click Me",
      },
    });

    const button = wrapper.get("button");
    expect(button.attributes("aria-pressed")).toBe("true");

    await user.click(button.element);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(false);
    expect(button.attributes("aria-pressed")).toBe("false");
  });

  it("supports isSelected", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    const onChange = vi.fn();
    const wrapper = mount(ToggleButton, {
      props: {
        isSelected: true,
        onPress,
        onChange,
      },
      slots: {
        default: () => "Click Me",
      },
    });

    const button = wrapper.get("button");
    expect(button.attributes("aria-pressed")).toBe("true");

    await user.click(button.element);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(false);
    expect(button.attributes("aria-pressed")).toBe("true");
  });

  it("allows custom props to be passed through", () => {
    const wrapper = mount(ToggleButton, {
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
