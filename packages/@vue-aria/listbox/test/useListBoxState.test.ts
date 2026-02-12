import { describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";
import { useListBoxState } from "../src";

const items = [{ key: "a" }, { key: "b" }, { key: "c" }];

describe("useListBoxState", () => {
  it("normalizes selected keys for single selection mode", () => {
    const state = useListBoxState({
      collection: items,
      selectionMode: "single",
      defaultSelectedKeys: ["a", "b"],
    });

    expect(state.selectedKeys.value.size).toBe(1);
    expect(state.selectedKeys.value.has("a")).toBe(true);
  });

  it("supports multiple selection toggling", () => {
    const state = useListBoxState({
      collection: items,
      selectionMode: "multiple",
    });

    state.selectKey("a", "toggle");
    expect(state.selectedKeys.value.has("a")).toBe(true);

    state.selectKey("a", "toggle");
    expect(state.selectedKeys.value.has("a")).toBe(false);
  });

  it("does not allow empty selection when disallowEmptySelection is true", () => {
    const state = useListBoxState({
      collection: items,
      selectionMode: "multiple",
      disallowEmptySelection: true,
      defaultSelectedKeys: ["a"],
    });

    state.selectKey("a", "toggle");
    expect(state.selectedKeys.value).toEqual(new Set(["a"]));

    state.setSelectedKeys(new Set());
    expect(state.selectedKeys.value).toEqual(new Set(["a"]));
    expect(state.disallowEmptySelection.value).toBe(true);
  });

  it("does not select disabled keys", () => {
    const state = useListBoxState({
      collection: items,
      selectionMode: "single",
      disabledKeys: ["b"],
    });

    state.selectKey("b");
    expect(state.selectedKeys.value.size).toBe(0);
  });

  it("supports controlled selected keys", () => {
    const selectedKeys = ref<Iterable<string>>(["a"]);
    const onSelectionChange = vi.fn((keys: Set<string | number>) => {
      selectedKeys.value = keys as Set<string>;
    });

    const state = useListBoxState({
      collection: items,
      selectionMode: "single",
      selectedKeys,
      onSelectionChange,
    });

    state.selectKey("c");
    expect(onSelectionChange).toHaveBeenCalled();
    expect(state.selectedKeys.value.has("c")).toBe(true);
  });

  it("removes invalid selected keys when collection changes", async () => {
    const collection = ref([...items]);
    const state = useListBoxState({
      collection,
      selectionMode: "multiple",
      defaultSelectedKeys: ["a", "c"],
    });

    expect(state.selectedKeys.value.has("c")).toBe(true);

    collection.value = [{ key: "a" }, { key: "b" }];
    await nextTick();

    expect(state.selectedKeys.value.has("c")).toBe(false);
    expect(state.selectedKeys.value.has("a")).toBe(true);
  });

  it("falls back focused key when selected key is filtered out of collection", async () => {
    const collection = ref([{ key: "a" }, { key: "b" }]);
    const selectedKeys = ref<Iterable<string>>(["b"]);
    const state = useListBoxState({
      collection,
      selectionMode: "single",
      selectedKeys,
    });

    expect(state.focusedKey.value).toBe("b");

    collection.value = [{ key: "a" }];
    await nextTick();

    expect(state.focusedKey.value).toBe("a");
  });
});
