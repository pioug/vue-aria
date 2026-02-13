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

  it("keeps live canIncrement/canDecrement and numberValue in sync", () => {
    const scope = effectScope();
    const state = scope.run(() =>
      useNumberFieldState({
        locale: "en-US",
        defaultValue: 0,
        minValue: 0,
        maxValue: 1,
      })
    )!;

    expect(state.canDecrement).toBe(false);
    expect(state.canIncrement).toBe(true);

    state.increment();
    expect(state.numberValue).toBe(1);
    expect(state.canIncrement).toBe(false);
    expect(state.canDecrement).toBe(true);
    scope.stop();
  });

  it("parses localized separators and validates partial input", () => {
    const scope = effectScope();
    const state = scope.run(() =>
      useNumberFieldState({
        locale: "fr-FR",
        defaultValue: 0,
        minValue: 0,
        maxValue: 2000,
      })
    )!;

    state.commit("1 234,5");
    expect(state.numberValue).toBe(1234.5);

    expect(state.validate("-")).toBe(false);
    expect(state.validate("1,")).toBe(true);
    scope.stop();
  });
});
