import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useCheckbox } from "../src";

function createState(overrides: Record<string, unknown> = {}) {
  return {
    isSelected: false,
    defaultSelected: false,
    setSelected: vi.fn(),
    toggle: vi.fn(),
    ...overrides,
  } as any;
}

describe("useCheckbox", () => {
  it("returns checkbox props", () => {
    const state = createState();
    const ref = { current: document.createElement("input") };
    const scope = effectScope();
    const result = scope.run(() => useCheckbox({ "aria-label": "Checkbox" }, state, ref))!;

    expect(result.inputProps.type).toBe("checkbox");
    expect(result.inputProps.checked).toBe(false);
    expect(result.isDisabled).toBe(false);
    expect(result.isInvalid).toBe(false);
    scope.stop();
  });

  it("sets native required for validationBehavior=native", () => {
    const state = createState();
    const ref = { current: document.createElement("input") };
    const scope = effectScope();
    const result = scope.run(() =>
      useCheckbox(
        { "aria-label": "Checkbox", isRequired: true, validationBehavior: "native" },
        state,
        ref
      )
    )!;

    expect(result.inputProps.required).toBe(true);
    expect(result.inputProps["aria-required"]).toBeUndefined();
    scope.stop();
  });

  it("sets indeterminate on input ref", () => {
    const state = createState();
    const ref = { current: document.createElement("input") };
    const scope = effectScope();
    scope.run(() => useCheckbox({ "aria-label": "Checkbox", isIndeterminate: true }, state, ref));

    expect(ref.current?.indeterminate).toBe(true);
    scope.stop();
  });

  it("prevents default on label mousedown", () => {
    const state = createState();
    const ref = { current: document.createElement("input") };
    const scope = effectScope();
    const result = scope.run(() => useCheckbox({ "aria-label": "Checkbox" }, state, ref))!;
    const preventDefault = vi.fn();

    (result.labelProps.onMousedown as (event: MouseEvent) => void)({
      preventDefault,
    } as unknown as MouseEvent);

    expect(preventDefault).toHaveBeenCalledTimes(1);
    scope.stop();
  });
});
