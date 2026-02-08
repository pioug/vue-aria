import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import { useTreeState, type TreeInputNode } from "@vue-aria/tree-state";
import { useTree } from "../src";

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

afterEach(() => {
  document.body.innerHTML = "";
});

describe("useTree", () => {
  it("returns treegrid semantics", () => {
    const scope = effectScope();

    scope.run(() => {
      const state = useTreeState({
        collection: treeData,
        selectionMode: "multiple",
      });
      const tree = useTree(
        {
          "aria-label": "Files",
        },
        state,
        ref(null)
      );

      expect(tree.gridProps.value.role).toBe("treegrid");
      expect(tree.gridProps.value.id).toBeTypeOf("string");
      expect(tree.gridProps.value["aria-multiselectable"]).toBe("true");
    });

    scope.stop();
  });

  it("navigates with arrow keys", () => {
    const scope = effectScope();

    scope.run(() => {
      const state = useTreeState({
        collection: treeData,
        defaultExpandedKeys: ["animals"],
      });

      const tree = useTree(
        {
          "aria-label": "Items",
        },
        state,
        ref(null)
      );

      (tree.gridProps.value.onFocus as (event: FocusEvent) => void)({
        type: "focus",
      } as FocusEvent);

      expect(state.selectionManager.focusedKey.value).toBe("animals");

      (tree.gridProps.value.onKeydown as (event: KeyboardEvent) => void)({
        key: "ArrowDown",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);
      expect(state.selectionManager.focusedKey.value).toBe("aardvark");

      (tree.gridProps.value.onKeydown as (event: KeyboardEvent) => void)({
        key: "End",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);
      expect(state.selectionManager.focusedKey.value).toBe("fruits");

      (tree.gridProps.value.onKeydown as (event: KeyboardEvent) => void)({
        key: "Home",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);
      expect(state.selectionManager.focusedKey.value).toBe("animals");
    });

    scope.stop();
  });

  it("expands and collapses nodes with arrow keys", () => {
    const scope = effectScope();

    scope.run(() => {
      const state = useTreeState({
        collection: treeData,
        defaultExpandedKeys: ["animals", "bear"],
      });

      const tree = useTree(
        {
          "aria-label": "Items",
        },
        state,
        ref(null)
      );

      state.selectionManager.setFocused(true);
      state.selectionManager.setFocusedKey("animals");

      (tree.gridProps.value.onKeydown as (event: KeyboardEvent) => void)({
        key: "ArrowRight",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);
      expect(state.selectionManager.focusedKey.value).toBe("aardvark");

      state.selectionManager.setFocusedKey("black-bear");

      (tree.gridProps.value.onKeydown as (event: KeyboardEvent) => void)({
        key: "ArrowLeft",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);
      expect(state.selectionManager.focusedKey.value).toBe("bear");

      expect(state.expandedKeys.value.has("bear")).toBe(true);
      (tree.gridProps.value.onKeydown as (event: KeyboardEvent) => void)({
        key: "ArrowLeft",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);
      expect(state.expandedKeys.value.has("bear")).toBe(false);
    });

    scope.stop();
  });

  it("supports typeahead focus", () => {
    const scope = effectScope();

    scope.run(() => {
      const state = useTreeState({
        collection: treeData,
      });

      const tree = useTree(
        {
          "aria-label": "Items",
        },
        state,
        ref(null)
      );

      const currentTarget = document.createElement("div");
      const target = document.createElement("div");
      currentTarget.appendChild(target);

      (tree.gridProps.value.onKeydownCapture as (event: KeyboardEvent) => void)({
        key: "f",
        ctrlKey: false,
        metaKey: false,
        currentTarget,
        target,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as KeyboardEvent);

      expect(state.selectionManager.focusedKey.value).toBe("fruits");
    });

    scope.stop();
  });

  it("selects and triggers action on keyboard activation", () => {
    const scope = effectScope();

    scope.run(() => {
      const onAction = vi.fn();
      const state = useTreeState({
        collection: treeData,
        selectionMode: "multiple",
      });
      const tree = useTree(
        {
          "aria-label": "Items",
          onAction,
        },
        state,
        ref(null)
      );

      state.selectionManager.setFocusedKey("animals");

      (tree.gridProps.value.onKeydown as (event: KeyboardEvent) => void)({
        key: "Enter",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);

      expect(state.selectionManager.selectedKeys.value.has("animals")).toBe(true);
      expect(onAction).toHaveBeenCalledWith("animals");
    });

    scope.stop();
  });

  it("supports virtual focus with aria-activedescendant", () => {
    const scope = effectScope();

    scope.run(() => {
      const state = useTreeState({
        collection: treeData,
      });
      const tree = useTree(
        {
          "aria-label": "Items",
          shouldUseVirtualFocus: true,
        },
        state,
        ref(null)
      );

      state.selectionManager.setFocusedKey("animals");
      state.selectionManager.setFocused(true);

      expect(tree.gridProps.value["aria-activedescendant"]).toContain("animals");
    });

    scope.stop();
  });
});
