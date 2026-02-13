import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";

vi.mock("@vue-aria/utils", async () => {
  const actual = await vi.importActual<typeof import("@vue-aria/utils")>("@vue-aria/utils");
  return {
    ...actual,
    isIOS: () => true,
  };
});

import { useNumberField } from "../src";

describe("useNumberField iOS behavior", () => {
  it("omits aria-roledescription on iOS", () => {
    const state = {
      increment: vi.fn(),
      incrementToMax: vi.fn(),
      decrement: vi.fn(),
      decrementToMin: vi.fn(),
      numberValue: 2,
      inputValue: "2",
      commit: vi.fn(),
      commitValidation: vi.fn(),
      validate: vi.fn(() => true),
      setInputValue: vi.fn(),
      defaultNumberValue: 2,
      setNumberValue: vi.fn(),
      canIncrement: true,
      canDecrement: true,
      minValue: 0,
      displayValidation: {
        isInvalid: false,
        validationErrors: [],
        validationDetails: null,
      },
      realtimeValidation: {
        isInvalid: false,
        validationErrors: [],
        validationDetails: null,
      },
      updateValidation: vi.fn(),
      resetValidation: vi.fn(),
    };
    const ref = { current: document.createElement("input") as HTMLInputElement | null };
    const scope = effectScope();
    const result = scope.run(() =>
      useNumberField({ "aria-label": "Quantity" }, state as any, ref)
    )!;

    expect(result.inputProps["aria-roledescription"]).toBeNull();
    scope.stop();
  });
});
