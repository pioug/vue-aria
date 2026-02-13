import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useFocusWithin } from "../src/useFocusWithin";

describe("useFocusWithin", () => {
  it("handles focus events on target and children", () => {
    const events: Array<{ type: string; target: EventTarget | null } | { type: string; isFocused: boolean }> = [];
    const addEvent = (event: FocusEvent) => {
      events.push({ type: event.type, target: event.target });
    };

    const scope = effectScope();
    const { focusWithinProps } = scope.run(() =>
      useFocusWithin({
        onFocusWithin: addEvent,
        onBlurWithin: addEvent,
        onFocusWithinChange: (isFocused) => events.push({ type: "focuschange", isFocused }),
      })
    )!;

    const parent = document.createElement("div");
    const child = document.createElement("div");
    parent.appendChild(child);

    const onFocus = focusWithinProps.onFocus as (event: FocusEvent) => void;
    const onBlur = focusWithinProps.onBlur as (event: FocusEvent) => void;

    const focusEvent = new FocusEvent("focus", { bubbles: true });
    Object.defineProperty(focusEvent, "target", { value: child });
    Object.defineProperty(focusEvent, "currentTarget", { value: parent });

    const blurEvent = new FocusEvent("blur", { bubbles: true });
    Object.defineProperty(blurEvent, "target", { value: child });
    Object.defineProperty(blurEvent, "currentTarget", { value: parent });
    Object.defineProperty(blurEvent, "relatedTarget", { value: null });

    onFocus(focusEvent);
    onBlur(blurEvent);

    expect(events).toEqual([
      { type: "focus", target: child },
      { type: "focuschange", isFocused: true },
      { type: "blur", target: child },
      { type: "focuschange", isFocused: false },
    ]);

    scope.stop();
  });

  it("does not return handlers when disabled", () => {
    const scope = effectScope();
    const { focusWithinProps } = scope.run(() =>
      useFocusWithin({
        isDisabled: true,
        onFocusWithin: vi.fn(),
        onBlurWithin: vi.fn(),
      })
    )!;

    expect(focusWithinProps.onFocus).toBeUndefined();
    expect(focusWithinProps.onBlur).toBeUndefined();

    scope.stop();
  });

  it("fires blur when focus moves outside", () => {
    const onFocusWithin = vi.fn();
    const onBlurWithin = vi.fn();

    const scope = effectScope();
    const { focusWithinProps } = scope.run(() =>
      useFocusWithin({
        onFocusWithin,
        onBlurWithin,
      })
    )!;

    const parent = document.createElement("div");
    const child = document.createElement("button");
    parent.appendChild(child);
    document.body.appendChild(parent);

    const onFocus = focusWithinProps.onFocus as (event: FocusEvent) => void;

    const focusEvent = new FocusEvent("focus", { bubbles: true });
    Object.defineProperty(focusEvent, "target", { value: child });
    Object.defineProperty(focusEvent, "currentTarget", { value: parent });
    onFocus(focusEvent);

    const outside = document.createElement("input");
    document.body.appendChild(outside);
    outside.dispatchEvent(new FocusEvent("focus", { bubbles: true }));

    expect(onFocusWithin).toHaveBeenCalledTimes(1);
    expect(onBlurWithin).toHaveBeenCalledTimes(1);

    parent.remove();
    outside.remove();
    scope.stop();
  });
});
