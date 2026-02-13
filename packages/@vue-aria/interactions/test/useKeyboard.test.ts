import { describe, expect, it, vi } from "vitest";
import { useKeyboard } from "../src/useKeyboard";

describe("useKeyboard", () => {
  it("handles keyboard events", () => {
    const events: Array<{ type: string; target: EventTarget | null }> = [];
    const addEvent = (e: { type: string; target: EventTarget | null }) => {
      events.push({ type: e.type, target: e.target });
    };

    const { keyboardProps } = useKeyboard({
      onKeyDown: addEvent as any,
      onKeyUp: addEvent as any,
    });

    const el = document.createElement("div");
    const onKeydown = keyboardProps.onKeydown as (e: KeyboardEvent) => void;
    const onKeyup = keyboardProps.onKeyup as (e: KeyboardEvent) => void;

    const keyDown = new KeyboardEvent("keydown", { key: "A", bubbles: true });
    Object.defineProperty(keyDown, "target", { value: el });
    onKeydown(keyDown);

    const keyUp = new KeyboardEvent("keyup", { key: "A", bubbles: true });
    Object.defineProperty(keyUp, "target", { value: el });
    onKeyup(keyUp);

    expect(events).toEqual([
      { type: "keydown", target: el },
      { type: "keyup", target: el },
    ]);
  });

  it("does not handle events when disabled", () => {
    const onKeyDown = vi.fn();
    const onKeyUp = vi.fn();

    const { keyboardProps } = useKeyboard({
      isDisabled: true,
      onKeyDown,
      onKeyUp,
    });

    expect(keyboardProps).toEqual({});
  });

  it("stops propagation by default", () => {
    const outer = vi.fn();
    const inner = vi.fn();

    const { keyboardProps } = useKeyboard({
      onKeyDown: inner,
    });

    const onKeydown = keyboardProps.onKeydown as (e: KeyboardEvent) => void;
    const event = new KeyboardEvent("keydown", { key: "A", bubbles: true });
    const stopPropagation = vi.fn();
    Object.defineProperty(event, "stopPropagation", { value: stopPropagation });

    onKeydown(event);
    outer();

    expect(inner).toHaveBeenCalledTimes(1);
    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(outer).toHaveBeenCalledTimes(1);
  });

  it("continues propagation when requested", () => {
    const inner = vi.fn((e: any) => e.continuePropagation());

    const { keyboardProps } = useKeyboard({
      onKeyDown: inner,
    });

    const onKeydown = keyboardProps.onKeydown as (e: KeyboardEvent) => void;
    const event = new KeyboardEvent("keydown", { key: "A", bubbles: true });
    const stopPropagation = vi.fn();
    Object.defineProperty(event, "stopPropagation", { value: stopPropagation });

    onKeydown(event);

    expect(inner).toHaveBeenCalledTimes(1);
    expect(stopPropagation).not.toHaveBeenCalled();
  });
});
