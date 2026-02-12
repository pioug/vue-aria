import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref, type Component } from "vue";
import { describe, expect, it, vi } from "vitest";
import { provideI18n } from "@vue-aria/i18n";
import {
  ActionButton,
  Button,
  ClearButton,
  FieldButton,
  LogicButton,
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
    ["LogicButton", LogicButton],
  ])("%s supports press lifecycle events", async (_name, component) => {
    const onPress = vi.fn();
    const onPressStart = vi.fn();
    const onPressEnd = vi.fn();
    const onPressUp = vi.fn();
    const onPressChange = vi.fn();
    const wrapper = mount(component as Component, {
      props: {
        onPress,
        onPressStart,
        onPressEnd,
        onPressUp,
        onPressChange,
      },
      slots: {
        default: () => "Click Me",
      },
    });

    const user = userEvent.setup();
    await user.click(getInteractiveElement(wrapper).element);

    expect(onPressStart).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPressEnd).toHaveBeenCalledTimes(1);
    expect(onPressUp).toHaveBeenCalledTimes(1);
    expect(onPressChange).toHaveBeenCalledTimes(2);
    expect(onPressChange).toHaveBeenNthCalledWith(1, true);
    expect(onPressChange).toHaveBeenNthCalledWith(2, false);
  });

  it.each([
    ["ActionButton", ActionButton],
    ["Button", Button],
    ["LogicButton", LogicButton],
  ])("%s supports keyboard key events while preserving press behavior", async (_name, component) => {
    const onPress = vi.fn();
    const onKeydown = vi.fn();
    const onKeyup = vi.fn();
    const wrapper = mount(component as Component, {
      attachTo: document.body,
      props: {
        onPress,
        onKeydown,
        onKeyup,
      } as Record<string, unknown>,
      slots: {
        default: () => "Click Me",
      },
    });

    const user = userEvent.setup();
    const element = getInteractiveElement(wrapper);
    (element.element as HTMLElement).focus();
    onKeydown.mockClear();
    onKeyup.mockClear();

    await user.keyboard("{Enter}");
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onKeydown).toHaveBeenCalledTimes(1);
    expect(onKeyup).toHaveBeenCalledTimes(1);

    await user.keyboard("A");
    expect(onKeydown).toHaveBeenCalledTimes(2);
    expect(onKeyup).toHaveBeenCalledTimes(2);
  });

  it.each([
    ["ActionButton", ActionButton],
    ["Button", Button],
    ["ClearButton", ClearButton],
    ["FieldButton", FieldButton],
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
    ["FieldButton", FieldButton],
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
    ["FieldButton", FieldButton],
    ["LogicButton", LogicButton],
  ])("%s supports aria-labelledby", (_name, component) => {
    const wrapper = mount(component as Component, {
      props: {
        "aria-labelledby": "label-id",
      } as Record<string, unknown>,
      slots: {
        default: () => "Click Me",
      },
    });

    expect(getInteractiveElement(wrapper).attributes("aria-labelledby")).toBe("label-id");
  });

  it.each([
    ["ActionButton", ActionButton],
    ["Button", Button],
    ["ClearButton", ClearButton],
    ["FieldButton", FieldButton],
    ["LogicButton", LogicButton],
  ])("%s supports aria-describedby", (_name, component) => {
    const wrapper = mount(component as Component, {
      props: {
        "aria-describedby": "description-id",
      } as Record<string, unknown>,
      slots: {
        default: () => "Click Me",
      },
    });

    expect(getInteractiveElement(wrapper).attributes("aria-describedby")).toBe(
      "description-id"
    );
  });

  it.each([
    ["ActionButton", ActionButton],
    ["Button", Button],
    ["ClearButton", ClearButton],
    ["FieldButton", FieldButton],
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

  it.each([
    ["ActionButton", ActionButton],
    ["Button", Button],
    ["LogicButton", LogicButton],
  ])("%s can have elementType='a'", async (_name, component) => {
    const onPress = vi.fn();
    const user = userEvent.setup();
    const wrapper = mount(component as Component, {
      props: {
        elementType: "a",
        onPress,
      } as Record<string, unknown>,
      slots: {
        default: () => "Click Me",
      },
    });

    const element = getInteractiveElement(wrapper);
    expect(element.attributes("tabindex")).toBe("0");
    expect(element.attributes("type")).toBeUndefined();

    await user.click(element.element);
    expect(onPress).toHaveBeenCalledTimes(1);

    await element.trigger("keydown", { key: "Enter", repeat: false });
    expect(onPress).toHaveBeenCalledTimes(2);

    await element.trigger("keydown", { key: " " });
    await element.trigger("keyup", { key: " " });
    expect(onPress).toHaveBeenCalledTimes(3);
  });

  it.each([
    ["ActionButton", ActionButton],
    ["Button", Button],
    ["LogicButton", LogicButton],
  ])("%s can have elementType='a' with href", async (_name, component) => {
    const onPress = vi.fn();
    const user = userEvent.setup();
    const wrapper = mount(component as Component, {
      props: {
        elementType: "a",
        href: "#only-hash-in-jsdom",
        onPress,
      } as Record<string, unknown>,
      slots: {
        default: () => "Click Me",
      },
    });

    const element = getInteractiveElement(wrapper);
    expect(element.attributes("tabindex")).toBe("0");
    expect(element.attributes("href")).toBe("#only-hash-in-jsdom");

    await user.click(element.element);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["ActionButton", ActionButton],
    ["Button", Button],
    ["ClearButton", ClearButton],
    ["FieldButton", FieldButton],
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

    const element = getInteractiveElement(wrapper);
    await user.click(element.element);

    expect(onPress).not.toHaveBeenCalled();
  });

  it.each([
    ["ActionButton", ActionButton],
    ["Button", Button],
    ["FieldButton", FieldButton],
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

  it("displays a spinner after a short delay when isPending prop is true", async () => {
    vi.useFakeTimers();
    const onPress = vi.fn();
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });

    const Harness = defineComponent({
      name: "ButtonPendingHarness",
      setup() {
        const isPending = ref(false);

        return () =>
          h(
            Button,
            {
              isPending: isPending.value,
              onPress: () => {
                isPending.value = true;
                onPress();
              },
            },
            {
              default: () => "Click me",
            }
          );
      },
    });

    const wrapper = mount(Harness);
    const button = wrapper.get("button");

    expect(button.attributes("aria-disabled")).toBeUndefined();

    await user.click(button.element);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(button.attributes("aria-disabled")).toBe("true");
    expect(wrapper.get(".spectrum-Button-circleLoader").attributes("style")).toContain(
      "visibility: hidden"
    );

    await user.click(button.element);
    expect(onPress).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1000);
    await nextTick();

    expect(wrapper.get(".spectrum-Button-circleLoader").attributes("style")).toContain(
      "visibility: visible"
    );

    vi.useRealTimers();
  });

  it("removes href attribute from anchor element when isPending is true", () => {
    const wrapper = mount(Button, {
      props: {
        elementType: "a",
        href: "//example.com",
        isPending: true,
      },
      slots: {
        default: () => "Click Me",
      },
    });

    expect(wrapper.get("a").attributes("href")).toBeUndefined();
  });

  it("prevents default for non-submit types", () => {
    const wrapper = mount(Button, {
      props: {
        type: "button",
      },
      slots: {
        default: () => "Click Me",
      },
    });

    const element = wrapper.get("button").element as HTMLButtonElement;
    const keydownEnter = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });
    const keyupEnter = new KeyboardEvent("keyup", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });
    const keydownSpace = new KeyboardEvent("keydown", {
      key: " ",
      bubbles: true,
      cancelable: true,
    });
    const keyupSpace = new KeyboardEvent("keyup", {
      key: " ",
      bubbles: true,
      cancelable: true,
    });

    element.dispatchEvent(keydownEnter);
    element.dispatchEvent(keyupEnter);
    element.dispatchEvent(keydownSpace);
    element.dispatchEvent(keyupSpace);

    expect(keydownEnter.defaultPrevented).toBe(true);
    expect(keyupEnter.defaultPrevented).toBe(true);
    expect(keydownSpace.defaultPrevented).toBe(true);
    expect(keyupSpace.defaultPrevented).toBe(true);
  });

  it("Button allows default keyboard activation for submit type", () => {
    const wrapper = mount(Button, {
      props: {
        type: "submit",
      },
      slots: {
        default: () => "Click Me",
      },
    });

    const element = wrapper.get("button").element as HTMLButtonElement;
    const keydownEnter = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });
    const keyupSpace = new KeyboardEvent("keyup", {
      key: " ",
      bubbles: true,
      cancelable: true,
    });

    element.dispatchEvent(keydownEnter);
    element.dispatchEvent(keyupSpace);

    expect(keydownEnter.defaultPrevented).toBe(false);
    expect(keyupSpace.defaultPrevented).toBe(false);
  });

  it("submit in form using space", async () => {
    const user = userEvent.setup();
    let keyupEvent: KeyboardEvent | undefined;

    const Harness = defineComponent({
      name: "ButtonSubmitSpaceHarness",
      setup() {
        return () =>
          h(
            "form",
            {
              onSubmit: (event: Event) => {
                event.preventDefault();
              },
            },
            [
              h(
                Button,
                {
                  type: "submit",
                },
                {
                  default: () => "Submit",
                }
              ),
            ]
          );
      },
    });

    const wrapper = mount(Harness, {
      attachTo: document.body,
    });

    try {
      const element = wrapper.get("button").element as HTMLButtonElement;
      element.addEventListener("keyup", (event) => {
        keyupEvent = event;
      });

      element.focus();
      await user.keyboard("{Space}");

      expect(keyupEvent).toBeDefined();
      expect(keyupEvent?.defaultPrevented).toBe(false);
    } finally {
      wrapper.unmount();
    }
  });

  it("submit in form using enter", async () => {
    const user = userEvent.setup();
    let keydownEvent: KeyboardEvent | undefined;

    const Harness = defineComponent({
      name: "ButtonSubmitEnterHarness",
      setup() {
        return () =>
          h(
            "form",
            {
              onSubmit: (event: Event) => {
                event.preventDefault();
              },
            },
            [
              h(
                Button,
                {
                  type: "submit",
                },
                {
                  default: () => "Submit",
                }
              ),
            ]
          );
      },
    });

    const wrapper = mount(Harness, {
      attachTo: document.body,
    });

    try {
      const element = wrapper.get("button").element as HTMLButtonElement;
      element.addEventListener("keydown", (event) => {
        keydownEvent = event;
      });

      element.focus();
      await user.keyboard("{Enter}");

      expect(keydownEvent).toBeDefined();
      expect(keydownEvent?.defaultPrevented).toBe(false);
    } finally {
      wrapper.unmount();
    }
  });

  it("Button localizes pending aria label", () => {
    const Harness = defineComponent({
      name: "ButtonPendingLocalizedHarness",
      setup() {
        provideI18n({ locale: "fr-FR" });
        return () =>
          h(
            Button,
            {
              isPending: true,
              "aria-label": "Save",
            },
            {
              default: () => "Save",
            }
          );
      },
    });

    const wrapper = mount(Harness);
    expect(wrapper.get("button").attributes("aria-label")).toBe("Save En attente");
  });
});
