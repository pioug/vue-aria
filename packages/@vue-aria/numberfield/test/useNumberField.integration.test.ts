import { effectScope } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useNumberField } from "../src";
import { useNumberFieldState } from "@vue-aria/numberfield-state";

describe("useNumberField integration with useNumberFieldState", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("increments via stepper press handlers", () => {
    const onChange = vi.fn();
    const input = document.createElement("input");
    const button = document.createElement("button");
    document.body.appendChild(input);
    document.body.appendChild(button);

    const scope = effectScope();
    const result = scope.run(() => {
      const state = useNumberFieldState({
        locale: "en-US",
        defaultValue: 2,
        onChange,
      });
      return useNumberField({ "aria-label": "Quantity" }, state as any, { current: input });
    })!;

    (result.incrementButtonProps.onPressStart as (event: any) => void)({
      pointerType: "mouse",
      target: button,
    });

    expect(onChange).toHaveBeenCalled();
    scope.stop();
    input.remove();
    button.remove();
  });

  it("does not increment on touch press end without press up", () => {
    const onChange = vi.fn();
    const input = document.createElement("input");
    const button = document.createElement("button");
    document.body.appendChild(input);
    document.body.appendChild(button);

    const scope = effectScope();
    const result = scope.run(() => {
      const state = useNumberFieldState({
        locale: "en-US",
        defaultValue: 2,
        onChange,
      });
      return useNumberField({ "aria-label": "Quantity" }, state as any, { current: input });
    })!;

    (result.incrementButtonProps.onPressStart as (event: any) => void)({
      pointerType: "touch",
      target: button,
    });
    (result.incrementButtonProps.onPressEnd as (event: any) => void)({
      pointerType: "touch",
      target: button,
    });

    expect(onChange).not.toHaveBeenCalled();
    scope.stop();
    input.remove();
    button.remove();
  });

  it("increments once on touch press up followed by press end", () => {
    const onChange = vi.fn();
    const input = document.createElement("input");
    const button = document.createElement("button");
    document.body.appendChild(input);
    document.body.appendChild(button);

    const scope = effectScope();
    const result = scope.run(() => {
      const state = useNumberFieldState({
        locale: "en-US",
        defaultValue: 2,
        onChange,
      });
      return useNumberField({ "aria-label": "Quantity" }, state as any, { current: input });
    })!;

    (result.incrementButtonProps.onPressStart as (event: any) => void)({
      pointerType: "touch",
      target: button,
    });
    (result.incrementButtonProps.onPressUp as (event: any) => void)({
      pointerType: "touch",
      target: button,
    });
    (result.incrementButtonProps.onPressEnd as (event: any) => void)({
      pointerType: "touch",
      target: button,
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(3);
    scope.stop();
    input.remove();
    button.remove();
  });

  it("cancels touch repeat when pointercancel fires", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const input = document.createElement("input");
    const button = document.createElement("button");
    document.body.appendChild(input);
    document.body.appendChild(button);

    const scope = effectScope();
    const result = scope.run(() => {
      const state = useNumberFieldState({
        locale: "en-US",
        defaultValue: 2,
        onChange,
      });
      return useNumberField({ "aria-label": "Quantity" }, state as any, { current: input });
    })!;

    (result.incrementButtonProps.onPressStart as (event: any) => void)({
      pointerType: "touch",
      target: button,
    });
    window.dispatchEvent(new Event("pointercancel"));
    vi.advanceTimersByTime(700);

    expect(onChange).not.toHaveBeenCalled();
    scope.stop();
    input.remove();
    button.remove();
  });

  it("stops mouse repeat increments after press up", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const input = document.createElement("input");
    const button = document.createElement("button");
    document.body.appendChild(input);
    document.body.appendChild(button);

    const scope = effectScope();
    const result = scope.run(() => {
      const state = useNumberFieldState({
        locale: "en-US",
        defaultValue: 2,
        onChange,
      });
      return useNumberField({ "aria-label": "Quantity" }, state as any, { current: input });
    })!;

    (result.incrementButtonProps.onPressStart as (event: any) => void)({
      pointerType: "mouse",
      target: button,
    });
    vi.advanceTimersByTime(450);
    const callsBeforeRelease = onChange.mock.calls.length;
    (result.incrementButtonProps.onPressUp as (event: any) => void)({
      pointerType: "mouse",
      target: button,
    });
    vi.advanceTimersByTime(300);

    expect(onChange.mock.calls.length).toBe(callsBeforeRelease);
    scope.stop();
    input.remove();
    button.remove();
  });
});
