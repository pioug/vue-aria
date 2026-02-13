import { describe, expect, it, vi } from "vitest";
import { useMultipleSelectionState } from "../src/useMultipleSelectionState";
import { Selection } from "../src/Selection";

describe("useMultipleSelectionState", () => {
  it("sets and reads focus state", () => {
    const state = useMultipleSelectionState({ selectionMode: "multiple" });

    state.setFocused(true);
    state.setFocusedKey("a", "last");

    expect(state.isFocused).toBe(true);
    expect(state.focusedKey).toBe("a");
    expect(state.childFocusStrategy).toBe("last");
  });

  it("deduplicates selection change events by default", () => {
    const onSelectionChange = vi.fn();
    const state = useMultipleSelectionState({
      selectionMode: "multiple",
      onSelectionChange,
      defaultSelectedKeys: new Selection(["a"]),
    });

    state.setSelectedKeys(new Selection(["a"]));
    expect(onSelectionChange).not.toHaveBeenCalled();

    state.setSelectedKeys(new Selection(["b"]));
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
  });

  it("allows duplicate selection change events when configured", () => {
    const onSelectionChange = vi.fn();
    const state = useMultipleSelectionState({
      selectionMode: "multiple",
      onSelectionChange,
      allowDuplicateSelectionEvents: true,
      defaultSelectedKeys: new Selection(["a"]),
    });

    state.setSelectedKeys(new Selection(["a"]));
    state.setSelectedKeys(new Selection(["a"]));

    expect(onSelectionChange).toHaveBeenCalledTimes(2);
  });

  it("normalizes controlled and default selection inputs", () => {
    const stateWithControlledSelection = useMultipleSelectionState({
      selectionMode: "multiple",
      selectedKeys: new Set(["a", "b"]),
    });
    const stateWithAllSelection = useMultipleSelectionState({
      selectionMode: "multiple",
      selectedKeys: "all",
    });
    const stateWithDefaults = useMultipleSelectionState({
      selectionMode: "multiple",
    });

    expect(stateWithControlledSelection.selectedKeys).toBeInstanceOf(Selection);
    expect(stateWithControlledSelection.selectedKeys).toEqual(new Selection(["a", "b"]));
    expect(stateWithAllSelection.selectedKeys).toBe("all");
    expect(stateWithDefaults.selectedKeys).toBeInstanceOf(Selection);
    if (stateWithDefaults.selectedKeys === "all") {
      throw new Error("Expected default selection to be empty set");
    }
    expect(stateWithDefaults.selectedKeys.size).toBe(0);
  });

  it("exposes disabled keys as a set", () => {
    const state = useMultipleSelectionState({
      selectionMode: "multiple",
      disabledKeys: ["a", "c"],
    });

    expect(state.disabledKeys).toEqual(new Set(["a", "c"]));
  });
});
