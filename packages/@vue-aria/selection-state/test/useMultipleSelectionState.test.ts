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
});
