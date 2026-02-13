import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";

vi.mock("@vue-aria/utils", async () => {
  const actual = await vi.importActual<typeof import("@vue-aria/utils")>("@vue-aria/utils");
  return {
    ...actual,
    isIPhone: () => false,
    isAndroid: () => false,
    isIOS: () => false,
  };
});

import { useNumberField } from "../src";

function createState(minValue?: number) {
  return {
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
    minValue,
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
}

describe("useNumberField default-platform inputMode behavior", () => {
  it("uses numeric inputMode when negative values are possible", () => {
    const state = createState(undefined);
    const ref = { current: document.createElement("input") as HTMLInputElement | null };
    const scope = effectScope();
    const result = scope.run(() =>
      useNumberField({ "aria-label": "Quantity" }, state as any, ref)
    )!;

    expect(result.inputProps.inputMode).toBe("numeric");
    scope.stop();
  });

  it("keeps numeric inputMode when negatives are disallowed but decimals are allowed", () => {
    const state = createState(0);
    const ref = { current: document.createElement("input") as HTMLInputElement | null };
    const scope = effectScope();
    const result = scope.run(() =>
      useNumberField({ "aria-label": "Quantity", minValue: 0 }, state as any, ref)
    )!;

    expect(result.inputProps.inputMode).toBe("numeric");
    scope.stop();
  });

  it("keeps numeric inputMode when negatives are disallowed and maxFractionDigits is 0", () => {
    const state = createState(0);
    const ref = { current: document.createElement("input") as HTMLInputElement | null };
    const scope = effectScope();
    const result = scope.run(() =>
      useNumberField(
        {
          "aria-label": "Quantity",
          minValue: 0,
          formatOptions: { maximumFractionDigits: 0 },
        },
        state as any,
        ref
      )
    )!;

    expect(result.inputProps.inputMode).toBe("numeric");
    scope.stop();
  });
});
