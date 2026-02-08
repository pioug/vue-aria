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
});
