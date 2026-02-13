import { effectScope, shallowRef } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useFocusable } from "../src/useFocusable";

describe("useFocusable", () => {
  it("applies focus and keyboard props with default tabIndex", () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const onKeyDown = vi.fn();

    const scope = effectScope();
    const domRef = shallowRef<Element | null>(document.createElement("button"));
    const { focusableProps } = scope.run(() =>
      useFocusable({ onFocus, onBlur, onKeyDown }, domRef)
    )!;

    expect(focusableProps.tabIndex).toBe(0);

    const focusEvent = new FocusEvent("focus", { bubbles: true });
    Object.defineProperty(focusEvent, "target", { value: domRef.value });
    Object.defineProperty(focusEvent, "currentTarget", { value: domRef.value });
    (focusableProps.onFocus as (event: FocusEvent) => void)?.(focusEvent);

    const keyDown = new KeyboardEvent("keydown", { key: "a", bubbles: true, cancelable: true });
    Object.defineProperty(keyDown, "target", { value: domRef.value });
    Object.defineProperty(keyDown, "currentTarget", { value: domRef.value });
    (focusableProps.onKeydown as (event: KeyboardEvent) => void)?.(keyDown);

    const blurEvent = new FocusEvent("blur", { bubbles: true });
    Object.defineProperty(blurEvent, "target", { value: domRef.value });
    Object.defineProperty(blurEvent, "currentTarget", { value: domRef.value });
    (focusableProps.onBlur as (event: FocusEvent) => void)?.(blurEvent);

    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);

    scope.stop();
  });

  it("supports isDisabled", () => {
    const scope = effectScope();
    const domRef = shallowRef<Element | null>(document.createElement("button"));
    const { focusableProps } = scope.run(() => useFocusable({ isDisabled: true }, domRef))!;

    expect(focusableProps.tabIndex).toBeUndefined();

    scope.stop();
  });

  it("supports excludeFromTabOrder", () => {
    const scope = effectScope();
    const domRef = shallowRef<Element | null>(document.createElement("button"));
    const { focusableProps } = scope.run(() => useFocusable({ excludeFromTabOrder: true }, domRef))!;

    expect(focusableProps.tabIndex).toBe(-1);

    scope.stop();
  });
});
