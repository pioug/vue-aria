import { describe, expect, it, vi } from "vitest";
import { useButton } from "../src/useButton";

interface ButtonHandlers {
  onPointerdown: (event: PointerEvent) => void;
  onPointerup: (event: PointerEvent) => void;
  onKeydown: (event: KeyboardEvent) => void;
  onKeyup: (event: KeyboardEvent) => void;
  onFocus: (event: FocusEvent) => void;
  onBlur: (event: FocusEvent) => void;
}

describe("useButton", () => {
  it("provides native button defaults", () => {
    const { buttonProps } = useButton();

    expect(buttonProps.value.type).toBe("button");
    expect(buttonProps.value.disabled).toBe(false);
    expect(buttonProps.value.role).toBeUndefined();
    expect(buttonProps.value.tabindex).toBeUndefined();
  });

  it("provides role and tabindex for non-native elements", () => {
    const { buttonProps } = useButton({ elementType: "div" });

    expect(buttonProps.value.role).toBe("button");
    expect(buttonProps.value.tabindex).toBe(0);
    expect(buttonProps.value["aria-disabled"]).toBeUndefined();
  });

  it("handles disabled non-native buttons", () => {
    const { buttonProps } = useButton({ elementType: "div", isDisabled: true });

    expect(buttonProps.value.tabindex).toBe(-1);
    expect(buttonProps.value["aria-disabled"]).toBe(true);
  });

  it("handles link button props", () => {
    const enabled = useButton({
      elementType: "a",
      href: "/docs",
      target: "_blank",
      rel: "noopener",
    });
    expect(enabled.buttonProps.value.href).toBe("/docs");
    expect(enabled.buttonProps.value.target).toBe("_blank");
    expect(enabled.buttonProps.value.rel).toBe("noopener");

    const disabled = useButton({
      elementType: "a",
      href: "/docs",
      isDisabled: true,
    });
    expect(disabled.buttonProps.value.href).toBeUndefined();
    expect(disabled.buttonProps.value["aria-disabled"]).toBe(true);
  });

  it("fires onPress for non-native keyboard interaction", () => {
    const onPress = vi.fn();
    const { buttonProps, isPressed } = useButton({
      elementType: "div",
      onPress,
    });
    const handlers = buttonProps.value as unknown as ButtonHandlers;

    handlers.onKeydown(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    expect(isPressed.value).toBe(true);

    handlers.onKeyup(new KeyboardEvent("keyup", { key: " ", bubbles: true }));
    expect(isPressed.value).toBe(false);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress.mock.calls[0][0].pointerType).toBe("keyboard");
  });

  it("tracks focus visibility", () => {
    const { buttonProps, isFocused, isFocusVisible } = useButton({ elementType: "div" });
    const handlers = buttonProps.value as unknown as ButtonHandlers;

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    handlers.onFocus(new FocusEvent("focus"));
    expect(isFocused.value).toBe(true);
    expect(isFocusVisible.value).toBe(true);

    handlers.onBlur(new FocusEvent("blur"));
    expect(isFocused.value).toBe(false);
    expect(isFocusVisible.value).toBe(false);
  });

  it("prevents default keyboard activation for native non-submit buttons", () => {
    const { buttonProps } = useButton({
      elementType: "button",
      type: "button",
    });
    const handlers = buttonProps.value as unknown as ButtonHandlers;
    const keydownEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });
    const keyupEvent = new KeyboardEvent("keyup", {
      key: " ",
      bubbles: true,
      cancelable: true,
    });

    handlers.onKeydown(keydownEvent);
    handlers.onKeyup(keyupEvent);

    expect(keydownEvent.defaultPrevented).toBe(true);
    expect(keyupEvent.defaultPrevented).toBe(true);
  });

  it("allows default keyboard activation for native submit buttons", () => {
    const { buttonProps } = useButton({
      elementType: "button",
      type: "submit",
    });
    const handlers = buttonProps.value as unknown as ButtonHandlers;
    const keydownEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });
    const keyupEvent = new KeyboardEvent("keyup", {
      key: " ",
      bubbles: true,
      cancelable: true,
    });

    handlers.onKeydown(keydownEvent);
    handlers.onKeyup(keyupEvent);

    expect(keydownEvent.defaultPrevented).toBe(false);
    expect(keyupEvent.defaultPrevented).toBe(false);
  });
});
