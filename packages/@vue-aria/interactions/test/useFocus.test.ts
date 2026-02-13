import { describe, expect, it, vi } from "vitest";
import { useFocus } from "../src/useFocus";

describe("useFocus", () => {
  it("handles focus events on immediate target", () => {
    const events: Array<{ type: string; target: EventTarget | null } | { type: string; isFocused: boolean }> = [];
    const addEvent = (event: FocusEvent) => {
      events.push({ type: event.type, target: event.target });
    };

    const { focusProps } = useFocus({
      onFocus: addEvent,
      onBlur: addEvent,
      onFocusChange: (isFocused) => events.push({ type: "focuschange", isFocused }),
    });

    const onFocus = focusProps.onFocus as (e: FocusEvent) => void;
    const onBlur = focusProps.onBlur as (e: FocusEvent) => void;

    const element = document.createElement("div");
    const focusEvent = new FocusEvent("focus", { bubbles: true });
    Object.defineProperty(focusEvent, "target", { value: element });
    Object.defineProperty(focusEvent, "currentTarget", { value: element });

    const blurEvent = new FocusEvent("blur", { bubbles: true });
    Object.defineProperty(blurEvent, "target", { value: element });
    Object.defineProperty(blurEvent, "currentTarget", { value: element });

    onFocus(focusEvent);
    onBlur(blurEvent);

    expect(events).toEqual([
      { type: "focus", target: element },
      { type: "focuschange", isFocused: true },
      { type: "blur", target: element },
      { type: "focuschange", isFocused: false },
    ]);
  });

  it("does not handle focus events on children", () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();

    const { focusProps } = useFocus({ onFocus, onBlur });
    const focusHandler = focusProps.onFocus as (e: FocusEvent) => void;
    const blurHandler = focusProps.onBlur as (e: FocusEvent) => void;

    const parent = document.createElement("div");
    const child = document.createElement("div");
    parent.appendChild(child);

    const focusEvent = new FocusEvent("focus", { bubbles: true });
    Object.defineProperty(focusEvent, "target", { value: child });
    Object.defineProperty(focusEvent, "currentTarget", { value: parent });

    const blurEvent = new FocusEvent("blur", { bubbles: true });
    Object.defineProperty(blurEvent, "target", { value: child });
    Object.defineProperty(blurEvent, "currentTarget", { value: parent });

    focusHandler(focusEvent);
    blurHandler(blurEvent);

    expect(onFocus).not.toHaveBeenCalled();
    expect(onBlur).not.toHaveBeenCalled();
  });

  it("does not return handlers when disabled", () => {
    const { focusProps } = useFocus({
      isDisabled: true,
      onFocus: vi.fn(),
      onBlur: vi.fn(),
      onFocusChange: vi.fn(),
    });

    expect(focusProps.onFocus).toBeUndefined();
    expect(focusProps.onBlur).toBeUndefined();
  });
});
