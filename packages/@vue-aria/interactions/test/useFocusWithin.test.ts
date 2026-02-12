import { describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";
import { useFocusWithin } from "../src/useFocusWithin";

interface FocusWithinHandlers {
  onFocusin?: (event: FocusEvent) => void;
  onFocusout?: (event: FocusEvent) => void;
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

describe("useFocusWithin", () => {
  it("handles focus events on the target itself", () => {
    const events: Array<{ type: string; isFocused?: boolean; target?: EventTarget | null }> = [];
    const { focusWithinProps } = useFocusWithin({
      onFocusWithin: (event) => events.push({ type: event.type, target: event.target }),
      onBlurWithin: (event) => events.push({ type: event.type, target: event.target }),
      onFocusWithinChange: (isFocused) =>
        events.push({ type: "focuschange", isFocused }),
    });
    const handlers = focusWithinProps as FocusWithinHandlers;
    const element = document.createElement("div");
    document.body.appendChild(element);

    handlers.onFocusin?.(createFocusEvent("focus", element, element));
    handlers.onFocusout?.(createFocusEvent("blur", element, element));

    expect(events).toEqual([
      { type: "focus", target: element },
      { type: "focuschange", isFocused: true },
      { type: "blur", target: element },
      { type: "focuschange", isFocused: false },
    ]);
  });

  it("handles focus events on children", () => {
    const onFocusWithin = vi.fn();
    const onBlurWithin = vi.fn();
    const onFocusWithinChange = vi.fn();
    const { focusWithinProps } = useFocusWithin({
      onFocusWithin,
      onBlurWithin,
      onFocusWithinChange,
    });
    const handlers = focusWithinProps as FocusWithinHandlers;

    const parent = document.createElement("div");
    const child = document.createElement("button");
    parent.appendChild(child);
    document.body.appendChild(parent);

    handlers.onFocusin?.(createFocusEvent("focus", child, parent));
    handlers.onFocusin?.(createFocusEvent("focus", parent, parent));
    handlers.onFocusin?.(createFocusEvent("focus", child, parent));
    handlers.onFocusout?.(createFocusEvent("blur", child, parent));

    expect(onFocusWithin).toHaveBeenCalledTimes(1);
    expect(onFocusWithinChange).toHaveBeenNthCalledWith(1, true);
    expect(onBlurWithin).toHaveBeenCalledTimes(1);
    expect(onFocusWithinChange).toHaveBeenNthCalledWith(2, false);
  });

  it("does not handle focus events if disabled", () => {
    const onFocusWithin = vi.fn();
    const onBlurWithin = vi.fn();
    const onFocusWithinChange = vi.fn();
    const { focusWithinProps } = useFocusWithin({
      isDisabled: true,
      onFocusWithin,
      onBlurWithin,
      onFocusWithinChange,
    });
    const handlers = focusWithinProps as FocusWithinHandlers;

    const parent = document.createElement("div");
    const child = document.createElement("button");
    parent.appendChild(child);
    document.body.appendChild(parent);

    handlers.onFocusin?.(createFocusEvent("focus", child, parent));
    handlers.onFocusout?.(createFocusEvent("blur", child, parent));

    expect(onFocusWithin).not.toHaveBeenCalled();
    expect(onBlurWithin).not.toHaveBeenCalled();
    expect(onFocusWithinChange).not.toHaveBeenCalled();
  });

  it("does not blur when focus moves inside the same element", () => {
    const onBlurWithin = vi.fn();
    const onFocusWithinChange = vi.fn();
    const { focusWithinProps } = useFocusWithin({
      onBlurWithin,
      onFocusWithinChange,
    });
    const handlers = focusWithinProps as FocusWithinHandlers;

    const parent = document.createElement("div");
    const childA = document.createElement("button");
    const childB = document.createElement("button");
    parent.appendChild(childA);
    parent.appendChild(childB);
    document.body.appendChild(parent);

    handlers.onFocusin?.(createFocusEvent("focus", childA, parent));
    handlers.onFocusout?.(createFocusEvent("blur", childA, parent, childB));

    expect(onFocusWithinChange).toHaveBeenCalledWith(true);
    expect(onBlurWithin).not.toHaveBeenCalled();
  });

  it("fires blur when disabled while focused", async () => {
    const disabled = ref(false);
    const onFocusWithin = vi.fn();
    const onBlurWithin = vi.fn();
    const onFocusWithinChange = vi.fn();
    const { focusWithinProps } = useFocusWithin({
      isDisabled: disabled,
      onFocusWithin,
      onBlurWithin,
      onFocusWithinChange,
    });
    const handlers = focusWithinProps as FocusWithinHandlers;

    const parent = document.createElement("div");
    const child = document.createElement("button");
    parent.appendChild(child);
    document.body.appendChild(parent);

    handlers.onFocusin?.(createFocusEvent("focus", child, parent));
    expect(onFocusWithin).toHaveBeenCalledTimes(1);
    expect(onBlurWithin).toHaveBeenCalledTimes(0);

    disabled.value = true;
    await nextTick();

    expect(onBlurWithin).toHaveBeenCalledTimes(1);
    expect(onFocusWithinChange).toHaveBeenNthCalledWith(1, true);
    expect(onFocusWithinChange).toHaveBeenNthCalledWith(2, false);
  });

  it("fires blur when focus moves outside", () => {
    const events: Array<{ type: string; isFocused?: boolean; target?: EventTarget | null }> = [];
    const { focusWithinProps } = useFocusWithin({
      onFocusWithin: (event) => events.push({ type: event.type, target: event.target }),
      onBlurWithin: (event) => events.push({ type: event.type, target: event.target }),
      onFocusWithinChange: (isFocused) =>
        events.push({ type: "focuschange", isFocused }),
    });
    const handlers = focusWithinProps as FocusWithinHandlers;

    const parent = document.createElement("div");
    const child = document.createElement("button");
    const outside = document.createElement("input");
    parent.appendChild(child);
    document.body.appendChild(parent);
    document.body.appendChild(outside);

    handlers.onFocusin?.(createFocusEvent("focus", child, parent));
    handlers.onFocusout?.(createFocusEvent("blur", parent, parent, outside));

    expect(events).toEqual([
      { type: "focus", target: child },
      { type: "focuschange", isFocused: true },
      { type: "blur", target: parent },
      { type: "focuschange", isFocused: false },
    ]);
  });
});
