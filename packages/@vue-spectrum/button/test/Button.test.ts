import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { nextTick, type Component } from "vue";
import { describe, expect, it, vi } from "vitest";
import {
  ActionButton,
  Button,
  ClearButton,
  LogicButton,
  ToggleButton,
} from "../src";

function getInteractiveElement(wrapper: ReturnType<typeof mount>) {
  return wrapper.get("button, [role='button'], a, div");
}

describe("Button package", () => {
  it.each([
    ["ActionButton", ActionButton],
    ["Button", Button],
    ["LogicButton", LogicButton],
  ])("%s handles defaults", async (_name, component) => {
    const onPress = vi.fn();
    const wrapper = mount(component as Component, {
      props: {
        onPress,
      },
      slots: {
        default: () => "Click Me",
      },
    });

    const user = userEvent.setup();
    await user.click(getInteractiveElement(wrapper).element);

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toContain("Click Me");
  });

  it.each([
    ["ActionButton", ActionButton],
    ["Button", Button],
    ["ClearButton", ClearButton],
    ["LogicButton", LogicButton],
  ])("%s forwards custom DOM props", (_name, component) => {
    const wrapper = mount(component as Component, {
      props: {
        "data-foo": "bar",
      } as Record<string, unknown>,
      slots: {
        default: () => "Click Me",
      },
    });

    expect(getInteractiveElement(wrapper).attributes("data-foo")).toBe("bar");
  });

  it.each([
    ["ActionButton", ActionButton],
    ["Button", Button],
    ["ClearButton", ClearButton],
    ["LogicButton", LogicButton],
  ])("%s supports aria-label", (_name, component) => {
    const wrapper = mount(component as Component, {
      props: {
        "aria-label": "Label",
      } as Record<string, unknown>,
      slots: {
        default: () => "Click Me",
      },
    });

    expect(getInteractiveElement(wrapper).attributes("aria-label")).toBe("Label");
  });

  it.each([
    ["ActionButton", ActionButton],
    ["Button", Button],
    ["ClearButton", ClearButton],
    ["LogicButton", LogicButton],
  ])("%s supports UNSAFE_className", (_name, component) => {
    const wrapper = mount(component as Component, {
      props: {
        UNSAFE_className: "custom-class",
      },
      slots: {
        default: () => "Click Me",
      },
    });

    expect(getInteractiveElement(wrapper).attributes("class")).toContain("custom-class");
  });

  it("Button supports elementType='a' with href", async () => {
    const onPress = vi.fn();
    const user = userEvent.setup();
    const wrapper = mount(Button, {
      props: {
        elementType: "a",
        href: "#only-hash-in-jsdom",
        onPress,
      },
      slots: {
        default: () => "Click Me",
      },
    });

    const element = getInteractiveElement(wrapper);
    expect(element.element.tagName).toBe("A");
    expect(element.attributes("href")).toBe("#only-hash-in-jsdom");

    await user.click(element.element);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["ActionButton", ActionButton],
    ["Button", Button],
    ["ClearButton", ClearButton],
    ["LogicButton", LogicButton],
  ])("%s does not respond when disabled", async (_name, component) => {
    const onPress = vi.fn();
    const user = userEvent.setup();
    const wrapper = mount(component as Component, {
      props: {
        isDisabled: true,
        onPress,
      },
      slots: {
        default: () => "Click Me",
      },
    });

    await user.click(getInteractiveElement(wrapper).element);
    expect(onPress).not.toHaveBeenCalled();
  });

  it.each([
    ["ActionButton", ActionButton],
    ["Button", Button],
    ["LogicButton", LogicButton],
  ])("%s supports autoFocus", async (_name, component) => {
    const wrapper = mount(component as Component, {
      attachTo: document.body,
      props: {
        autoFocus: true,
      },
      slots: {
        default: () => "Click Me",
      },
    });

    await nextTick();
    await nextTick();
    expect(document.activeElement).toBe(getInteractiveElement(wrapper).element);
  });

  it("ToggleButton toggles selection and calls onChange", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const wrapper = mount(ToggleButton, {
      props: {
        onChange,
      },
      slots: {
        default: () => "Toggle",
      },
    });

    const button = getInteractiveElement(wrapper);
    expect(button.attributes("aria-pressed")).toBe("false");

    await user.click(button.element);
    expect(button.attributes("aria-pressed")).toBe("true");
    expect(onChange).toHaveBeenNthCalledWith(1, true);

    await user.click(button.element);
    expect(button.attributes("aria-pressed")).toBe("false");
    expect(onChange).toHaveBeenNthCalledWith(2, false);
  });
});
