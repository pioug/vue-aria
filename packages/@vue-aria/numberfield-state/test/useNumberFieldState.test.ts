import { effectScope, nextTick } from "vue";
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

  it("respects min/max constraints during partial sign validation", () => {
    const scope = effectScope();
    const state = scope.run(() =>
      useNumberFieldState({
        locale: "en-US",
        defaultValue: 0,
        minValue: 0,
        maxValue: 10,
      })
    )!;

    expect(state.validate("-")).toBe(false);
    expect(state.validate("+")).toBe(false);
    scope.stop();
  });

  it("uses 0.01 default step for percent format without explicit step", () => {
    const onChange = vi.fn();
    const scope = effectScope();
    const state = scope.run(() =>
      useNumberFieldState({
        locale: "en-US",
        defaultValue: 0.1,
        formatOptions: { style: "percent" },
        onChange,
      })
    )!;

    state.increment();
    expect(onChange).toHaveBeenCalledWith(0.11);
    scope.stop();
  });

  it("queues validation updates for native behavior until commit", async () => {
    const scope = effectScope();
    const state = scope.run(() =>
      useNumberFieldState({
        locale: "en-US",
        defaultValue: 2,
        validationBehavior: "native",
      })
    )!;

    state.updateValidation({
      isInvalid: true,
      validationErrors: ["Invalid"],
      validationDetails: {
        badInput: false,
        customError: true,
        patternMismatch: false,
        rangeOverflow: false,
        rangeUnderflow: false,
        stepMismatch: false,
        tooLong: false,
        tooShort: false,
        typeMismatch: false,
        valueMissing: false,
        valid: false,
      },
    });
    expect(state.displayValidation.isInvalid).toBe(false);

    state.commitValidation();
    await nextTick();

    expect(state.displayValidation.isInvalid).toBe(true);
    scope.stop();
  });

  it("parses decimal shorthand input", () => {
    const scope = effectScope();
    const state = scope.run(() =>
      useNumberFieldState({
        locale: "en-US",
        defaultValue: 0,
        minValue: -10,
      })
    )!;

    state.commit(".5");
    expect(state.numberValue).toBe(0.5);

    state.commit("-.5");
    expect(state.numberValue).toBe(-0.5);
    scope.stop();
  });

  it("parses accounting currency negatives with parentheses", () => {
    const scope = effectScope();
    const state = scope.run(() =>
      useNumberFieldState({
        locale: "en-US",
        defaultValue: 0,
        formatOptions: {
          style: "currency",
          currency: "USD",
          currencySign: "accounting",
        },
      })
    )!;

    state.commit("($1.50)");
    expect(state.numberValue).toBe(-1.5);
    scope.stop();
  });

  it("ignores unknown currency symbols and restores formatted value", () => {
    const onChange = vi.fn();
    const scope = effectScope();
    const state = scope.run(() =>
      useNumberFieldState({
        locale: "en-US",
        defaultValue: 2,
        formatOptions: {
          style: "currency",
          currency: "USD",
        },
        onChange,
      })
    )!;

    state.commit("€10.50");
    expect(onChange).not.toHaveBeenCalled();
    expect(state.numberValue).toBe(2);
    expect(state.inputValue).toBe("$2.00");
    scope.stop();
  });
});
