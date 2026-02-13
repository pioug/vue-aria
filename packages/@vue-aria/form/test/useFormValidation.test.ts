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

  it("joins multiple validation errors for native custom validity message", () => {
    const input = document.createElement("input");
    const inputRef = ref<HTMLInputElement | null>(input);
    const state = {
      realtimeValidation: {
        isInvalid: true,
        validationErrors: ["Bad input", "Too short"],
        validationDetails: null,
      },
      updateValidation: vi.fn(),
    };

    const scope = effectScope();
    scope.run(() => {
      useFormValidation({ validationBehavior: "native" }, state as any, inputRef);
    });

    expect(input.validationMessage).toBe("Bad input Too short");
    scope.stop();
  });

  it("sets fallback custom validity message when invalid with no validation errors", () => {
    const input = document.createElement("input");
    const inputRef = ref<HTMLInputElement | null>(input);
    const state = {
      realtimeValidation: {
        isInvalid: true,
        validationErrors: [],
        validationDetails: null,
      },
      updateValidation: vi.fn(),
    };

    const scope = effectScope();
    scope.run(() => {
      useFormValidation({ validationBehavior: "native" }, state as any, inputRef);
    });

    expect(input.validationMessage).toBe("Invalid value.");
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

  it("commits validation on change event", () => {
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

    input.dispatchEvent(new Event("change", { bubbles: true }));
    expect(state.commitValidation).toHaveBeenCalledTimes(1);

    scope.stop();
    form.remove();
  });

  it("does not commit again on invalid when display validation is already invalid", () => {
    const input = document.createElement("input");
    const form = document.createElement("form");
    form.appendChild(input);
    document.body.appendChild(form);
    const inputRef = ref<HTMLInputElement | null>(input);
    const state = {
      displayValidation: { isInvalid: true, validationErrors: ["Invalid"], validationDetails: null },
      commitValidation: vi.fn(),
    };

    const scope = effectScope();
    scope.run(() => {
      useFormValidation({ validationBehavior: "native" }, state as any, inputRef);
    });

    input.dispatchEvent(new Event("invalid", { cancelable: true, bubbles: true }));
    expect(state.commitValidation).not.toHaveBeenCalled();

    scope.stop();
    form.remove();
  });

  it("updates native validity snapshot when realtime validation is valid", () => {
    const input = document.createElement("input");
    input.required = true;
    const inputRef = ref<HTMLInputElement | null>(input);
    const state = {
      realtimeValidation: {
        isInvalid: false,
        validationErrors: [],
        validationDetails: null,
      },
      updateValidation: vi.fn(),
    };

    const scope = effectScope();
    scope.run(() => {
      useFormValidation({ validationBehavior: "native" }, state as any, inputRef);
    });

    expect(state.updateValidation).toHaveBeenCalled();
    const [result] = state.updateValidation.mock.calls[0];
    expect(result.isInvalid).toBe(true);
    expect(result.validationDetails?.valueMissing).toBe(true);
    scope.stop();
  });

  it("does not sync native validity in aria validation behavior", () => {
    const input = document.createElement("input");
    input.required = true;
    const inputRef = ref<HTMLInputElement | null>(input);
    const state = {
      realtimeValidation: {
        isInvalid: false,
        validationErrors: [],
        validationDetails: null,
      },
      updateValidation: vi.fn(),
    };

    const scope = effectScope();
    scope.run(() => {
      useFormValidation({ validationBehavior: "aria" }, state as any, inputRef);
    });

    expect(state.updateValidation).not.toHaveBeenCalled();
    scope.stop();
  });

  it("does not sync native validity when input is disabled", () => {
    const input = document.createElement("input");
    input.disabled = true;
    const inputRef = ref<HTMLInputElement | null>(input);
    const state = {
      realtimeValidation: {
        isInvalid: false,
        validationErrors: [],
        validationDetails: null,
      },
      updateValidation: vi.fn(),
    };

    const scope = effectScope();
    scope.run(() => {
      useFormValidation({ validationBehavior: "native" }, state as any, inputRef);
    });

    expect(state.updateValidation).not.toHaveBeenCalled();
    scope.stop();
  });

  it("preserves existing title when syncing native validity", () => {
    const input = document.createElement("input");
    input.title = "Custom title";
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

    expect(input.title).toBe("Custom title");
    scope.stop();
  });

  it("focuses only the first invalid input in a form", () => {
    const form = document.createElement("form");
    const first = document.createElement("input");
    first.required = true;
    const second = document.createElement("input");
    second.required = true;
    form.appendChild(first);
    form.appendChild(second);
    document.body.appendChild(form);
    const firstRef = ref<HTMLInputElement | null>(first);
    const secondRef = ref<HTMLInputElement | null>(second);

    const firstState = {
      displayValidation: { isInvalid: false, validationErrors: [], validationDetails: null },
      commitValidation: vi.fn(),
    };
    const secondState = {
      displayValidation: { isInvalid: false, validationErrors: [], validationDetails: null },
      commitValidation: vi.fn(),
    };

    const firstFocusSpy = vi.spyOn(first, "focus");
    const secondFocusSpy = vi.spyOn(second, "focus");
    const scope = effectScope();
    scope.run(() => {
      useFormValidation({ validationBehavior: "native" }, firstState as any, firstRef);
      useFormValidation({ validationBehavior: "native" }, secondState as any, secondRef);
    });

    second.dispatchEvent(new Event("invalid", { bubbles: true, cancelable: true }));
    expect(secondFocusSpy).not.toHaveBeenCalled();

    first.dispatchEvent(new Event("invalid", { bubbles: true, cancelable: true }));
    expect(firstFocusSpy).toHaveBeenCalled();

    scope.stop();
    form.remove();
  });

  it("uses provided focus callback for first invalid input", () => {
    const input = document.createElement("input");
    input.required = true;
    const form = document.createElement("form");
    form.appendChild(input);
    document.body.appendChild(form);
    const inputRef = ref<HTMLInputElement | null>(input);
    const focus = vi.fn();
    const state = {
      displayValidation: { isInvalid: false, validationErrors: [], validationDetails: null },
      commitValidation: vi.fn(),
    };

    const scope = effectScope();
    scope.run(() => {
      useFormValidation({ validationBehavior: "native", focus }, state as any, inputRef);
    });

    input.dispatchEvent(new Event("invalid", { bubbles: true, cancelable: true }));
    expect(focus).toHaveBeenCalledTimes(1);

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

  it("restores the original form.reset implementation on cleanup", () => {
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

    const originalReset = form.reset;
    const scope = effectScope();
    scope.run(() => {
      useFormValidation({ validationBehavior: "native" }, state as any, inputRef);
    });
    expect(form.reset).not.toBe(originalReset);

    scope.stop();
    expect(form.reset).toBe(originalReset);
    form.remove();
  });
});
