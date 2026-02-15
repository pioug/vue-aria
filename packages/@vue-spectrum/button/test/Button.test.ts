import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
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
  ])("$name supports aria-describedby", ({ component }) => {
    const wrapper = mount({
      components: {
        UnderTest: component,
      },
      template: '<div><span id="test">Test</span><UnderTest aria-describedby="test">Hi</UnderTest></div>',
    });

    const button = getControl(wrapper);
    expect(button.attributes("aria-describedby")).toBe("test");
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

  it.each([
    { name: "ActionButton", component: ActionButton },
    { name: "Button", component: Button },
    { name: "LogicButton", component: LogicButton },
  ])("$name keyboard press and key events", async ({ component }) => {
    const onPress = vi.fn();
    const onPressStart = vi.fn();
    const onPressEnd = vi.fn();
    const onPressUp = vi.fn();
    const onPressChange = vi.fn();
    const onKeyDown = vi.fn();
    const onKeyUp = vi.fn();
    const wrapper = mount(component as any, {
      props: {
        onPress,
        onPressStart,
        onPressEnd,
        onPressUp,
        onPressChange,
        onKeyDown,
        onKeyUp,
      },
      slots: {
        default: () => "Click Me",
      },
      attachTo: document.body,
    });

    const button = getControl(wrapper).element as HTMLElement;
    button.focus();
    button.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
    button.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true, cancelable: true }));
    await nextTick();

    expect(onPressStart).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPressEnd).toHaveBeenCalledTimes(1);
    expect(onPressUp).toHaveBeenCalledTimes(1);
    expect(onPressChange).toHaveBeenCalledTimes(2);
    expect(onKeyDown).toHaveBeenCalled();
    expect(onKeyUp).toHaveBeenCalled();
  });

  it("prevents default for non-submit types", async () => {
    const wrapper = mount(Button as any, {
      slots: {
        default: () => "Click Me",
      },
      attachTo: document.body,
    });

    const button = getControl(wrapper).element as HTMLButtonElement;
    button.focus();
    const keyDown = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    const keyUp = new KeyboardEvent("keyup", { key: "Enter", bubbles: true, cancelable: true });
    button.dispatchEvent(keyDown);
    button.dispatchEvent(keyUp);
    expect(keyDown.defaultPrevented).toBe(true);
    expect(keyUp.defaultPrevented).toBe(true);

    const spaceDown = new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true });
    const spaceUp = new KeyboardEvent("keyup", { key: " ", bubbles: true, cancelable: true });
    button.dispatchEvent(spaceDown);
    button.dispatchEvent(spaceUp);
    expect(spaceDown.defaultPrevented).toBe(true);
    expect(spaceUp.defaultPrevented).toBe(true);
  });

  it("submit in form using space does not prevent keyup default", async () => {
    const wrapper = mount({
      setup() {
        return () => h("form", null, [h(Button as any, { type: "submit" }, { default: () => "Click Me" })]);
      },
    }, {
      attachTo: document.body,
    });

    const button = getControl(wrapper).element as HTMLButtonElement;
    button.focus();
    const spaceUp = new KeyboardEvent("keyup", { key: " ", bubbles: true, cancelable: true });
    button.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true }));
    button.dispatchEvent(spaceUp);
    expect(spaceUp.defaultPrevented).toBe(false);
  });

  it("submit in form using enter does not prevent keydown default", async () => {
    const wrapper = mount({
      setup() {
        return () => h("form", null, [h(Button as any, { type: "submit" }, { default: () => "Click Me" })]);
      },
    }, {
      attachTo: document.body,
    });

    const button = getControl(wrapper).element as HTMLButtonElement;
    button.focus();
    const enterDown = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    button.dispatchEvent(enterDown);
    button.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true, cancelable: true }));
    expect(enterDown.defaultPrevented).toBe(false);
  });

  it("maps docs visual variants and icon-only affordances to expected attributes/classes", async () => {
    const ctaWrapper = mount(Button as any, {
      props: {
        variant: "cta",
      },
      slots: {
        default: () => "Save",
      },
    });
    const ctaButton = getControl(ctaWrapper);
    await nextTick();
    expect(ctaButton.attributes("data-variant")).toBe("accent");
    expect(ctaButton.attributes("data-style")).toBe("fill");

    const overBackgroundWrapper = mount(Button as any, {
      props: {
        variant: "overBackground",
      },
      attrs: {
        "aria-label": "Notifications",
      },
      slots: {
        default: () => h("span", { class: "spectrum-Icon", "aria-hidden": "true" }, "🔔"),
      },
    });
    const overBackgroundButton = getControl(overBackgroundWrapper);
    await nextTick();
    expect(overBackgroundButton.attributes("data-variant")).toBe("primary");
    expect(overBackgroundButton.attributes("data-style")).toBe("outline");
    expect(overBackgroundButton.attributes("data-static-color")).toBe("white");

    const staticColorWrapper = mount(Button as any, {
      props: {
        variant: "primary",
        style: "fill",
        staticColor: "black",
      },
      slots: {
        default: () => "Save",
      },
    });
    const staticColorButton = getControl(staticColorWrapper);
    await nextTick();
    expect(staticColorButton.attributes("data-variant")).toBe("primary");
    expect(staticColorButton.attributes("data-style")).toBe("fill");
    expect(staticColorButton.attributes("data-static-color")).toBe("black");
  });

  it("displays a spinner after delay when isPending becomes true", async () => {
    vi.useFakeTimers();
    const onPress = vi.fn();
    const wrapper = mount(
      defineComponent({
        setup() {
          const pending = ref(false);
          return () =>
            h(
              Button as any,
              {
                isPending: pending.value,
                onPress: () => {
                  pending.value = true;
                  onPress();
                },
              },
              { default: () => "Click me" }
            );
        },
      }),
      {
        attachTo: document.body,
      }
    );

    const button = getControl(wrapper);
    expect(button.attributes("aria-disabled")).toBeUndefined();
    await pressElement(button);
    await nextTick();
    expect(button.attributes("aria-disabled")).toBe("true");
    const progress = wrapper.get('[role="progressbar"]');
    const loader = wrapper.get(".spectrum-Button-circleLoader");
    expect((loader.element as HTMLElement).style.visibility).toBe("hidden");

    await pressElement(button);
    vi.advanceTimersByTime(1000);
    await nextTick();

    expect((loader.element as HTMLElement).style.visibility).toBe("visible");
    expect(onPress).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("removes href from anchor when isPending is true", () => {
    const wrapper = mount(Button as any, {
      props: {
        elementType: "a",
        href: "//example.com",
        isPending: true,
      },
      slots: {
        default: () => "Click Me",
      },
    });

    const button = getControl(wrapper);
    expect(button.attributes("href")).toBeUndefined();
  });
});
