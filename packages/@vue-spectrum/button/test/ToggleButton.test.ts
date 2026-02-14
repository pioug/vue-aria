import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { ToggleButton } from "../src/ToggleButton";
import { pressElement } from "./helpers";

describe("ToggleButton", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("handles defaults", async () => {
    const onPress = vi.fn();
    const onChange = vi.fn();
    const wrapper = mount(ToggleButton as any, {
      props: {
        onPress,
        onChange,
      },
      slots: {
        default: () => "Click Me",
      },
      attachTo: document.body,
    });

    const button = wrapper.get("button");
    expect(button.attributes("aria-pressed")).toBe("false");

    await pressElement(button);
    await nextTick();
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(button.attributes("aria-pressed")).toBe("true");
  });

  it("supports defaultSelected", async () => {
    const onPress = vi.fn();
    const onChange = vi.fn();
    const wrapper = mount(ToggleButton as any, {
      props: {
        defaultSelected: true,
        onPress,
        onChange,
      },
      slots: {
        default: () => "Click Me",
      },
      attachTo: document.body,
    });

    const button = wrapper.get("button");
    expect(button.attributes("aria-pressed")).toBe("true");

    await pressElement(button);
    await nextTick();
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(false);
    expect(button.attributes("aria-pressed")).toBe("false");
  });

  it("supports controlled isSelected", async () => {
    const onPress = vi.fn();
    const onChange = vi.fn();
    const wrapper = mount(ToggleButton as any, {
      props: {
        isSelected: true,
        onPress,
        onChange,
      },
      slots: {
        default: () => "Click Me",
      },
      attachTo: document.body,
    });

    const button = wrapper.get("button");
    expect(button.attributes("aria-pressed")).toBe("true");

    await pressElement(button);
    await nextTick();
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(false);
    expect(button.attributes("aria-pressed")).toBe("true");
  });

  it("allows custom props to be passed through", () => {
    const wrapper = mount(ToggleButton as any, {
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
