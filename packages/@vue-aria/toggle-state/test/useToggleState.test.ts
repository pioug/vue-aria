import { describe, expect, it, vi } from "vitest";
import { useToggleState } from "../src/useToggleState";

describe("useToggleState", () => {
  it("toggles uncontrolled state", () => {
    const state = useToggleState({ defaultSelected: false });
    expect(state.isSelected).toBe(false);

    state.toggle();
    expect(state.isSelected).toBe(true);
  });

  it("respects read only", () => {
    const onChange = vi.fn();
    const state = useToggleState({ defaultSelected: true, isReadOnly: true, onChange });

    state.toggle();

    expect(state.isSelected).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
  });
});
