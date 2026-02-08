import { describe, expect, it, vi } from "vitest";
import { useFocus } from "../src/useFocus";

interface FocusHandlers {
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
}

function createFocusEvent(
  type: "focus" | "blur",
  target: EventTarget | null,
  currentTarget: EventTarget | null,
  relatedTarget: EventTarget | null = null
): FocusEvent {
  const event = new FocusEvent(type, { bubbles: true, relatedTarget });
  Object.defineProperty(event, "target", { value: target });
  Object.defineProperty(event, "currentTarget", { value: currentTarget });
  return event;
}

describe("useFocus", () => {
  it("handles focus events on the immediate target", () => {
    const events: Array<{ type: string; isFocused?: boolean; target?: EventTarget | null }> = [];
    const { focusProps } = useFocus({
      onFocus: (event) => events.push({ type: event.type, target: event.target }),
      onBlur: (event) => events.push({ type: event.type, target: event.target }),
      onFocusChange: (isFocused) => events.push({ type: "focuschange", isFocused }),
    });

    const handlers = focusProps as FocusHandlers;
    const element = document.createElement("button");
    document.body.appendChild(element);
    element.focus();

    handlers.onFocus?.(createFocusEvent("focus", element, element));
    handlers.onBlur?.(createFocusEvent("blur", element, element));

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
    const onFocusChange = vi.fn();
    const { focusProps } = useFocus({ onFocus, onBlur, onFocusChange });
    const handlers = focusProps as FocusHandlers;

    const parent = document.createElement("div");
    const child = document.createElement("button");
    parent.appendChild(child);
    document.body.appendChild(parent);
    child.focus();

    handlers.onFocus?.(createFocusEvent("focus", child, parent));
    handlers.onBlur?.(createFocusEvent("blur", child, parent));

    expect(onFocus).not.toHaveBeenCalled();
    expect(onBlur).not.toHaveBeenCalled();
    expect(onFocusChange).not.toHaveBeenCalled();
  });

  it("does not handle focus events when disabled", () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const onFocusChange = vi.fn();
    const { focusProps } = useFocus({
      isDisabled: true,
      onFocus,
      onBlur,
      onFocusChange,
    });

    const handlers = focusProps as FocusHandlers;
    const element = document.createElement("button");
    document.body.appendChild(element);
    element.focus();

    handlers.onFocus?.(createFocusEvent("focus", element, element));
    handlers.onBlur?.(createFocusEvent("blur", element, element));

    expect(onFocus).not.toHaveBeenCalled();
    expect(onBlur).not.toHaveBeenCalled();
    expect(onFocusChange).not.toHaveBeenCalled();
  });
});
