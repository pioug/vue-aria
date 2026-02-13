import { effectScope, ref } from "vue";
import { describe, expect, it, vi } from "vitest";

vi.mock("@vue-aria/interactions", async () => {
  const actual = await vi.importActual<typeof import("@vue-aria/interactions")>(
    "@vue-aria/interactions"
  );
  return {
    ...actual,
    setInteractionModality: vi.fn(),
  };
});

import { setInteractionModality } from "@vue-aria/interactions";
import { useFormValidation } from "../src/useFormValidation";

describe("useFormValidation modality behavior", () => {
  it("sets keyboard modality when focusing the first invalid input", () => {
    const input = document.createElement("input");
    input.required = true;
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

    input.dispatchEvent(new Event("invalid", { bubbles: true, cancelable: true }));
    expect(setInteractionModality).toHaveBeenCalledWith("keyboard");

    scope.stop();
    form.remove();
  });

  it("does not set modality when invalid event is not for the first invalid input", () => {
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

    const scope = effectScope();
    scope.run(() => {
      useFormValidation({ validationBehavior: "native" }, firstState as any, firstRef);
      useFormValidation({ validationBehavior: "native" }, secondState as any, secondRef);
    });

    (setInteractionModality as any).mockClear();
    second.dispatchEvent(new Event("invalid", { bubbles: true, cancelable: true }));
    expect(setInteractionModality).not.toHaveBeenCalled();

    scope.stop();
    form.remove();
  });
});
