import { mergeProps } from "@vue-aria/utils";
import { effectScope } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLongPress, type LongPressEvent } from "../src/useLongPress";
import { usePress } from "../src/usePress";

function createPointerLikeEvent(
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
  Object.defineProperty(event, "pointerType", { value: options.pointerType ?? "touch" });
  Object.defineProperty(event, "target", { value: target });
  Object.defineProperty(event, "currentTarget", { value: target });

  return event as PointerEvent;
}

function toSnapshot(event: LongPressEvent) {
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
  };
}

describe("useLongPress", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
  });

  it("performs a long press after threshold", () => {
    const events: Array<any> = [];
    const addEvent = (event: LongPressEvent) => events.push(toSnapshot(event));

    const scope = effectScope();
    const { longPressProps } = scope.run(() =>
      useLongPress({
        onLongPressStart: addEvent,
        onLongPressEnd: addEvent,
        onLongPress: addEvent,
      })
    )!;

    const el = document.createElement("div");
    const onPointerdown = longPressProps.onPointerdown as ((event: PointerEvent) => void) | undefined;
    const onMousedown = longPressProps.onMousedown as ((event: MouseEvent) => void) | undefined;
    const onPointerup = longPressProps.onPointerup as ((event: PointerEvent) => void) | undefined;
    const onMouseup = longPressProps.onMouseup as ((event: MouseEvent) => void) | undefined;

    const expectedPointerType = onPointerdown ? "touch" : "mouse";

    if (onPointerdown) {
      const pointerDown = createPointerLikeEvent("pointerdown", el, { pointerType: "touch" });
      onPointerdown(pointerDown);
    } else {
      const mouseDown = new MouseEvent("mousedown", { bubbles: true, cancelable: true, button: 0, detail: 1 });
      Object.defineProperty(mouseDown, "target", { value: el });
      Object.defineProperty(mouseDown, "currentTarget", { value: el });
      onMousedown?.(mouseDown);
    }

    vi.advanceTimersByTime(400);
    expect(events).toEqual([
      {
        type: "longpressstart",
        target: el,
        pointerType: expectedPointerType,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0,
      },
    ]);

    vi.advanceTimersByTime(200);
    expect(events).toEqual([
      {
        type: "longpressstart",
        target: el,
        pointerType: expectedPointerType,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0,
      },
      {
        type: "longpressend",
        target: el,
        pointerType: expectedPointerType,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0,
      },
      {
        type: "longpress",
        target: el,
        pointerType: expectedPointerType,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0,
      },
    ]);

    if (onPointerup) {
      const pointerUp = createPointerLikeEvent("pointerup", el, { pointerType: "touch" });
      onPointerup(pointerUp);
    } else {
      const mouseUp = new MouseEvent("mouseup", { bubbles: true, cancelable: true, button: 0 });
      Object.defineProperty(mouseUp, "target", { value: el });
      Object.defineProperty(mouseUp, "currentTarget", { value: el });
      onMouseup?.(mouseUp);
    }

    scope.stop();
  });

  it("cancels long press when pointer ends before threshold", () => {
    const events: Array<any> = [];
    const addEvent = (event: LongPressEvent) => events.push(toSnapshot(event));

    const scope = effectScope();
    const { longPressProps } = scope.run(() =>
      useLongPress({
        onLongPressStart: addEvent,
        onLongPressEnd: addEvent,
        onLongPress: addEvent,
      })
    )!;

    const el = document.createElement("div");
    const onPointerdown = longPressProps.onPointerdown as ((event: PointerEvent) => void) | undefined;
    const onMousedown = longPressProps.onMousedown as ((event: MouseEvent) => void) | undefined;

    const expectedPointerType = onPointerdown ? "touch" : "mouse";

    if (onPointerdown) {
      const pointerDown = createPointerLikeEvent("pointerdown", el, { pointerType: "touch" });
      onPointerdown(pointerDown);

      vi.advanceTimersByTime(200);

      const pointerUp = createPointerLikeEvent("pointerup", el, { pointerType: "touch" });
      document.dispatchEvent(pointerUp);
    } else {
      const mouseDown = new MouseEvent("mousedown", { bubbles: true, cancelable: true, button: 0, detail: 1 });
      Object.defineProperty(mouseDown, "target", { value: el });
      Object.defineProperty(mouseDown, "currentTarget", { value: el });
      onMousedown?.(mouseDown);

      vi.advanceTimersByTime(200);

      const mouseUp = new MouseEvent("mouseup", { bubbles: true, cancelable: true, button: 0 });
      Object.defineProperty(mouseUp, "target", { value: el });
      Object.defineProperty(mouseUp, "currentTarget", { value: el });
      document.dispatchEvent(mouseUp);

      const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, detail: 1 });
      Object.defineProperty(clickEvent, "target", { value: el });
      Object.defineProperty(clickEvent, "currentTarget", { value: el });
      (longPressProps.onClick as ((event: MouseEvent) => void) | undefined)?.(clickEvent);
    }

    vi.advanceTimersByTime(800);

    expect(events).toEqual([
      {
        type: "longpressstart",
        target: el,
        pointerType: expectedPointerType,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0,
      },
      {
        type: "longpressend",
        target: el,
        pointerType: expectedPointerType,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0,
      },
    ]);

    scope.stop();
  });

  it("supports custom threshold", () => {
    const onLongPress = vi.fn();

    const scope = effectScope();
    const { longPressProps } = scope.run(() =>
      useLongPress({ onLongPress, threshold: 800 })
    )!;

    const el = document.createElement("div");
    const onPointerdown = longPressProps.onPointerdown as ((event: PointerEvent) => void) | undefined;

    if (onPointerdown) {
      const pointerDown = createPointerLikeEvent("pointerdown", el, { pointerType: "touch" });
      onPointerdown(pointerDown);
    } else {
      const mouseDown = new MouseEvent("mousedown", { bubbles: true, cancelable: true, button: 0, detail: 1 });
      Object.defineProperty(mouseDown, "target", { value: el });
      Object.defineProperty(mouseDown, "currentTarget", { value: el });
      (longPressProps.onMousedown as ((event: MouseEvent) => void) | undefined)?.(mouseDown);
    }

    vi.advanceTimersByTime(600);
    expect(onLongPress).not.toHaveBeenCalled();

    vi.advanceTimersByTime(250);
    expect(onLongPress).toHaveBeenCalledTimes(1);

    scope.stop();
  });

  it("provides accessibility description when enabled", () => {
    const scope = effectScope();
    const { longPressProps } = scope.run(() =>
      useLongPress({
        accessibilityDescription: "Long press to open menu",
        onLongPress: () => {},
      })
    )!;

    const describedBy = longPressProps["aria-describedby"] as string | undefined;
    expect(describedBy).toBeTruthy();

    const descriptionNode = describedBy ? document.getElementById(describedBy) : null;
    expect(descriptionNode?.textContent).toBe("Long press to open menu");

    scope.stop();
  });

  it("omits accessibility description when disabled or handler is missing", () => {
    const disabledScope = effectScope();
    const disabledResult = disabledScope.run(() =>
      useLongPress({
        accessibilityDescription: "Long press to open menu",
        onLongPress: () => {},
        isDisabled: true,
      })
    )!;

    expect(disabledResult.longPressProps["aria-describedby"]).toBeUndefined();
    disabledScope.stop();

    const noHandlerScope = effectScope();
    const noHandlerResult = noHandlerScope.run(() =>
      useLongPress({ accessibilityDescription: "Long press to open menu" })
    )!;

    expect(noHandlerResult.longPressProps["aria-describedby"]).toBeUndefined();
    noHandlerScope.stop();
  });

  it("does not fire long press for keyboard interactions", () => {
    const onLongPressStart = vi.fn();
    const onLongPressEnd = vi.fn();
    const onLongPress = vi.fn();

    const scope = effectScope();
    const { longPressProps } = scope.run(() =>
      useLongPress({
        onLongPressStart,
        onLongPressEnd,
        onLongPress,
        threshold: 800,
      })
    )!;

    const el = document.createElement("div");
    const onKeydown = longPressProps.onKeydown as ((event: KeyboardEvent) => void) | undefined;
    const onKeyup = longPressProps.onKeyup as ((event: KeyboardEvent) => void) | undefined;

    const keyDown = new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true });
    Object.defineProperty(keyDown, "target", { value: el });
    Object.defineProperty(keyDown, "currentTarget", { value: el });
    onKeydown?.(keyDown);

    vi.advanceTimersByTime(600);

    const keyUp = new KeyboardEvent("keyup", { key: " ", bubbles: true, cancelable: true });
    Object.defineProperty(keyUp, "target", { value: el });
    Object.defineProperty(keyUp, "currentTarget", { value: el });
    onKeyup?.(keyUp);

    expect(onLongPressStart).not.toHaveBeenCalled();
    expect(onLongPressEnd).not.toHaveBeenCalled();
    expect(onLongPress).not.toHaveBeenCalled();

    scope.stop();
  });

  it("coexists with usePress handlers", () => {
    const events: string[] = [];

    const scope = effectScope();
    const mergedProps = scope.run(() => {
      const { longPressProps } = useLongPress({
        onLongPressStart: () => events.push("longpressstart"),
        onLongPressEnd: () => events.push("longpressend"),
        onLongPress: () => events.push("longpress"),
      });
      const { pressProps } = usePress({
        onPressStart: () => events.push("pressstart"),
        onPressEnd: () => events.push("pressend"),
      });
      return mergeProps(longPressProps, pressProps);
    })!;

    const el = document.createElement("div");
    const onPointerdown = mergedProps.onPointerdown as ((event: PointerEvent) => void) | undefined;

    if (onPointerdown) {
      const pointerDown = createPointerLikeEvent("pointerdown", el, { pointerType: "touch" });
      onPointerdown(pointerDown);
      vi.advanceTimersByTime(600);
      const pointerUp = createPointerLikeEvent("pointerup", el, { pointerType: "touch" });
      document.dispatchEvent(pointerUp);
      expect(events).toEqual(["longpressstart", "pressstart", "longpressend", "pressend", "longpress"]);
    } else {
      const mouseDown = new MouseEvent("mousedown", { bubbles: true, cancelable: true, button: 0, detail: 1 });
      Object.defineProperty(mouseDown, "target", { value: el });
      Object.defineProperty(mouseDown, "currentTarget", { value: el });
      (mergedProps.onMousedown as ((event: MouseEvent) => void) | undefined)?.(mouseDown);
      vi.advanceTimersByTime(600);
      expect(events).toEqual(["longpressstart", "pressstart", "longpressend", "longpress"]);
    }

    scope.stop();
  });
});
