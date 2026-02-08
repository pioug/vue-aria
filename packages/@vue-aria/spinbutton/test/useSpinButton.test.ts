import { describe, expect, it, vi } from "vitest";
import { useSpinButton } from "../src/useSpinButton";
import type { PressEvent } from "@vue-aria/types";

interface SpinHandlers {
  onKeydown?: (event: KeyboardEvent) => void;
}

interface StepperHandlers {
  onPressStart?: (event: PressEvent) => void;
  onPressEnd?: (event: PressEvent) => void;
}

describe("useSpinButton", () => {
  it("returns spinbutton role and aria attributes", () => {
    const { spinButtonProps } = useSpinButton({
      value: 2,
      textValue: "2 items",
      minValue: 1,
      maxValue: 3,
    });

    expect(spinButtonProps.value.role).toBe("spinbutton");
    expect(spinButtonProps.value["aria-valuenow"]).toBe(2);
    expect(spinButtonProps.value["aria-valuemin"]).toBe(1);
    expect(spinButtonProps.value["aria-valuemax"]).toBe(3);
    expect(spinButtonProps.value["aria-valuetext"]).toBe("2 items");
    expect(spinButtonProps.value["aria-disabled"]).toBeUndefined();
    expect(spinButtonProps.value["aria-readonly"]).toBeUndefined();
  });

  it("sets aria-disabled and aria-readonly when configured", () => {
    const disabled = useSpinButton({ value: 2, isDisabled: true });
    expect(disabled.spinButtonProps.value["aria-disabled"]).toBe(true);

    const readOnly = useSpinButton({ value: 2, isReadOnly: true });
    expect(readOnly.spinButtonProps.value["aria-readonly"]).toBe(true);
  });

  it("triggers increment/decrement keyboard actions", () => {
    const onIncrement = vi.fn();
    const onDecrement = vi.fn();
    const { spinButtonProps } = useSpinButton({
      value: 2,
      onIncrement,
      onDecrement,
    });
    const handlers = spinButtonProps.value as SpinHandlers;

    const up = new KeyboardEvent("keydown", {
      key: "ArrowUp",
      bubbles: true,
      cancelable: true,
    });
    handlers.onKeydown?.(up);
    expect(up.defaultPrevented).toBe(true);
    expect(onIncrement).toHaveBeenCalledTimes(1);

    const down = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      bubbles: true,
      cancelable: true,
    });
    handlers.onKeydown?.(down);
    expect(down.defaultPrevented).toBe(true);
    expect(onDecrement).toHaveBeenCalledTimes(1);
  });

  it("supports page/home/end key actions", () => {
    const onIncrementPage = vi.fn();
    const onDecrementPage = vi.fn();
    const onDecrementToMin = vi.fn();
    const onIncrementToMax = vi.fn();
    const { spinButtonProps } = useSpinButton({
      value: 2,
      onIncrementPage,
      onDecrementPage,
      onDecrementToMin,
      onIncrementToMax,
    });
    const handlers = spinButtonProps.value as SpinHandlers;

    handlers.onKeydown?.(new KeyboardEvent("keydown", { key: "PageUp", cancelable: true }));
    handlers.onKeydown?.(
      new KeyboardEvent("keydown", { key: "PageDown", cancelable: true })
    );
    handlers.onKeydown?.(new KeyboardEvent("keydown", { key: "Home", cancelable: true }));
    handlers.onKeydown?.(new KeyboardEvent("keydown", { key: "End", cancelable: true }));

    expect(onIncrementPage).toHaveBeenCalledTimes(1);
    expect(onDecrementPage).toHaveBeenCalledTimes(1);
    expect(onDecrementToMin).toHaveBeenCalledTimes(1);
    expect(onIncrementToMax).toHaveBeenCalledTimes(1);
  });

  it("falls back from page keys to increment/decrement", () => {
    const onIncrement = vi.fn();
    const onDecrement = vi.fn();
    const { spinButtonProps } = useSpinButton({
      value: 2,
      onIncrement,
      onDecrement,
    });
    const handlers = spinButtonProps.value as SpinHandlers;

    handlers.onKeydown?.(new KeyboardEvent("keydown", { key: "PageUp", cancelable: true }));
    handlers.onKeydown?.(
      new KeyboardEvent("keydown", { key: "PageDown", cancelable: true })
    );

    expect(onIncrement).toHaveBeenCalledTimes(1);
    expect(onDecrement).toHaveBeenCalledTimes(1);
  });

  it("handles touch and mouse button press semantics", () => {
    const onIncrement = vi.fn();
    const onDecrement = vi.fn();
    const { incrementButtonProps, decrementButtonProps } = useSpinButton({
      onIncrement,
      onDecrement,
    });
    const incHandlers = incrementButtonProps.value as StepperHandlers;
    const decHandlers = decrementButtonProps.value as StepperHandlers;

    incHandlers.onPressStart?.({
      type: "press",
      pointerType: "mouse",
      target: null,
      originalEvent: new Event("mousedown"),
    });
    expect(onIncrement).toHaveBeenCalledTimes(1);

    incHandlers.onPressEnd?.({
      type: "press",
      pointerType: "touch",
      target: null,
      originalEvent: new Event("pointerup"),
    });
    expect(onIncrement).toHaveBeenCalledTimes(2);

    decHandlers.onPressStart?.({
      type: "press",
      pointerType: "mouse",
      target: null,
      originalEvent: new Event("mousedown"),
    });
    decHandlers.onPressEnd?.({
      type: "press",
      pointerType: "touch",
      target: null,
      originalEvent: new Event("pointerup"),
    });
    expect(onDecrement).toHaveBeenCalledTimes(2);
  });
});
