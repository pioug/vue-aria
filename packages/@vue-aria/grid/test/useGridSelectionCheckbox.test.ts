import { describe, expect, it, vi } from "vitest";
import { useGridSelectionCheckbox } from "../src/useGridSelectionCheckbox";

describe("useGridSelectionCheckbox", () => {
  it("returns checkbox props and toggles row selection", () => {
    const toggleSelection = vi.fn();
    const state = {
      selectionManager: {
        canSelectItem: vi.fn(() => true),
        isSelected: vi.fn(() => true),
        toggleSelection,
      },
    };

    const { checkboxProps } = useGridSelectionCheckbox(
      { key: "row-1" },
      state as any
    );

    expect(checkboxProps.id).toBeTruthy();
    expect(checkboxProps["aria-label"]).toBe("Select");
    expect(checkboxProps.isSelected).toBe(true);
    expect(checkboxProps.isDisabled).toBe(false);
    (checkboxProps.onChange as () => void)();
    expect(toggleSelection).toHaveBeenCalledWith("row-1");
  });

  it("marks checkbox disabled when selection manager rejects item", () => {
    const state = {
      selectionManager: {
        canSelectItem: vi.fn(() => false),
        isSelected: vi.fn(() => false),
        toggleSelection: vi.fn(),
      },
    };

    const { checkboxProps } = useGridSelectionCheckbox(
      { key: "row-2" },
      state as any
    );

    expect(checkboxProps.isDisabled).toBe(true);
    expect(checkboxProps.isSelected).toBe(false);
  });
});
