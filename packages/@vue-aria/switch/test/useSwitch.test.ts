import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useSwitch } from "../src";

function createState(overrides: Record<string, unknown> = {}) {
  return {
    isSelected: false,
    defaultSelected: false,
    setSelected: vi.fn(),
    toggle: vi.fn(),
    ...overrides,
  } as any;
}

describe("useSwitch", () => {
  it("adds switch role and mirrors checked state", () => {
    const state = createState({ isSelected: true });
    const ref = { current: document.createElement("input") };
    const scope = effectScope();
    const result = scope.run(() => useSwitch({ "aria-label": "Wifi" }, state, ref))!;

    expect(result.inputProps.role).toBe("switch");
    expect(result.inputProps.checked).toBe(true);
    expect(result.isSelected).toBe(true);
    scope.stop();
  });

  it("preserves disabled and readonly behavior from useToggle", () => {
    const state = createState();
    const ref = { current: document.createElement("input") };
    const scope = effectScope();
    const result = scope.run(() =>
      useSwitch({ "aria-label": "Wifi", isDisabled: true, isReadOnly: true }, state, ref)
    )!;

    expect(result.isDisabled).toBe(true);
    expect(result.isReadOnly).toBe(true);
    expect(result.inputProps.disabled).toBe(true);
    expect(result.inputProps["aria-readonly"]).toBe(true);
    scope.stop();
  });
});
