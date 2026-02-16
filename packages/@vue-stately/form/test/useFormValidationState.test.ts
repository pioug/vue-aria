import { defineComponent, effectScope, nextTick, ref } from "vue";
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import {
  DEFAULT_VALIDATION_RESULT,
  FormValidationContext,
  mergeValidation,
  privateValidationStateProp,
  useFormValidationState,
  type FormValidationState,
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

  it("supports validationState compatibility for invalid state", () => {
    const scope = effectScope();
    const state = scope.run(() =>
      useFormValidationState<number>({
        value: ref(5),
        validationState: "invalid",
      })
    )!;

    expect(state.realtimeValidation.isInvalid).toBe(true);
    expect(state.displayValidation.isInvalid).toBe(true);
    expect(state.displayValidation.validationErrors).toEqual([]);
    scope.stop();
  });

  it("returns injected private validation state when provided", () => {
    const passthrough: FormValidationState = {
      realtimeValidation: DEFAULT_VALIDATION_RESULT,
      displayValidation: DEFAULT_VALIDATION_RESULT,
      updateValidation: () => {},
      resetValidation: () => {},
      commitValidation: () => {},
    };
    const state = useFormValidationState<number>({
      value: ref(5),
      [privateValidationStateProp]: passthrough,
    });

    expect(state).toBe(passthrough);
  });

  it("cancels queued native commit when resetValidation is called before flush", async () => {
    const scope = effectScope();
    const state = scope.run(() =>
      useFormValidationState<number>({
        validationBehavior: "native",
        value: ref(5),
      })
    )!;

    state.updateValidation(INVALID_RESULT);
    state.commitValidation();
    state.resetValidation();
    await nextTick();

    expect(state.displayValidation.isInvalid).toBe(false);
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

  it("surfaces injected server errors and refreshes when server payload changes", async () => {
    const value = ref("abc");
    const serverErrors = ref<Record<string, string | string[]>>({ field: "Server invalid" });
    const state = ref<FormValidationState | null>(null);

    const TestHarness = defineComponent({
      setup() {
        state.value = useFormValidationState<string>({
          name: "field",
          value,
          validationBehavior: "aria",
        });
        return () => null;
      },
    });

    const wrapper = mount(TestHarness, {
      global: {
        provide: {
          [FormValidationContext as symbol]: serverErrors,
        },
      },
    });
    await nextTick();

    expect(state.value?.displayValidation.isInvalid).toBe(true);
    expect(state.value?.displayValidation.validationErrors).toEqual(["Server invalid"]);

    state.value?.commitValidation();
    await nextTick();
    expect(state.value?.displayValidation.isInvalid).toBe(false);

    serverErrors.value = { field: ["Server invalid", "Server still invalid"] };
    await nextTick();
    expect(state.value?.displayValidation.isInvalid).toBe(true);
    expect(state.value?.displayValidation.validationErrors).toEqual(["Server invalid", "Server still invalid"]);

    wrapper.unmount();
  });

  it("aggregates server errors from multiple field names", async () => {
    const value = ref("abc");
    const serverErrors = ref<Record<string, string | string[]>>({
      first: "First invalid",
      second: ["Second invalid", "Second still invalid"],
    });
    const state = ref<FormValidationState | null>(null);

    const TestHarness = defineComponent({
      setup() {
        state.value = useFormValidationState<string>({
          name: ["first", "second"],
          value,
          validationBehavior: "aria",
        });
        return () => null;
      },
    });

    const wrapper = mount(TestHarness, {
      global: {
        provide: {
          [FormValidationContext as symbol]: serverErrors,
        },
      },
    });
    await nextTick();

    expect(state.value?.displayValidation.isInvalid).toBe(true);
    expect(state.value?.displayValidation.validationErrors).toEqual([
      "First invalid",
      "Second invalid",
      "Second still invalid",
    ]);

    wrapper.unmount();
  });
});
