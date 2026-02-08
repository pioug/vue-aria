import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useMultipleSelectionState } from "../src";

describe("useMultipleSelectionState", () => {
  it("supports uncontrolled selection updates", () => {
    const state = useMultipleSelectionState({
      selectionMode: "multiple",
      defaultSelectedKeys: ["one"],
    });

    expect(state.selectedKeys.value).toEqual(new Set(["one"]));

    state.setSelectedKeys(["one", "two"]);
    expect(state.selectedKeys.value).toEqual(new Set(["one", "two"]));
  });

  it("supports controlled selection updates", () => {
    const selectedKeys = ref<Iterable<string | number> | undefined>(["one"]);
    const onSelectionChange = vi.fn((keys: Set<string | number>) => {
      selectedKeys.value = keys;
    });

    const state = useMultipleSelectionState({
      selectionMode: "multiple",
      selectedKeys,
      onSelectionChange,
    });

    state.setSelectedKeys(["one", "two"]);

    expect(onSelectionChange).toHaveBeenCalledWith(new Set(["one", "two"]));
    expect(state.selectedKeys.value).toEqual(new Set(["one", "two"]));
  });

  it("normalizes selected keys in single selection mode", () => {
    const state = useMultipleSelectionState({
      selectionMode: "single",
    });

    state.setSelectedKeys(["one", "two"]);

    expect(state.selectedKeys.value.size).toBe(1);
    expect(state.selectedKeys.value.has("one")).toBe(true);
  });

  it("suppresses duplicate selection events unless explicitly allowed", () => {
    const onSelectionChange = vi.fn();
    const state = useMultipleSelectionState({
      selectionMode: "multiple",
      defaultSelectedKeys: ["one"],
      onSelectionChange,
    });

    state.setSelectedKeys(["one"]);
    expect(onSelectionChange).not.toHaveBeenCalled();

    const duplicateState = useMultipleSelectionState({
      selectionMode: "multiple",
      defaultSelectedKeys: ["one"],
      allowDuplicateSelectionEvents: true,
      onSelectionChange,
    });

    duplicateState.setSelectedKeys(["one"]);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
  });

  it("tracks focus and child focus strategy", () => {
    const state = useMultipleSelectionState({
      selectionMode: "multiple",
      disabledKeys: ["two"],
      disabledBehavior: "selection",
    });

    state.setFocused(true);
    state.setFocusedKey("one", "last");

    expect(state.isFocused.value).toBe(true);
    expect(state.focusedKey.value).toBe("one");
    expect(state.childFocusStrategy.value).toBe("last");
    expect(state.disabledKeys.value.has("two")).toBe(true);
    expect(state.disabledBehavior.value).toBe("selection");
  });
});
