import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useNumberFieldState } from "../src";

describe("useNumberFieldState", () => {
  it("initializes from default value and formats input value", () => {
    const scope = effectScope();
    const state = scope.run(() =>
      useNumberFieldState({
        locale: "en-US",
        defaultValue: 5,
      })
    )!;

    expect(state.numberValue).toBe(5);
    expect(state.inputValue).toBe("5");
    scope.stop();
  });

  it("increments and decrements by step", () => {
    const onChange = vi.fn();
    const scope = effectScope();
    const state = scope.run(() =>
      useNumberFieldState({
        locale: "en-US",
        defaultValue: 2,
        step: 2,
        onChange,
      })
    )!;

    state.increment();
    state.decrement();

    expect(onChange).toHaveBeenNthCalledWith(1, 4);
    expect(onChange).toHaveBeenNthCalledWith(2, 2);
    scope.stop();
  });

  it("commits clamped values respecting min/max", () => {
    const onChange = vi.fn();
    const scope = effectScope();
    const state = scope.run(() =>
      useNumberFieldState({
        locale: "en-US",
        defaultValue: 1,
        minValue: 0,
        maxValue: 10,
        onChange,
      })
    )!;

    state.commit("22");
    expect(onChange).toHaveBeenCalledWith(10);

    state.commit("-5");
    expect(onChange).toHaveBeenCalledWith(0);
    scope.stop();
  });
});
