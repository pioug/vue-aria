import { describe, expect, it, vi } from "vitest";
import { usePress } from "../src/usePress";

interface PressHandlers {
  onPointerdown: (event: PointerEvent) => void;
  onPointerup: (event: PointerEvent) => void;
  onPointercancel: (event: PointerEvent) => void;
  onKeydown: (event: KeyboardEvent) => void;
  onKeyup: (event: KeyboardEvent) => void;
  onClick: (event: MouseEvent) => void;
}

describe("usePress", () => {
  it("handles pointer press lifecycle", () => {
    const onPressStart = vi.fn();
    const onPressEnd = vi.fn();
    const onPress = vi.fn();
    const { pressProps, isPressed } = usePress({ onPressStart, onPressEnd, onPress });
    const handlers = pressProps as unknown as PressHandlers;

    handlers.onPointerdown(
      new PointerEvent("pointerdown", {
        button: 0,
        pointerType: "mouse",
      })
    );
    expect(isPressed.value).toBe(true);
    expect(onPressStart).toHaveBeenCalledTimes(1);
    expect(onPressStart.mock.calls[0][0].pointerType).toBe("mouse");

    handlers.onPointerup(
      new PointerEvent("pointerup", {
        button: 0,
        pointerType: "mouse",
      })
    );
    expect(isPressed.value).toBe(false);
    expect(onPressEnd).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("fires keyboard press on enter immediately", () => {
    const onPressStart = vi.fn();
    const onPressEnd = vi.fn();
    const onPress = vi.fn();
    const { pressProps, isPressed } = usePress({ onPressStart, onPressEnd, onPress });
    const handlers = pressProps as unknown as PressHandlers;
    const enterDown = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });

    handlers.onKeydown(enterDown);

    expect(isPressed.value).toBe(false);
    expect(onPressStart).toHaveBeenCalledTimes(1);
    expect(onPressEnd).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress.mock.calls[0][0].pointerType).toBe("keyboard");
    expect(enterDown.defaultPrevented).toBe(true);
  });

  it("fires keyboard press on space keyup", () => {
    const onPressStart = vi.fn();
    const onPressEnd = vi.fn();
    const onPress = vi.fn();
    const { pressProps, isPressed } = usePress({ onPressStart, onPressEnd, onPress });
    const handlers = pressProps as unknown as PressHandlers;
    const spaceDown = new KeyboardEvent("keydown", {
      key: " ",
      bubbles: true,
      cancelable: true,
    });
    const spaceUp = new KeyboardEvent("keyup", {
      key: " ",
      bubbles: true,
      cancelable: true,
    });

    handlers.onKeydown(spaceDown);
    expect(isPressed.value).toBe(true);
    expect(onPressStart).toHaveBeenCalledTimes(1);
    expect(spaceDown.defaultPrevented).toBe(true);

    handlers.onKeyup(spaceUp);
    expect(isPressed.value).toBe(false);
    expect(onPressEnd).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress.mock.calls[0][0].pointerType).toBe("keyboard");
    expect(spaceUp.defaultPrevented).toBe(true);
  });

  it("fires virtual press from detail=0 click", () => {
    const onPress = vi.fn();
    const { pressProps } = usePress({ onPress });
    const handlers = pressProps as unknown as PressHandlers;

    handlers.onClick(new MouseEvent("click"));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress.mock.calls[0][0].pointerType).toBe("virtual");
  });

  it("does not fire virtual press from non-virtual click", () => {
    const onPress = vi.fn();
    const { pressProps } = usePress({ onPress });
    const handlers = pressProps as unknown as PressHandlers;

    handlers.onClick(new MouseEvent("click", { detail: 1 }));

    expect(onPress).not.toHaveBeenCalled();
  });

  it("does not press when disabled", () => {
    const onPressStart = vi.fn();
    const onPress = vi.fn();
    const { pressProps, isPressed } = usePress({
      isDisabled: true,
      onPressStart,
      onPress,
    });
    const handlers = pressProps as unknown as PressHandlers;

    handlers.onPointerdown(
      new PointerEvent("pointerdown", {
        button: 0,
        pointerType: "mouse",
      })
    );
    handlers.onKeydown(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    handlers.onClick(new MouseEvent("click"));

    expect(isPressed.value).toBe(false);
    expect(onPressStart).not.toHaveBeenCalled();
    expect(onPress).not.toHaveBeenCalled();
  });

  it("cancels active press without triggering onPress", () => {
    const onPressEnd = vi.fn();
    const onPress = vi.fn();
    const { pressProps, isPressed } = usePress({ onPressEnd, onPress });
    const handlers = pressProps as unknown as PressHandlers;

    handlers.onPointerdown(
      new PointerEvent("pointerdown", {
        button: 0,
        pointerType: "touch",
      })
    );
    expect(isPressed.value).toBe(true);

    handlers.onPointercancel(new PointerEvent("pointercancel", { pointerType: "touch" }));

    expect(isPressed.value).toBe(false);
    expect(onPressEnd).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
  });

  it("cancels touch press when the page scrolls", () => {
    const onPressEnd = vi.fn();
    const onPress = vi.fn();
    const { pressProps, isPressed } = usePress({ onPressEnd, onPress });
    const handlers = pressProps as unknown as PressHandlers;
    const target = document.createElement("div");
    document.body.appendChild(target);

    const pointerDown = new PointerEvent("pointerdown", {
      button: 0,
      pointerType: "touch",
    });
    Object.defineProperty(pointerDown, "pointerType", { value: "touch" });
    Object.defineProperty(pointerDown, "target", { value: target });
    Object.defineProperty(pointerDown, "currentTarget", { value: target });
    handlers.onPointerdown(pointerDown);

    expect(isPressed.value).toBe(true);

    window.dispatchEvent(new Event("scroll", { bubbles: true }));

    expect(isPressed.value).toBe(false);
    expect(onPressEnd).toHaveBeenCalledTimes(1);
    expect(onPressEnd.mock.calls[0]?.[0].pointerType).toBe("touch");
    expect(onPress).not.toHaveBeenCalled();
  });

  it("does not cancel mouse press on scroll", () => {
    const onPress = vi.fn();
    const { pressProps, isPressed } = usePress({ onPress });
    const handlers = pressProps as unknown as PressHandlers;

    handlers.onPointerdown(
      new PointerEvent("pointerdown", {
        button: 0,
        pointerType: "mouse",
      })
    );
    window.dispatchEvent(new Event("scroll", { bubbles: true }));
    expect(isPressed.value).toBe(true);

    handlers.onPointerup(
      new PointerEvent("pointerup", {
        button: 0,
        pointerType: "mouse",
      })
    );
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not cancel touch press on scroll events from unrelated regions", () => {
    const onPressEnd = vi.fn();
    const onPress = vi.fn();
    const { pressProps, isPressed } = usePress({ onPressEnd, onPress });
    const handlers = pressProps as unknown as PressHandlers;
    const target = document.createElement("button");
    const unrelatedScrollable = document.createElement("div");
    document.body.appendChild(target);
    document.body.appendChild(unrelatedScrollable);

    const pointerDown = new PointerEvent("pointerdown", {
      button: 0,
      pointerType: "touch",
    });
    Object.defineProperty(pointerDown, "pointerType", { value: "touch" });
    Object.defineProperty(pointerDown, "target", { value: target });
    Object.defineProperty(pointerDown, "currentTarget", { value: target });
    handlers.onPointerdown(pointerDown);
    expect(isPressed.value).toBe(true);

    unrelatedScrollable.dispatchEvent(new Event("scroll", { bubbles: true }));
    expect(isPressed.value).toBe(true);
    expect(onPressEnd).not.toHaveBeenCalled();

    const pointerUp = new PointerEvent("pointerup", {
      button: 0,
      pointerType: "touch",
    });
    Object.defineProperty(pointerUp, "pointerType", { value: "touch" });
    Object.defineProperty(pointerUp, "target", { value: target });
    Object.defineProperty(pointerUp, "currentTarget", { value: target });
    handlers.onPointerup(pointerUp);

    expect(isPressed.value).toBe(false);
    expect(onPressEnd).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("passes modifier keys and coordinates through press events", () => {
    const events: Array<Record<string, unknown>> = [];
    const addEvent = (event: Record<string, unknown>) => events.push(event);
    const { pressProps } = usePress({
      onPressStart: addEvent as (event: any) => void,
      onPressEnd: addEvent as (event: any) => void,
      onPressUp: addEvent as (event: any) => void,
      onPress: addEvent as (event: any) => void,
    });
    const handlers = pressProps as unknown as PressHandlers;
    const target = document.createElement("button");
    document.body.appendChild(target);

    const pointerDown = new PointerEvent("pointerdown", {
      button: 0,
      pointerType: "mouse",
      clientX: 0,
      clientY: 0,
      shiftKey: true,
    });
    Object.defineProperty(pointerDown, "pointerType", { value: "mouse" });
    Object.defineProperty(pointerDown, "target", { value: target });
    Object.defineProperty(pointerDown, "currentTarget", { value: target });
    handlers.onPointerdown(pointerDown);

    const pointerUp = new PointerEvent("pointerup", {
      button: 0,
      pointerType: "mouse",
      clientX: 0,
      clientY: 0,
      ctrlKey: true,
    });
    Object.defineProperty(pointerUp, "pointerType", { value: "mouse" });
    Object.defineProperty(pointerUp, "target", { value: target });
    Object.defineProperty(pointerUp, "currentTarget", { value: target });
    handlers.onPointerup(pointerUp);

    expect(events).toHaveLength(4);
    expect(events[0]).toMatchObject({
      type: "press",
      pointerType: "mouse",
      target,
      shiftKey: true,
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      x: 0,
      y: 0,
    });
    expect(events[2]).toMatchObject({
      type: "press",
      pointerType: "mouse",
      target,
      shiftKey: false,
      ctrlKey: true,
      metaKey: false,
      altKey: false,
      x: 0,
      y: 0,
    });
    expect(events[3]).toMatchObject({
      type: "press",
      pointerType: "mouse",
      target,
      shiftKey: false,
      ctrlKey: true,
      metaKey: false,
      altKey: false,
      x: 0,
      y: 0,
    });
  });
});
