import { effectScope } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useSpinButton } from "../src";

describe("useSpinButton", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns spinbutton role and aria value attributes", () => {
    const scope = effectScope();
    const result = scope.run(() =>
      useSpinButton({ value: 2, textValue: "2 items", minValue: 1, maxValue: 3 })
    )!;

    expect(result.spinButtonProps.role).toBe("spinbutton");
    expect(result.spinButtonProps["aria-valuenow"]).toBe(2);
    expect(result.spinButtonProps["aria-valuemin"]).toBe(1);
    expect(result.spinButtonProps["aria-valuemax"]).toBe(3);
    expect(result.spinButtonProps["aria-valuetext"]).toBe("2 items");
    expect(result.spinButtonProps["aria-disabled"]).toBeUndefined();
    expect(result.spinButtonProps["aria-readonly"]).toBeUndefined();
    scope.stop();
  });

  it("sets disabled and readonly aria attributes", () => {
    const scope = effectScope();
    const result = scope.run(() => useSpinButton({ value: 2, isDisabled: true, isReadOnly: true }))!;

    expect(result.spinButtonProps["aria-disabled"]).toBe(true);
    expect(result.spinButtonProps["aria-readonly"]).toBe(true);
    scope.stop();
  });

  it("triggers increment/decrement handlers from keyboard", () => {
    const onIncrement = vi.fn();
    const onDecrement = vi.fn();
    const onIncrementPage = vi.fn();
    const onDecrementPage = vi.fn();
    const onDecrementToMin = vi.fn();
    const onIncrementToMax = vi.fn();

    const scope = effectScope();
    const result = scope.run(() =>
      useSpinButton({
        value: 2,
        onIncrement,
        onDecrement,
        onIncrementPage,
        onDecrementPage,
        onDecrementToMin,
        onIncrementToMax,
      })
    )!;

    const onKeyDown = result.spinButtonProps.onKeyDown as (event: KeyboardEvent) => void;
    onKeyDown({ key: "ArrowUp", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    onKeyDown({ key: "ArrowDown", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    onKeyDown({ key: "PageUp", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    onKeyDown({ key: "PageDown", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    onKeyDown({ key: "Home", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    onKeyDown({ key: "End", preventDefault: vi.fn() } as unknown as KeyboardEvent);

    expect(onIncrement).toHaveBeenCalledTimes(1);
    expect(onDecrement).toHaveBeenCalledTimes(1);
    expect(onIncrementPage).toHaveBeenCalledTimes(1);
    expect(onDecrementPage).toHaveBeenCalledTimes(1);
    expect(onDecrementToMin).toHaveBeenCalledTimes(1);
    expect(onIncrementToMax).toHaveBeenCalledTimes(1);
    scope.stop();
  });

  it("falls back from page handlers to increment/decrement", () => {
    const onIncrement = vi.fn();
    const onDecrement = vi.fn();
    const scope = effectScope();
    const result = scope.run(() =>
      useSpinButton({
        value: 2,
        onIncrement,
        onDecrement,
      })
    )!;

    const onKeyDown = result.spinButtonProps.onKeyDown as (event: KeyboardEvent) => void;
    onKeyDown({ key: "PageUp", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    onKeyDown({ key: "PageDown", preventDefault: vi.fn() } as unknown as KeyboardEvent);

    expect(onIncrement).toHaveBeenCalledTimes(1);
    expect(onDecrement).toHaveBeenCalledTimes(1);
    scope.stop();
  });

  it("replaces hyphen with minus sign in aria-valuetext", () => {
    const scope = effectScope();
    const result = scope.run(() =>
      useSpinButton({ value: -2, textValue: "-2 items" })
    )!;

    expect(result.spinButtonProps["aria-valuetext"]).toBe("−2 items");
    scope.stop();
  });

  it("does not increment on touch press end without press up", () => {
    const onIncrement = vi.fn();
    const scope = effectScope();
    const result = scope.run(() => useSpinButton({ value: 1, onIncrement }))!;

    (result.incrementButtonProps.onPressStart as (event: any) => void)({
      pointerType: "touch",
      target: document.createElement("button"),
    });
    (result.incrementButtonProps.onPressEnd as (event: any) => void)({
      pointerType: "touch",
      target: document.createElement("button"),
    });

    expect(onIncrement).not.toHaveBeenCalled();
    scope.stop();
  });

  it("increments on touch press up + press end", () => {
    const onIncrement = vi.fn();
    const scope = effectScope();
    const result = scope.run(() => useSpinButton({ value: 1, onIncrement }))!;

    (result.incrementButtonProps.onPressStart as (event: any) => void)({
      pointerType: "touch",
      target: document.createElement("button"),
    });
    (result.incrementButtonProps.onPressUp as (event: any) => void)({
      pointerType: "touch",
      target: document.createElement("button"),
    });
    (result.incrementButtonProps.onPressEnd as (event: any) => void)({
      pointerType: "touch",
      target: document.createElement("button"),
    });

    expect(onIncrement).toHaveBeenCalledTimes(1);
    scope.stop();
  });
});
