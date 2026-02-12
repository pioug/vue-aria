import { describe, expect, it, vi } from "vitest";
import { useMove } from "../src/useMove";
import type { MoveEvent } from "@vue-aria/types";

interface MoveHandlers {
  onPointerdown?: (event: PointerEvent) => void;
  onMousedown?: (event: MouseEvent) => void;
  onTouchstart?: (event: Event) => void;
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

function createMouseEvent(
  type: string,
  options: {
    button?: number;
    pageX: number;
    pageY: number;
  }
): MouseEvent {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    button: options.button ?? 0,
  });
  Object.defineProperty(event, "pageX", { value: options.pageX });
  Object.defineProperty(event, "pageY", { value: options.pageY });
  return event;
}

function createTouchEvent(
  type: string,
  identifier: number,
  pageX: number,
  pageY: number
): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  const touches = [{ identifier, pageX, pageY }];
  Object.defineProperty(event, "changedTouches", {
    value: touches,
  });
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

  it("does not bubble to parent useMove handlers", () => {
    const parentOnMove = vi.fn();
    const childOnMove = vi.fn();
    const { moveProps: parentMoveProps } = useMove({ onMove: parentOnMove });
    const { moveProps: childMoveProps } = useMove({ onMove: childOnMove });

    const parent = document.createElement("div");
    const child = document.createElement("div");
    parent.appendChild(child);
    document.body.appendChild(parent);

    parent.addEventListener(
      "pointerdown",
      parentMoveProps.onPointerdown as EventListener
    );
    child.addEventListener(
      "pointerdown",
      childMoveProps.onPointerdown as EventListener
    );

    child.dispatchEvent(
      createPointerEvent("pointerdown", {
        pointerType: "mouse",
        pointerId: 11,
        button: 0,
        pageX: 10,
        pageY: 10,
      })
    );

    window.dispatchEvent(
      createPointerEvent("pointermove", {
        pointerType: "mouse",
        pointerId: 11,
        pageX: 20,
        pageY: 16,
      })
    );
    window.dispatchEvent(
      createPointerEvent("pointerup", {
        pointerType: "mouse",
        pointerId: 11,
        pageX: 20,
        pageY: 16,
      })
    );

    expect(childOnMove).toHaveBeenCalledTimes(1);
    expect(parentOnMove).not.toHaveBeenCalled();
  });

  it("falls back to mouse events when PointerEvent is unavailable", () => {
    vi.stubGlobal("PointerEvent", undefined);

    try {
      const events: MoveEvent[] = [];
      const addEvent = (event: MoveEvent) => events.push(event);
      const { moveProps } = useMove({
        onMoveStart: addEvent,
        onMove: addEvent,
        onMoveEnd: addEvent,
      });
      const handlers = moveProps as MoveHandlers;

      handlers.onMousedown?.(
        createMouseEvent("mousedown", {
          button: 0,
          pageX: 1,
          pageY: 30,
        })
      );

      window.dispatchEvent(createMouseEvent("mousemove", { pageX: 10, pageY: 25 }));
      window.dispatchEvent(createMouseEvent("mouseup", { pageX: 10, pageY: 25 }));

      expect(events).toHaveLength(3);
      expect(events[0]).toMatchObject({ type: "movestart", pointerType: "mouse" });
      expect(events[1]).toMatchObject({
        type: "move",
        pointerType: "mouse",
        deltaX: 9,
        deltaY: -5,
      });
      expect(events[2]).toMatchObject({ type: "moveend", pointerType: "mouse" });
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("falls back to touch events when PointerEvent is unavailable", () => {
    vi.stubGlobal("PointerEvent", undefined);

    try {
      const events: MoveEvent[] = [];
      const addEvent = (event: MoveEvent) => events.push(event);
      const { moveProps } = useMove({
        onMoveStart: addEvent,
        onMove: addEvent,
        onMoveEnd: addEvent,
      });
      const handlers = moveProps as MoveHandlers;

      handlers.onTouchstart?.(createTouchEvent("touchstart", 5, 1, 30));
      window.dispatchEvent(createTouchEvent("touchmove", 5, 10, 25));
      window.dispatchEvent(createTouchEvent("touchend", 5, 10, 25));

      expect(events).toHaveLength(3);
      expect(events[0]).toMatchObject({ type: "movestart", pointerType: "touch" });
      expect(events[1]).toMatchObject({
        type: "move",
        pointerType: "touch",
        deltaX: 9,
        deltaY: -5,
      });
      expect(events[2]).toMatchObject({ type: "moveend", pointerType: "touch" });
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
