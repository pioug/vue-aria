import { effectScope, nextTick, ref } from "vue";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_VALIDATION_RESULT,
  mergeValidation,
  useFormValidationState,
  type ValidationResult,
} from "../src";

const INVALID_RESULT: ValidationResult = {
  isInvalid: true,
  validationErrors: ["Invalid value"],
  validationDetails: {
    ...DEFAULT_VALIDATION_RESULT.validationDetails!,
    customError: true,
    valid: false,
  },
};

describe("useFormValidationState", () => {
  it("updates display validation in realtime for aria behavior", () => {
    const scope = effectScope();
    const state = scope.run(() =>
      useFormValidationState<number>({
        validationBehavior: "aria",
        value: ref(5),
      })
    )!;

    state.updateValidation(INVALID_RESULT);
    expect(state.realtimeValidation.isInvalid).toBe(false);
    expect(state.displayValidation.isInvalid).toBe(true);
    scope.stop();
  });

  it("queues validation for native behavior until commit", async () => {
    const scope = effectScope();
    const state = scope.run(() =>
      useFormValidationState<number>({
        validationBehavior: "native",
        value: ref(5),
      })
    )!;

    state.updateValidation(INVALID_RESULT);
    expect(state.displayValidation.isInvalid).toBe(false);

    state.commitValidation();
    await nextTick();

    expect(state.displayValidation.isInvalid).toBe(true);
    scope.stop();
  });

  it("prioritizes controlled invalid state", () => {
    const scope = effectScope();
    const state = scope.run(() =>
      useFormValidationState<number>({
        value: ref(5),
        isInvalid: true,
      })
    )!;

    expect(state.realtimeValidation.isInvalid).toBe(true);
    expect(state.displayValidation.isInvalid).toBe(true);
    expect(state.displayValidation.validationErrors).toEqual([]);
    scope.stop();
  });

  it("merges validation results with deduped errors and combined details", () => {
    const merged = mergeValidation(
      {
        isInvalid: true,
        validationErrors: ["Required", "Too small"],
        validationDetails: {
          ...DEFAULT_VALIDATION_RESULT.validationDetails!,
          valueMissing: true,
          valid: false,
        },
      },
      {
        isInvalid: true,
        validationErrors: ["Too small", "Out of range"],
        validationDetails: {
          ...DEFAULT_VALIDATION_RESULT.validationDetails!,
          rangeOverflow: true,
          valid: false,
        },
      }
    );

    expect(merged.isInvalid).toBe(true);
    expect(merged.validationErrors).toEqual(["Required", "Too small", "Out of range"]);
    expect(merged.validationDetails!.valueMissing).toBe(true);
    expect(merged.validationDetails!.rangeOverflow).toBe(true);
    expect(merged.validationDetails!.valid).toBe(false);
  });
});
