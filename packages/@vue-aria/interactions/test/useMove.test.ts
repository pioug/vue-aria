import { describe, expect, it, vi } from "vitest";
import { useMove } from "../src/useMove";
import type { MoveEvent } from "@vue-aria/types";

interface MoveHandlers {
  onPointerdown?: (event: PointerEvent) => void;
  onKeydown?: (event: KeyboardEvent) => void;
}

function createPointerEvent(
  type: string,
  options: {
    pointerId: number;
    pointerType: "mouse" | "touch" | "pen";
    button?: number;
    pageX: number;
    pageY: number;
  }
): PointerEvent {
  const event = new PointerEvent(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "pointerId", { value: options.pointerId });
  Object.defineProperty(event, "pointerType", { value: options.pointerType });
  Object.defineProperty(event, "button", { value: options.button ?? 0 });
  Object.defineProperty(event, "pageX", { value: options.pageX });
  Object.defineProperty(event, "pageY", { value: options.pageY });
  return event;
}

describe("useMove", () => {
  it("responds to pointer move events", () => {
    const events: MoveEvent[] = [];
    const addEvent = (event: MoveEvent) => events.push(event);
    const { moveProps } = useMove({
      onMoveStart: addEvent,
      onMove: addEvent,
      onMoveEnd: addEvent,
    });
    const handlers = moveProps as MoveHandlers;

    handlers.onPointerdown?.(
      createPointerEvent("pointerdown", {
        pointerType: "pen",
        pointerId: 1,
        pageX: 1,
        pageY: 30,
      })
    );

    window.dispatchEvent(
      createPointerEvent("pointermove", {
        pointerType: "pen",
        pointerId: 1,
        pageX: 10,
        pageY: 25,
      })
    );
    window.dispatchEvent(
      createPointerEvent("pointerup", {
        pointerType: "pen",
        pointerId: 1,
        pageX: 10,
        pageY: 25,
      })
    );

    expect(events).toHaveLength(3);
    expect(events[0]).toMatchObject({ type: "movestart", pointerType: "pen" });
    expect(events[1]).toMatchObject({
      type: "move",
      pointerType: "pen",
      deltaX: 9,
      deltaY: -5,
    });
    expect(events[2]).toMatchObject({ type: "moveend", pointerType: "pen" });
  });

  it("does not respond to right click", () => {
    const onMove = vi.fn();
    const { moveProps } = useMove({ onMove });
    const handlers = moveProps as MoveHandlers;

    handlers.onPointerdown?.(
      createPointerEvent("pointerdown", {
        pointerType: "mouse",
        pointerId: 1,
        button: 2,
        pageX: 1,
        pageY: 1,
      })
    );
    window.dispatchEvent(
      createPointerEvent("pointermove", {
        pointerType: "mouse",
        pointerId: 1,
        button: 2,
        pageX: 8,
        pageY: 8,
      })
    );

    expect(onMove).not.toHaveBeenCalled();
  });

  it("ends a pointer interaction on pointercancel", () => {
    const onMoveEnd = vi.fn();
    const { moveProps } = useMove({ onMoveEnd });
    const handlers = moveProps as MoveHandlers;

    handlers.onPointerdown?.(
      createPointerEvent("pointerdown", {
        pointerType: "pen",
        pointerId: 7,
        pageX: 2,
        pageY: 2,
      })
    );
    window.dispatchEvent(
      createPointerEvent("pointermove", {
        pointerType: "pen",
        pointerId: 7,
        pageX: 4,
        pageY: 8,
      })
    );
    window.dispatchEvent(
      createPointerEvent("pointercancel", {
        pointerType: "pen",
        pointerId: 7,
        pageX: 4,
        pageY: 8,
      })
    );

    expect(onMoveEnd).toHaveBeenCalledTimes(1);
    expect(onMoveEnd.mock.calls[0]?.[0]).toMatchObject({
      type: "moveend",
      pointerType: "pen",
    });
  });

  it("ignores additional pointers while one is active", () => {
    const events: MoveEvent[] = [];
    const addEvent = (event: MoveEvent) => events.push(event);
    const { moveProps } = useMove({
      onMoveStart: addEvent,
      onMove: addEvent,
      onMoveEnd: addEvent,
    });
    const handlers = moveProps as MoveHandlers;

    handlers.onPointerdown?.(
      createPointerEvent("pointerdown", {
        pointerType: "pen",
        pointerId: 1,
        pageX: 1,
        pageY: 30,
      })
    );
    handlers.onPointerdown?.(
      createPointerEvent("pointerdown", {
        pointerType: "pen",
        pointerId: 3,
        pageX: 1,
        pageY: 30,
      })
    );
    window.dispatchEvent(
      createPointerEvent("pointermove", {
        pointerType: "pen",
        pointerId: 3,
        pageX: 1,
        pageY: 40,
      })
    );
    window.dispatchEvent(
      createPointerEvent("pointerup", {
        pointerType: "pen",
        pointerId: 3,
        pageX: 1,
        pageY: 40,
      })
    );
    expect(events).toEqual([]);

    window.dispatchEvent(
      createPointerEvent("pointermove", {
        pointerType: "pen",
        pointerId: 1,
        pageX: 10,
        pageY: 25,
      })
    );
    window.dispatchEvent(
      createPointerEvent("pointerup", {
        pointerType: "pen",
        pointerId: 1,
        pageX: 10,
        pageY: 25,
      })
    );

    expect(events).toHaveLength(3);
    expect(events[0]).toMatchObject({ type: "movestart", pointerType: "pen" });
    expect(events[1]).toMatchObject({
      type: "move",
      pointerType: "pen",
      deltaX: 9,
      deltaY: -5,
    });
    expect(events[2]).toMatchObject({ type: "moveend", pointerType: "pen" });
  });

  it("does not fire move events when tapping without movement", () => {
    const onMoveStart = vi.fn();
    const onMoveEnd = vi.fn();
    const { moveProps } = useMove({ onMoveStart, onMoveEnd });
    const handlers = moveProps as MoveHandlers;

    handlers.onPointerdown?.(
      createPointerEvent("pointerdown", {
        pointerType: "touch",
        pointerId: 3,
        pageX: 5,
        pageY: 5,
      })
    );
    window.dispatchEvent(
      createPointerEvent("pointerup", {
        pointerType: "touch",
        pointerId: 3,
        pageX: 5,
        pageY: 5,
      })
    );

    expect(onMoveStart).not.toHaveBeenCalled();
    expect(onMoveEnd).not.toHaveBeenCalled();
  });

  it("responds to arrow key presses", () => {
    const events: MoveEvent[] = [];
    const addEvent = (event: MoveEvent) => events.push(event);
    const { moveProps } = useMove({
      onMoveStart: addEvent,
      onMove: addEvent,
      onMoveEnd: addEvent,
    });
    const handlers = moveProps as MoveHandlers;
    const keyEvent = new KeyboardEvent("keydown", {
      key: "ArrowRight",
      bubbles: true,
      cancelable: true,
    });

    handlers.onKeydown?.(keyEvent);

    expect(events).toHaveLength(3);
    expect(events[0]).toMatchObject({ type: "movestart", pointerType: "keyboard" });
    expect(events[1]).toMatchObject({
      type: "move",
      pointerType: "keyboard",
      deltaX: 1,
      deltaY: 0,
    });
    expect(events[2]).toMatchObject({ type: "moveend", pointerType: "keyboard" });
    expect(keyEvent.defaultPrevented).toBe(true);
  });

  it("allows other keyboard events to pass through", () => {
    const onMove = vi.fn();
    const { moveProps } = useMove({ onMove });
    const handlers = moveProps as MoveHandlers;

    handlers.onKeydown?.(new KeyboardEvent("keydown", { key: "PageUp", bubbles: true }));
    expect(onMove).not.toHaveBeenCalled();
  });
});
