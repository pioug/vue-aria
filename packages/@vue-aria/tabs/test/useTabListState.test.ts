import { describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";
import { useTabListState } from "../src";

const tabs = [{ key: "item-1" }, { key: "item-2" }, { key: "item-3" }];

describe("useTabListState", () => {
  it("selects the first non-disabled tab by default", () => {
    const state = useTabListState({ collection: tabs });

    expect(state.selectedKey.value).toBe("item-1");
    expect(state.focusedKey.value).toBe("item-1");
  });

  it("supports defaultSelectedKey", () => {
    const state = useTabListState({
      collection: tabs,
      defaultSelectedKey: "item-3",
    });

    expect(state.selectedKey.value).toBe("item-3");
  });

  it("supports controlled selectedKey", () => {
    const selectedKey = ref("item-1");
    const onSelectionChange = vi.fn((key: string | number) => {
      selectedKey.value = String(key);
    });

    const state = useTabListState({
      collection: tabs,
      selectedKey,
      onSelectionChange,
    });

    expect(state.selectedKey.value).toBe("item-1");

    state.setSelectedKey("item-2");

    expect(onSelectionChange).toHaveBeenCalledWith("item-2");
    expect(state.selectedKey.value).toBe("item-2");
  });

  it("skips disabled tabs when resolving default selection", () => {
    const state = useTabListState({
      collection: tabs,
      disabledKeys: ["item-1"],
    });

    expect(state.selectedKey.value).toBe("item-2");
  });

  it("falls back to the first tab when all tabs are disabled", () => {
    const state = useTabListState({
      collection: tabs,
      disabledKeys: ["item-1", "item-2", "item-3"],
    });

    expect(state.selectedKey.value).toBe("item-1");
  });

  it("selects the first available tab when the current tab is removed", async () => {
    const collection = ref([...tabs]);
    const onSelectionChange = vi.fn();

    const state = useTabListState({
      collection,
      disabledKeys: ["item-1"],
      onSelectionChange,
    });

    expect(state.selectedKey.value).toBe("item-2");

    collection.value = [{ key: "item-1" }];
    await nextTick();

    expect(state.selectedKey.value).toBe("item-1");
    expect(onSelectionChange).toHaveBeenCalledWith("item-1");
  });
});
