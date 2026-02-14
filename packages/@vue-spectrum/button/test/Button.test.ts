import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { ActionButton, Button, ClearButton, LogicButton } from "../src";
import { pressElement } from "./helpers";

function getControl(wrapper: ReturnType<typeof mount>) {
  return wrapper.get("button, a, div.spectrum-ClearButton, span.spectrum-ClearButton, input");
}

describe("Button", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it.each([
    { name: "ActionButton", component: ActionButton },
    { name: "Button", component: Button },
    { name: "LogicButton", component: LogicButton },
  ])("$name handles defaults", async ({ component }) => {
    const onPress = vi.fn();
    const wrapper = mount(component as any, {
      props: {
        onPress,
      },
      slots: {
        default: () => "Click Me",
      },
      attachTo: document.body,
    });

    const button = getControl(wrapper);
    await pressElement(button);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toContain("Click Me");
  });

  it.each([
    { name: "ActionButton", component: ActionButton },
    { name: "Button", component: Button },
    { name: "ClearButton", component: ClearButton },
    { name: "LogicButton", component: LogicButton },
  ])("$name allows custom props to pass through", ({ component }) => {
    const wrapper = mount(component as any, {
      attrs: {
        "data-foo": "bar",
      },
      slots: {
        default: () => "Click Me",
      },
    });

    const button = getControl(wrapper);
    expect(button.attributes("data-foo")).toBe("bar");
  });

  it.each([
    { name: "ActionButton", component: ActionButton },
    { name: "Button", component: Button },
    { name: "ClearButton", component: ClearButton },
    { name: "LogicButton", component: LogicButton },
  ])("$name supports aria-label", ({ component }) => {
    const wrapper = mount(component as any, {
      attrs: {
        "aria-label": "Test",
      },
    });

    const button = getControl(wrapper);
    expect(button.attributes("aria-label")).toBe("Test");
  });

  it.each([
    { name: "ActionButton", component: ActionButton },
    { name: "Button", component: Button },
    { name: "ClearButton", component: ClearButton },
    { name: "LogicButton", component: LogicButton },
  ])("$name supports aria-labelledby", ({ component }) => {
    const wrapper = mount({
      components: {
        UnderTest: component,
      },
      template: '<div><span id="test">Test</span><UnderTest aria-labelledby="test">Hi</UnderTest></div>',
    });

    const button = getControl(wrapper);
    expect(button.attributes("aria-labelledby")).toBe("test");
  });

  it.each([
    { name: "ActionButton", component: ActionButton },
    { name: "Button", component: Button },
    { name: "ClearButton", component: ClearButton },
    { name: "LogicButton", component: LogicButton },
  ])("$name allows a custom classname", ({ component }) => {
    const wrapper = mount(component as any, {
      props: {
        UNSAFE_className: "x-men-first-class",
      },
      slots: {
        default: () => "Click Me",
      },
    });

    const button = getControl(wrapper);
    expect(button.classes()).toContain("x-men-first-class");
  });

  it.each([
    { name: "ActionButton", component: ActionButton },
    { name: "Button", component: Button },
    { name: "LogicButton", component: LogicButton },
  ])("$name can have elementType=a", async ({ component }) => {
    const onPress = vi.fn();
    const wrapper = mount(component as any, {
      props: {
        onPress,
        elementType: "a",
      },
      slots: {
        default: () => "Click Me",
      },
      attachTo: document.body,
    });

    const button = getControl(wrapper);
    expect(button.attributes("tabindex")).toBe("0");
    expect(button.attributes("type")).toBeUndefined();

    await pressElement(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it.each([
    { name: "ActionButton", component: ActionButton },
    { name: "Button", component: Button },
    { name: "LogicButton", component: LogicButton },
  ])("$name can have elementType=a with href", async ({ component }) => {
    const onPress = vi.fn();
    const wrapper = mount(component as any, {
      props: {
        onPress,
        elementType: "a",
        href: "#only-hash-in-jsdom",
      },
      slots: {
        default: () => "Click Me",
      },
      attachTo: document.body,
    });

    const button = getControl(wrapper);
    expect(button.attributes("tabindex")).toBe("0");
    expect(button.attributes("href")).toBe("#only-hash-in-jsdom");

    await pressElement(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it.each([
    { name: "ActionButton", component: ActionButton },
    { name: "Button", component: Button },
    { name: "ClearButton", component: ClearButton },
    { name: "LogicButton", component: LogicButton },
  ])("$name does not respond when disabled", async ({ component }) => {
    const onPress = vi.fn();
    const wrapper = mount(component as any, {
      props: {
        onPress,
        isDisabled: true,
      },
      slots: {
        default: () => "Click Me",
      },
      attachTo: document.body,
    });

    const button = getControl(wrapper);
    await pressElement(button);
    expect(onPress).not.toHaveBeenCalled();
    expect(button.attributes("disabled") != null || button.attributes("aria-disabled") === "true").toBe(true);
  });

  it.each([
    { name: "ActionButton", component: ActionButton },
    { name: "Button", component: Button },
    { name: "LogicButton", component: LogicButton },
  ])("$name supports autoFocus", async ({ component }) => {
    const wrapper = mount(component as any, {
      props: {
        autoFocus: true,
      },
      slots: {
        default: () => "Click Me",
      },
      attachTo: document.body,
    });

    await nextTick();
    const button = getControl(wrapper).element as HTMLElement;
    expect(document.activeElement).toBe(button);
  });
});
