import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useToggle, type ToggleState } from "../src";

function createState(overrides: Partial<ToggleState> = {}): ToggleState {
  return {
    isSelected: false,
    defaultSelected: false,
    setSelected: vi.fn(),
    toggle: vi.fn(),
    ...overrides,
  };
}

describe("useToggle", () => {
  it("returns label/input props", () => {
    const state = createState();
    const ref = { current: document.createElement("input") };

    const scope = effectScope();
    const result = scope.run(() => useToggle({ "aria-label": "Toggle" }, state, ref))!;

    expect(result.labelProps).toBeDefined();
    expect(result.inputProps.type).toBe("checkbox");
    expect(result.isDisabled).toBe(false);

    scope.stop();
  });

  it("warns when missing children and aria label", () => {
    const state = createState();
    const ref = { current: document.createElement("input") };
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const scope = effectScope();
    scope.run(() => useToggle({}, state, ref));

    expect(warn).toHaveBeenCalledWith(
      "If you do not provide children, you must specify an aria-label for accessibility"
    );

    warn.mockRestore();
    scope.stop();
  });

  it("sets selected state from change event", () => {
    const state = createState();
    const ref = { current: document.createElement("input") };

    const scope = effectScope();
    const result = scope.run(() => useToggle({ "aria-label": "Toggle" }, state, ref))!;

    const onChange = result.inputProps.onChange as (event: Event) => void;
    const event = new Event("change", { bubbles: true });
    Object.defineProperty(event, "target", { value: { checked: true } });

    onChange(event);

    expect(state.setSelected).toHaveBeenCalledWith(true);

    scope.stop();
  });
});
