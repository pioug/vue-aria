import { effectScope, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useFormValidation } from "../src/useFormValidation";

describe("useFormValidation", () => {
  it("sets custom validity in native mode", () => {
    const input = document.createElement("input");
    const inputRef = ref<HTMLInputElement | null>(input);
    const state = {
      realtimeValidation: {
        isInvalid: true,
        validationErrors: ["Bad input"],
        validationDetails: null,
      },
      updateValidation: vi.fn(),
    };

    const scope = effectScope();
    scope.run(() => {
      useFormValidation({ validationBehavior: "native" }, state as any, inputRef);
    });

    expect(input.validationMessage).toBe("Bad input");
    scope.stop();
  });

  it("commits validation on invalid event", () => {
    const input = document.createElement("input");
    const form = document.createElement("form");
    form.appendChild(input);
    document.body.appendChild(form);
    const inputRef = ref<HTMLInputElement | null>(input);
    const state = {
      displayValidation: { isInvalid: false, validationErrors: [], validationDetails: null },
      commitValidation: vi.fn(),
    };

    const scope = effectScope();
    scope.run(() => {
      useFormValidation({ validationBehavior: "native" }, state as any, inputRef);
    });

    input.dispatchEvent(new Event("invalid", { cancelable: true, bubbles: true }));
    expect(state.commitValidation).toHaveBeenCalled();

    scope.stop();
    form.remove();
  });

  it("resets validation on form reset event", () => {
    const input = document.createElement("input");
    const form = document.createElement("form");
    form.appendChild(input);
    document.body.appendChild(form);
    const inputRef = ref<HTMLInputElement | null>(input);
    const state = {
      resetValidation: vi.fn(),
      commitValidation: vi.fn(),
      displayValidation: { isInvalid: false, validationErrors: [], validationDetails: null },
    };

    const scope = effectScope();
    scope.run(() => {
      useFormValidation({ validationBehavior: "native" }, state as any, inputRef);
    });

    form.dispatchEvent(new Event("reset"));
    expect(state.resetValidation).toHaveBeenCalledTimes(1);

    scope.stop();
    form.remove();
  });

  it("ignores programmatic form reset", () => {
    const input = document.createElement("input");
    const form = document.createElement("form");
    form.appendChild(input);
    document.body.appendChild(form);
    const inputRef = ref<HTMLInputElement | null>(input);
    const state = {
      resetValidation: vi.fn(),
      commitValidation: vi.fn(),
      displayValidation: { isInvalid: false, validationErrors: [], validationDetails: null },
    };

    const scope = effectScope();
    scope.run(() => {
      useFormValidation({ validationBehavior: "native" }, state as any, inputRef);
    });

    form.reset();
    expect(state.resetValidation).not.toHaveBeenCalled();

    scope.stop();
    form.remove();
  });
});
