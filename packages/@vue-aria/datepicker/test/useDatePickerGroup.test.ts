import { describe, expect, it, vi } from "vitest";
import { useDatePickerGroup } from "../src/useDatePickerGroup";

interface GroupHandlers {
  onKeydown?: (event: KeyboardEvent) => void;
  onPointerdown?: (event: PointerEvent) => void;
  onPointerup?: (event: PointerEvent) => void;
}

function createKeyboardEvent(
  key: string,
  currentTarget: Element,
  target: Element,
  options: { altKey?: boolean } = {}
): KeyboardEvent {
  const event = new KeyboardEvent("keydown", {
    key,
    bubbles: true,
    cancelable: true,
    altKey: options.altKey,
  });

  Object.defineProperty(event, "currentTarget", { value: currentTarget });
  Object.defineProperty(event, "target", { value: target });

  return event;
}

function createPointerEvent(
  type: "pointerdown" | "pointerup",
  currentTarget: Element,
  pointerType: "mouse" | "touch"
): PointerEvent {
  const event = new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    pointerType,
    button: 0,
  });
  Object.defineProperty(event, "currentTarget", { value: currentTarget });
  Object.defineProperty(event, "target", { value: currentTarget });
  return event;
}

describe("useDatePickerGroup", () => {
  it("opens the picker on Alt+ArrowDown", () => {
    const setOpen = vi.fn();
    const root = document.createElement("div");
    const segment = document.createElement("div");
    segment.tabIndex = 0;
    root.appendChild(segment);
    document.body.appendChild(root);

    const { groupProps } = useDatePickerGroup({ setOpen }, root);
    const handlers = groupProps.value as GroupHandlers;

    const event = createKeyboardEvent("ArrowDown", root, segment, { altKey: true });
    handlers.onKeydown?.(event);

    expect(setOpen).toHaveBeenCalledWith(true);
    expect(event.defaultPrevented).toBe(true);
  });

  it("moves focus with arrow keys", () => {
    const root = document.createElement("div");
    const first = document.createElement("div");
    const second = document.createElement("div");
    first.tabIndex = 0;
    second.tabIndex = 0;
    root.append(first, second);
    document.body.appendChild(root);

    const { groupProps } = useDatePickerGroup({}, root);
    const handlers = groupProps.value as GroupHandlers;

    first.focus();
    handlers.onKeydown?.(createKeyboardEvent("ArrowRight", root, first));
    expect(document.activeElement).toBe(second);

    handlers.onKeydown?.(createKeyboardEvent("ArrowLeft", root, second));
    expect(document.activeElement).toBe(first);
  });

  it("focuses the last non-placeholder segment on mouse press", () => {
    const root = document.createElement("div");
    const first = document.createElement("div");
    const placeholder = document.createElement("div");
    const last = document.createElement("div");
    first.tabIndex = 0;
    placeholder.tabIndex = 0;
    last.tabIndex = 0;
    placeholder.setAttribute("data-placeholder", "true");
    root.append(first, placeholder, last);
    document.body.appendChild(root);

    const { groupProps } = useDatePickerGroup({}, root);
    const handlers = groupProps.value as GroupHandlers;

    handlers.onPointerdown?.(createPointerEvent("pointerdown", root, "mouse"));
    handlers.onPointerup?.(createPointerEvent("pointerup", root, "mouse"));

    expect(document.activeElement).toBe(last);
  });
});
