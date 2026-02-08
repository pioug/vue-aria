import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLongPress } from "../src/useLongPress";

interface LongPressHandlers {
  onPointerdown?: (event: PointerEvent) => void;
  onPointerup?: (event: PointerEvent) => void;
  onPointercancel?: (event: PointerEvent) => void;
}

function createPointerEvent(
  type: string,
  target: EventTarget,
  pointerType: "touch" | "mouse" | "pen",
  button = 0
): PointerEvent {
  const event = new PointerEvent(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "pointerType", { value: pointerType });
  Object.defineProperty(event, "button", { value: button });
  Object.defineProperty(event, "target", { value: target });
  Object.defineProperty(event, "currentTarget", { value: target });
  return event;
}

describe("useLongPress", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("performs a long press after threshold", () => {
    const events: string[] = [];
    const { longPressProps } = useLongPress({
      onLongPressStart: () => events.push("start"),
      onLongPressEnd: () => events.push("end"),
      onLongPress: () => events.push("longpress"),
    });
    const handlers = longPressProps as LongPressHandlers;
    const element = document.createElement("div");
    document.body.appendChild(element);

    handlers.onPointerdown?.(createPointerEvent("pointerdown", element, "touch"));
    expect(events).toEqual(["start"]);

    vi.advanceTimersByTime(400);
    expect(events).toEqual(["start"]);

    vi.advanceTimersByTime(200);
    expect(events).toEqual(["start", "end", "longpress"]);

    handlers.onPointerup?.(createPointerEvent("pointerup", element, "touch"));
    expect(events).toEqual(["start", "end", "longpress"]);
  });

  it("cancels when pointer ends before threshold", () => {
    const events: string[] = [];
    const { longPressProps } = useLongPress({
      onLongPressStart: () => events.push("start"),
      onLongPressEnd: () => events.push("end"),
      onLongPress: () => events.push("longpress"),
    });
    const handlers = longPressProps as LongPressHandlers;
    const element = document.createElement("div");
    document.body.appendChild(element);

    handlers.onPointerdown?.(createPointerEvent("pointerdown", element, "touch"));
    vi.advanceTimersByTime(200);
    handlers.onPointerup?.(createPointerEvent("pointerup", element, "touch"));
    vi.advanceTimersByTime(800);

    expect(events).toEqual(["start", "end"]);
  });

  it("allows changing the threshold", () => {
    const events: string[] = [];
    const { longPressProps } = useLongPress({
      threshold: 800,
      onLongPressStart: () => events.push("start"),
      onLongPressEnd: () => events.push("end"),
      onLongPress: () => events.push("longpress"),
    });
    const handlers = longPressProps as LongPressHandlers;
    const element = document.createElement("div");
    document.body.appendChild(element);

    handlers.onPointerdown?.(createPointerEvent("pointerdown", element, "touch"));
    vi.advanceTimersByTime(600);
    expect(events).toEqual(["start"]);

    vi.advanceTimersByTime(300);
    expect(events).toEqual(["start", "end", "longpress"]);
  });

  it("ignores non mouse/touch pointer types", () => {
    const onLongPressStart = vi.fn();
    const onLongPress = vi.fn();
    const { longPressProps } = useLongPress({
      onLongPressStart,
      onLongPress,
    });
    const handlers = longPressProps as LongPressHandlers;
    const element = document.createElement("div");
    document.body.appendChild(element);

    handlers.onPointerdown?.(createPointerEvent("pointerdown", element, "pen"));
    vi.advanceTimersByTime(1000);

    expect(onLongPressStart).not.toHaveBeenCalled();
    expect(onLongPress).not.toHaveBeenCalled();
  });
});
