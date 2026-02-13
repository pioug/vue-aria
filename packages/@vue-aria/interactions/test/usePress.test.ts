import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { type PressEvent, usePress } from "../src/usePress";

function createPressLikePointerEvent(
  type: string,
  target: Element,
  options: { pointerId?: number; pointerType?: string; button?: number; clientX?: number; clientY?: number } = {}
): PointerEvent {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    button: options.button ?? 0,
    clientX: options.clientX ?? 0,
    clientY: options.clientY ?? 0,
  });

  Object.defineProperty(event, "pointerId", { value: options.pointerId ?? 1 });
  Object.defineProperty(event, "pointerType", { value: options.pointerType ?? "mouse" });
  Object.defineProperty(event, "target", { value: target });
  Object.defineProperty(event, "currentTarget", { value: target });

  return event as PointerEvent;
}

function toSnapshot(event: PressEvent) {
  return {
    type: event.type,
    target: event.target,
    pointerType: event.pointerType,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
    shiftKey: event.shiftKey,
    altKey: event.altKey,
    x: event.x,
    y: event.y,
    key: event.key,
  };
}

describe("usePress", () => {
  it("fires press events for pointer interactions", () => {
    const events: Array<any> = [];
    const addEvent = (event: PressEvent) => events.push(toSnapshot(event));

    const scope = effectScope();
    const { pressProps } = scope.run(() =>
      usePress({
        onPressStart: addEvent,
        onPressEnd: addEvent,
        onPressChange: (pressed) => events.push({ type: "presschange", pressed }),
        onPress: addEvent,
        onPressUp: addEvent,
        onClick: (event) => events.push({ type: event.type, target: event.target }),
      })
    )!;

    const el = document.createElement("div");
    Object.defineProperty(el, "getBoundingClientRect", {
      value: () => ({
        left: 0,
        top: 0,
        right: 20,
        bottom: 20,
        width: 20,
        height: 20,
      }),
    });

    const onPointerdown = pressProps.onPointerdown as ((event: PointerEvent) => void) | undefined;
    const onMousedown = pressProps.onMousedown as ((event: MouseEvent) => void) | undefined;
    const onClick = pressProps.onClick as ((event: MouseEvent) => void) | undefined;

    if (onPointerdown) {
      const pointerDown = createPressLikePointerEvent("pointerdown", el, {
        pointerId: 1,
        pointerType: "mouse",
        clientX: 5,
        clientY: 7,
      });
      onPointerdown(pointerDown);

      const pointerUp = createPressLikePointerEvent("pointerup", el, {
        pointerId: 1,
        pointerType: "mouse",
        clientX: 5,
        clientY: 7,
      });
      document.dispatchEvent(pointerUp);
    } else {
      const mouseDown = new MouseEvent("mousedown", {
        button: 0,
        bubbles: true,
        cancelable: true,
        detail: 1,
        clientX: 5,
        clientY: 7,
      });
      Object.defineProperty(mouseDown, "target", { value: el });
      Object.defineProperty(mouseDown, "currentTarget", { value: el });
      onMousedown?.(mouseDown);

      const mouseUp = new MouseEvent("mouseup", {
        button: 0,
        bubbles: true,
        cancelable: true,
        clientX: 5,
        clientY: 7,
      });
      Object.defineProperty(mouseUp, "target", { value: el });
      Object.defineProperty(mouseUp, "currentTarget", { value: el });
      document.dispatchEvent(mouseUp);
    }

    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      button: 0,
      clientX: 5,
      clientY: 7,
    });
    Object.defineProperty(clickEvent, "target", { value: el });
    Object.defineProperty(clickEvent, "currentTarget", { value: el });
    onClick?.(clickEvent);

    expect(events).toEqual([
      {
        type: "pressstart",
        target: el,
        pointerType: "mouse",
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 5,
        y: 7,
        key: undefined,
      },
      { type: "presschange", pressed: true },
      {
        type: "pressup",
        target: el,
        pointerType: "mouse",
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 5,
        y: 7,
        key: undefined,
      },
      {
        type: "pressend",
        target: el,
        pointerType: "mouse",
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 5,
        y: 7,
        key: undefined,
      },
      { type: "presschange", pressed: false },
      {
        type: "press",
        target: el,
        pointerType: "mouse",
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 5,
        y: 7,
        key: undefined,
      },
      { type: "click", target: el },
    ]);

    scope.stop();
  });

  it("fires press events for keyboard interactions", () => {
    const events: Array<any> = [];
    const addEvent = (event: PressEvent) => events.push(toSnapshot(event));

    const scope = effectScope();
    const { pressProps } = scope.run(() =>
      usePress({
        onPressStart: addEvent,
        onPressEnd: addEvent,
        onPressChange: (pressed) => events.push({ type: "presschange", pressed }),
        onPress: addEvent,
        onPressUp: addEvent,
      })
    )!;

    const el = document.createElement("button");
    Object.defineProperty(el, "getBoundingClientRect", {
      value: () => ({ left: 0, top: 0, right: 10, bottom: 10, width: 10, height: 10 }),
    });

    const onKeydown = pressProps.onKeydown as (event: KeyboardEvent) => void;
    const onKeyup = pressProps.onKeyup as (event: KeyboardEvent) => void;

    const keyDown = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    Object.defineProperty(keyDown, "target", { value: el });
    Object.defineProperty(keyDown, "currentTarget", { value: el });
    onKeydown(keyDown);

    const keyUp = new KeyboardEvent("keyup", { key: "Enter", bubbles: true, cancelable: true });
    Object.defineProperty(keyUp, "target", { value: el });
    Object.defineProperty(keyUp, "currentTarget", { value: el });
    onKeyup(keyUp);

    expect(events).toEqual([
      {
        type: "pressstart",
        target: el,
        pointerType: "keyboard",
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 5,
        y: 5,
        key: "Enter",
      },
      { type: "presschange", pressed: true },
      {
        type: "pressup",
        target: el,
        pointerType: "keyboard",
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 5,
        y: 5,
        key: "Enter",
      },
      {
        type: "pressend",
        target: el,
        pointerType: "keyboard",
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 5,
        y: 5,
        key: "Enter",
      },
      { type: "presschange", pressed: false },
      {
        type: "press",
        target: el,
        pointerType: "keyboard",
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 5,
        y: 5,
        key: "Enter",
      },
    ]);

    scope.stop();
  });

  it("does not fire press callbacks when disabled", () => {
    const onPressStart = vi.fn();
    const onPressEnd = vi.fn();
    const onPress = vi.fn();
    const onPressUp = vi.fn();

    const scope = effectScope();
    const { pressProps } = scope.run(() =>
      usePress({ isDisabled: true, onPressStart, onPressEnd, onPress, onPressUp })
    )!;

    const el = document.createElement("div");
    const onPointerdown = pressProps.onPointerdown as ((event: PointerEvent) => void) | undefined;
    const onClick = pressProps.onClick as ((event: MouseEvent) => void) | undefined;

    const pointerDown = createPressLikePointerEvent("pointerdown", el);
    onPointerdown?.(pointerDown);

    const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
    Object.defineProperty(clickEvent, "target", { value: el });
    Object.defineProperty(clickEvent, "currentTarget", { value: el });
    onClick?.(clickEvent);

    expect(onPressStart).not.toHaveBeenCalled();
    expect(onPressEnd).not.toHaveBeenCalled();
    expect(onPress).not.toHaveBeenCalled();
    expect(onPressUp).not.toHaveBeenCalled();

    scope.stop();
  });

  it("cancels press on pointer exit when configured", () => {
    const events: string[] = [];

    const scope = effectScope();
    const { pressProps } = scope.run(() =>
      usePress({
        shouldCancelOnPointerExit: true,
        onPressStart: () => events.push("start"),
        onPressEnd: () => events.push("end"),
        onPress: () => events.push("press"),
      })
    )!;

    const el = document.createElement("div");
    const onPointerdown = pressProps.onPointerdown as ((event: PointerEvent) => void) | undefined;
    const onMousedown = pressProps.onMousedown as ((event: MouseEvent) => void) | undefined;
    const onPointerleave = pressProps.onPointerleave as ((event: PointerEvent) => void) | undefined;
    const onMouseleave = pressProps.onMouseleave as ((event: MouseEvent) => void) | undefined;

    if (onPointerdown && onPointerleave) {
      const pointerDown = createPressLikePointerEvent("pointerdown", el, { pointerId: 11 });
      onPointerdown(pointerDown);

      const pointerLeave = createPressLikePointerEvent("pointerleave", el, { pointerId: 11 });
      onPointerleave(pointerLeave);
    } else {
      const mouseDown = new MouseEvent("mousedown", { button: 0, bubbles: true, cancelable: true, detail: 1 });
      Object.defineProperty(mouseDown, "target", { value: el });
      Object.defineProperty(mouseDown, "currentTarget", { value: el });
      onMousedown?.(mouseDown);

      const mouseLeave = new MouseEvent("mouseleave", { bubbles: true, cancelable: true });
      Object.defineProperty(mouseLeave, "target", { value: el });
      Object.defineProperty(mouseLeave, "currentTarget", { value: el });
      onMouseleave?.(mouseLeave);
    }

    expect(events).toEqual(["start", "end"]);

    scope.stop();
  });

  it("supports continuePropagation on press events", () => {
    let shouldStopPropagation = true;

    const scope = effectScope();
    const { pressProps } = scope.run(() =>
      usePress({
        onPressStart: (event) => {
          event.continuePropagation();
          shouldStopPropagation = event.shouldStopPropagation;
        },
      })
    )!;

    const el = document.createElement("div");
    const onPointerdown = pressProps.onPointerdown as ((event: PointerEvent) => void) | undefined;
    const onMousedown = pressProps.onMousedown as ((event: MouseEvent) => void) | undefined;

    if (onPointerdown) {
      const pointerDown = createPressLikePointerEvent("pointerdown", el, { pointerId: 7 });
      onPointerdown(pointerDown);
    } else {
      const mouseDown = new MouseEvent("mousedown", { button: 0, bubbles: true, cancelable: true, detail: 1 });
      Object.defineProperty(mouseDown, "target", { value: el });
      Object.defineProperty(mouseDown, "currentTarget", { value: el });
      onMousedown?.(mouseDown);
    }

    expect(shouldStopPropagation).toBe(false);

    scope.stop();
  });
});
