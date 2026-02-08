import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import { useTreeState, type TreeInputNode } from "@vue-aria/tree-state";
import { useTree, useTreeItem } from "../src";

const treeData: TreeInputNode[] = [
  {
    key: "animals",
    textValue: "Animals",
    children: [
      { key: "aardvark", textValue: "Aardvark" },
      { key: "bear", textValue: "Bear" },
    ],
  },
];

afterEach(() => {
  document.body.innerHTML = "";
});

describe("useTreeItem", () => {
  it("returns row and gridcell semantics", () => {
    const scope = effectScope();

    scope.run(() => {
      const state = useTreeState({
        collection: treeData,
        selectionMode: "single",
        defaultExpandedKeys: ["animals"],
      });
      useTree(
        {
          "aria-label": "Items",
        },
        state,
        ref(null)
      );

      const node = state.collection.value.getItem("animals");
      if (!node) {
        throw new Error("Expected animals node");
      }

      const rowElement = document.createElement("div");
      const item = useTreeItem(
        {
          node,
        },
        state,
        ref(rowElement)
      );

      expect(item.rowProps.value.role).toBe("row");
      expect(item.rowProps.value.id).toBeTypeOf("string");
      expect(item.rowProps.value["aria-expanded"]).toBe(true);
      expect(item.rowProps.value["aria-level"]).toBe(1);
      expect(item.gridCellProps.value.role).toBe("gridcell");
      expect(item.descriptionProps.value.id).toBeTypeOf("string");
    });

    scope.stop();
  });

  it("toggles expand state with expandButtonProps", () => {
    const scope = effectScope();

    scope.run(() => {
      const state = useTreeState({
        collection: treeData,
      });
      useTree(
        {
          "aria-label": "Items",
        },
        state,
        ref(null)
      );

      const node = state.collection.value.getNode("animals");
      if (!node) {
        throw new Error("Expected animals node");
      }

      const item = useTreeItem(
        {
          node,
        },
        state,
        ref(document.createElement("div"))
      );

      expect(item.expandButtonProps.value["aria-label"]).toBe("Expand");
      (item.expandButtonProps.value.onPress as () => void)();
      expect(state.expandedKeys.value.has("animals")).toBe(true);
      expect(item.expandButtonProps.value["aria-label"]).toBe("Collapse");
      expect(state.selectionManager.focusedKey.value).toBe("animals");
    });

    scope.stop();
  });

  it("selects and triggers action on row click", () => {
    const scope = effectScope();

    scope.run(() => {
      const onTreeAction = vi.fn();
      const onItemAction = vi.fn();
      const state = useTreeState({
        collection: treeData,
        selectionMode: "multiple",
      });
      useTree(
        {
          "aria-label": "Items",
          onAction: onTreeAction,
        },
        state,
        ref(null)
      );

      const node = state.collection.value.getNode("animals");
      if (!node) {
        throw new Error("Expected animals node");
      }

      const item = useTreeItem(
        {
          node,
          onAction: onItemAction,
        },
        state,
        ref(document.createElement("div"))
      );

      (item.rowProps.value.onClick as () => void)();

      expect(state.selectionManager.selectedKeys.value.has("animals")).toBe(true);
      expect(onTreeAction).toHaveBeenCalledWith("animals");
      expect(onItemAction).toHaveBeenCalledWith("animals");
    });

    scope.stop();
  });

  it("does not select disabled rows", () => {
    const scope = effectScope();

    scope.run(() => {
      const state = useTreeState({
        collection: treeData,
        selectionMode: "multiple",
        disabledKeys: ["animals"],
      });
      useTree(
        {
          "aria-label": "Items",
        },
        state,
        ref(null)
      );

      const node = state.collection.value.getNode("animals");
      if (!node) {
        throw new Error("Expected animals node");
      }

      const item = useTreeItem(
        {
          node,
        },
        state,
        ref(document.createElement("div"))
      );

      (item.rowProps.value.onClick as () => void)();

      expect(state.selectionManager.selectedKeys.value.size).toBe(0);
      expect(item.isDisabled.value).toBe(true);
    });

    scope.stop();
  });

  it("includes virtualized row metadata", () => {
    const scope = effectScope();

    scope.run(() => {
      const state = useTreeState({
        collection: treeData,
        defaultExpandedKeys: ["animals"],
      });
      useTree(
        {
          "aria-label": "Items",
          isVirtualized: true,
        },
        state,
        ref(null)
      );

      const node = state.collection.value.getNode("bear");
      if (!node) {
        throw new Error("Expected bear node");
      }

      const item = useTreeItem(
        {
          node,
        },
        state,
        ref(document.createElement("div"))
      );

      expect(item.rowProps.value["aria-posinset"]).toBe(2);
      expect(item.rowProps.value["aria-setsize"]).toBe(2);
    });

    scope.stop();
  });
});
