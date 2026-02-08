import { describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";
import { useTreeState, type TreeInputNode } from "../src";

const treeData: TreeInputNode[] = [
  {
    key: "animals",
    textValue: "Animals",
    children: [
      { key: "aardvark", textValue: "Aardvark" },
      {
        key: "bear",
        textValue: "Bear",
        children: [{ key: "black-bear", textValue: "Black Bear" }],
      },
    ],
  },
  {
    key: "fruits",
    textValue: "Fruits",
    children: [{ key: "apple", textValue: "Apple" }],
  },
];

describe("useTreeState", () => {
  it("builds visible collection from expanded keys", () => {
    const state = useTreeState({
      collection: treeData,
    });

    expect(state.collection.value.visibleNodes.map((node) => node.key)).toEqual([
      "animals",
      "fruits",
    ]);

    state.toggleKey("animals");
    expect(state.collection.value.visibleNodes.map((node) => node.key)).toEqual([
      "animals",
      "aardvark",
      "bear",
      "fruits",
    ]);
    expect(state.collection.value.getKeyAfter("bear")).toBe("fruits");

    state.toggleKey("bear");
    expect(state.collection.value.visibleNodes.map((node) => node.key)).toEqual([
      "animals",
      "aardvark",
      "bear",
      "black-bear",
      "fruits",
    ]);
  });

  it("supports controlled expanded keys", () => {
    const expandedKeys = ref(new Set(["animals"]));
    const onExpandedChange = vi.fn((nextKeys: Set<string | number>) => {
      expandedKeys.value = new Set(Array.from(nextKeys) as string[]);
    });

    const state = useTreeState({
      collection: treeData,
      expandedKeys,
      onExpandedChange,
    });

    state.toggleKey("animals");

    expect(onExpandedChange).toHaveBeenCalledTimes(1);
    expect(state.expandedKeys.value.has("animals")).toBe(false);
  });

  it("provides selection manager behavior with disabled keys", () => {
    const state = useTreeState({
      collection: treeData,
      selectionMode: "multiple",
      defaultExpandedKeys: ["animals"],
      disabledKeys: ["bear"],
    });

    state.selectionManager.select("animals");
    state.selectionManager.select("bear");

    expect(state.selectionManager.selectedKeys.value.has("animals")).toBe(true);
    expect(state.selectionManager.selectedKeys.value.has("bear")).toBe(false);

    state.selectionManager.select("animals", "toggle");
    expect(state.selectionManager.selectedKeys.value.size).toBe(0);
  });

  it("resets focused key when collapse hides the focused node", async () => {
    const state = useTreeState({
      collection: treeData,
      defaultExpandedKeys: ["animals", "bear"],
    });

    state.selectionManager.setFocusedKey("black-bear");
    expect(state.selectionManager.focusedKey.value).toBe("black-bear");

    state.toggleKey("bear");
    await nextTick();

    expect(state.selectionManager.focusedKey.value).toBeNull();
  });

  it("prunes selected keys when nodes are removed from the tree", async () => {
    const collection = ref<TreeInputNode[]>(treeData);
    const state = useTreeState({
      collection,
      selectionMode: "multiple",
      defaultSelectedKeys: ["aardvark"],
      defaultExpandedKeys: ["animals"],
    });

    expect(state.selectionManager.selectedKeys.value.has("aardvark")).toBe(true);

    collection.value = [
      {
        key: "animals",
        children: [{ key: "bear", textValue: "Bear" }],
      },
    ];
    await nextTick();

    expect(state.selectionManager.selectedKeys.value.has("aardvark")).toBe(false);
  });

  it("throws when duplicate keys exist", () => {
    const state = useTreeState({
      collection: [{ key: "a" }, { key: "a" }],
    });

    expect(() => state.collection.value.getFirstKey()).toThrow("Duplicate tree key: a");
  });
});
