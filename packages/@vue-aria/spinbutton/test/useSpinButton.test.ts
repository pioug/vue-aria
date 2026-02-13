import { effectScope, nextTick, reactive } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as liveAnnouncer from "@vue-aria/live-announcer";
import { useSpinButton } from "../src";

describe("useSpinButton", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
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

  it("announces updated value while focused and ignores updates when blurred", async () => {
    const announceSpy = vi.spyOn(liveAnnouncer, "announce").mockImplementation(() => {});
    const clearSpy = vi.spyOn(liveAnnouncer, "clearAnnouncer").mockImplementation(() => {});
    const props = reactive({ value: 2 });

    const scope = effectScope();
    const result = scope.run(() => useSpinButton(props))!;
    (result.spinButtonProps.onFocus as (() => void))?.();

    props.value = 3;
    await nextTick();
    expect(clearSpy).toHaveBeenCalledTimes(1);
    expect(announceSpy).toHaveBeenCalledTimes(1);
    expect(announceSpy).toHaveBeenCalledWith("3", "assertive");

    (result.spinButtonProps.onBlur as (() => void))?.();
    props.value = 4;
    await nextTick();
    expect(announceSpy).toHaveBeenCalledTimes(1);

    scope.stop();
  });

  it("announces updated textValue with minus-sign normalization while focused", async () => {
    const announceSpy = vi.spyOn(liveAnnouncer, "announce").mockImplementation(() => {});
    const props = reactive({ value: -2, textValue: "-2 items" });

    const scope = effectScope();
    const result = scope.run(() => useSpinButton(props))!;
    (result.spinButtonProps.onFocus as (() => void))?.();

    props.value = -3;
    props.textValue = "-3 items";
    await nextTick();

    expect(announceSpy).toHaveBeenCalledWith("−3 items", "assertive");
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

  it("decrements on touch press up + press end", () => {
    const onDecrement = vi.fn();
    const scope = effectScope();
    const result = scope.run(() => useSpinButton({ value: 1, onDecrement }))!;

    (result.decrementButtonProps.onPressStart as (event: any) => void)({
      pointerType: "touch",
      target: document.createElement("button"),
    });
    (result.decrementButtonProps.onPressUp as (event: any) => void)({
      pointerType: "touch",
      target: document.createElement("button"),
    });
    (result.decrementButtonProps.onPressEnd as (event: any) => void)({
      pointerType: "touch",
      target: document.createElement("button"),
    });

    expect(onDecrement).toHaveBeenCalledTimes(1);
    scope.stop();
  });

  it("cancels touch spin when pointercancel fires", () => {
    vi.useFakeTimers();
    const onIncrement = vi.fn();
    const scope = effectScope();
    const result = scope.run(() => useSpinButton({ value: 1, onIncrement }))!;

    (result.incrementButtonProps.onPressStart as (event: any) => void)({
      pointerType: "touch",
      target: document.createElement("button"),
    });
    window.dispatchEvent(new Event("pointercancel"));
    vi.advanceTimersByTime(700);

    expect(onIncrement).not.toHaveBeenCalled();
    scope.stop();
  });

  it("does not emit repeated increments when value props are static", () => {
    vi.useFakeTimers();
    const onIncrement = vi.fn();
    const scope = effectScope();
    const result = scope.run(() => useSpinButton({ value: 1, onIncrement }))!;

    (result.incrementButtonProps.onPressStart as (event: any) => void)({
      pointerType: "mouse",
      target: document.createElement("button"),
    });

    vi.advanceTimersByTime(500);
    expect(onIncrement).toHaveBeenCalledTimes(1);
    scope.stop();
  });

  it("stops repeating increment after press up", () => {
    vi.useFakeTimers();
    const onIncrement = vi.fn();
    const scope = effectScope();
    const result = scope.run(() => useSpinButton({ value: 1, onIncrement }))!;

    (result.incrementButtonProps.onPressStart as (event: any) => void)({
      pointerType: "mouse",
      target: document.createElement("button"),
    });
    vi.advanceTimersByTime(450);
    const countBeforeRelease = onIncrement.mock.calls.length;
    (result.incrementButtonProps.onPressUp as (event: any) => void)({
      pointerType: "mouse",
      target: document.createElement("button"),
    });
    vi.advanceTimersByTime(300);

    expect(onIncrement.mock.calls.length).toBe(countBeforeRelease);
    scope.stop();
  });
});
