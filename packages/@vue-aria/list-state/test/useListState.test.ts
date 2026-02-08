import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useListState, useSingleSelectListState } from "../src";

const items = [
  { key: "one", textValue: "One" },
  { key: "two", textValue: "Two" },
  { key: "three", textValue: "Three" },
];

describe("useListState", () => {
  it("supports filtering and multiple selection operations", () => {
    const state = useListState({
      collection: items,
      selectionMode: "multiple",
      filter: (collection) =>
        Array.from(collection).filter((item) => item.key !== "one"),
    });

    expect(state.collection.value.map((item) => item.key)).toEqual(["two", "three"]);

    state.selectionManager.select("two", "toggle");
    expect(state.selectionManager.selectedKeys.value.has("two")).toBe(true);

    state.selectionManager.select("three", "toggle");
    expect(state.selectionManager.selectedKeys.value.has("three")).toBe(true);

    state.selectionManager.select("two", "toggle");
    expect(state.selectionManager.selectedKeys.value.has("two")).toBe(false);
  });

  it("exposes disabled keys", () => {
    const state = useListState({
      collection: items,
      disabledKeys: ["two"],
    });

    expect(state.disabledKeys.value.has("two")).toBe(true);
    expect(state.selectionManager.isDisabled("two")).toBe(true);
  });
});

describe("useSingleSelectListState", () => {
  it("tracks selected key and selected item", () => {
    const state = useSingleSelectListState({
      collection: items,
      defaultSelectedKey: "two",
    });

    expect(state.selectedKey.value).toBe("two");
    expect(state.selectedItem.value?.key).toBe("two");

    state.setSelectedKey("three");

    expect(state.selectedKey.value).toBe("three");
    expect(state.selectedItem.value?.key).toBe("three");
  });

  it("supports controlled selected key with selection manager updates", () => {
    const selectedKey = ref<string | number | null>("one");
    const onSelectionChange = vi.fn((key: string | number | null) => {
      selectedKey.value = key;
    });

    const state = useSingleSelectListState({
      collection: items,
      selectedKey,
      onSelectionChange,
    });

    state.selectionManager.select("two", "replace");
    expect(onSelectionChange).toHaveBeenCalledWith("two");
    expect(state.selectedKey.value).toBe("two");

    state.selectionManager.select("two", "replace");
    expect(onSelectionChange).toHaveBeenCalledTimes(2);
  });
});
