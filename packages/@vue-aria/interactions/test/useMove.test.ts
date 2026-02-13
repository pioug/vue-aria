import { effectScope } from "vue";
import { describe, expect, it } from "vitest";
import { useMove } from "../src/useMove";

const defaultModifiers = {
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
};

describe("useMove", () => {
  it("responds to keyboard arrow key events", () => {
    const events: any[] = [];
    const addEvent = (event: any) => events.push(event);

    const scope = effectScope();
    const { moveProps } = scope.run(() =>
      useMove({ onMoveStart: addEvent, onMove: addEvent, onMoveEnd: addEvent })
    )!;

    const onKeydown = moveProps.onKeydown as (event: KeyboardEvent) => void;
    const event = new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true, cancelable: true });
    onKeydown(event);

    expect(events).toEqual([
      { type: "movestart", pointerType: "keyboard", ...defaultModifiers },
      { type: "move", pointerType: "keyboard", deltaX: 0, deltaY: -1, ...defaultModifiers },
      { type: "moveend", pointerType: "keyboard", ...defaultModifiers },
    ]);

    scope.stop();
  });

  it("responds to primary pointer/mouse drag events", () => {
    const events: any[] = [];
    const addEvent = (event: any) => events.push(event);

    const scope = effectScope();
    const { moveProps } = scope.run(() =>
      useMove({ onMoveStart: addEvent, onMove: addEvent, onMoveEnd: addEvent })
    )!;

    const target = document.createElement("div");

    if (moveProps.onPointerdown) {
      const onPointerDown = moveProps.onPointerdown as (event: PointerEvent) => void;
      const pointerDown = new MouseEvent("pointerdown", {
        button: 0,
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(pointerDown, "pageX", { value: 1 });
      Object.defineProperty(pointerDown, "pageY", { value: 30 });
      Object.defineProperty(pointerDown, "pointerId", { value: 1 });
      Object.defineProperty(pointerDown, "pointerType", { value: "mouse" });
      Object.defineProperty(pointerDown, "target", { value: target });
      Object.defineProperty(pointerDown, "currentTarget", { value: target });
      onPointerDown(pointerDown as PointerEvent);

      const pointerMove = new MouseEvent("pointermove", { button: 0, bubbles: true, cancelable: true });
      Object.defineProperty(pointerMove, "pageX", { value: 10 });
      Object.defineProperty(pointerMove, "pageY", { value: 25 });
      Object.defineProperty(pointerMove, "pointerId", { value: 1 });
      Object.defineProperty(pointerMove, "pointerType", { value: "mouse" });
      window.dispatchEvent(pointerMove);

      const pointerUp = new MouseEvent("pointerup", { button: 0, bubbles: true, cancelable: true });
      Object.defineProperty(pointerUp, "pointerId", { value: 1 });
      Object.defineProperty(pointerUp, "pointerType", { value: "mouse" });
      window.dispatchEvent(pointerUp);
    } else {
      const onMouseDown = moveProps.onMousedown as (event: MouseEvent) => void;
      const mouseDown = new MouseEvent("mousedown", { button: 0, bubbles: true, cancelable: true });
      Object.defineProperty(mouseDown, "pageX", { value: 1 });
      Object.defineProperty(mouseDown, "pageY", { value: 30 });
      Object.defineProperty(mouseDown, "target", { value: target });
      Object.defineProperty(mouseDown, "currentTarget", { value: target });
      onMouseDown(mouseDown);

      const mouseMove = new MouseEvent("mousemove", { button: 0, bubbles: true, cancelable: true });
      Object.defineProperty(mouseMove, "pageX", { value: 10 });
      Object.defineProperty(mouseMove, "pageY", { value: 25 });
      window.dispatchEvent(mouseMove);

      const mouseUp = new MouseEvent("mouseup", { button: 0, bubbles: true, cancelable: true });
      window.dispatchEvent(mouseUp);
    }

    expect(events).toEqual([
      { type: "movestart", pointerType: "mouse", ...defaultModifiers },
      { type: "move", pointerType: "mouse", deltaX: 9, deltaY: -5, ...defaultModifiers },
      { type: "moveend", pointerType: "mouse", ...defaultModifiers },
    ]);

    scope.stop();
  });

  it("does not respond to right-click drag", () => {
    const events: any[] = [];
    const addEvent = (event: any) => events.push(event);

    const scope = effectScope();
    const { moveProps } = scope.run(() =>
      useMove({ onMoveStart: addEvent, onMove: addEvent, onMoveEnd: addEvent })
    )!;

    const target = document.createElement("div");

    if (moveProps.onPointerdown) {
      const onPointerDown = moveProps.onPointerdown as (event: PointerEvent) => void;
      const pointerDown = new MouseEvent("pointerdown", {
        button: 2,
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(pointerDown, "pageX", { value: 1 });
      Object.defineProperty(pointerDown, "pageY", { value: 30 });
      Object.defineProperty(pointerDown, "pointerId", { value: 1 });
      Object.defineProperty(pointerDown, "pointerType", { value: "mouse" });
      Object.defineProperty(pointerDown, "target", { value: target });
      Object.defineProperty(pointerDown, "currentTarget", { value: target });
      onPointerDown(pointerDown as PointerEvent);
    } else {
      const onMouseDown = moveProps.onMousedown as (event: MouseEvent) => void;
      const mouseDown = new MouseEvent("mousedown", {
        button: 2,
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(mouseDown, "pageX", { value: 1 });
      Object.defineProperty(mouseDown, "pageY", { value: 30 });
      Object.defineProperty(mouseDown, "target", { value: target });
      Object.defineProperty(mouseDown, "currentTarget", { value: target });
      onMouseDown(mouseDown);
    }

    expect(events).toEqual([]);

    scope.stop();
  });
});
