import type { Node } from "@vue-aria/collections";
import { effectScope } from "vue";
import { describe, expect, it } from "vitest";
import { useTreeState } from "@vue-aria/tree-state";
import { useTree } from "../src/useTree";
import { useTreeItem } from "../src/useTreeItem";

interface TreeInput {
  key: string;
  text: string;
  children?: TreeInput[];
}

function buildNodes(
  inputs: TreeInput[],
  parentKey: string | null = null,
  level = 0
): Node<object>[] {
  return inputs.map((input, index) => {
    const children = buildNodes(input.children ?? [], input.key, level + 1);
    return {
      type: "item",
      key: input.key,
      value: null,
      level,
      hasChildNodes: children.length > 0,
      rendered: input.text,
      textValue: input.text,
      index,
      parentKey,
      prevKey: null,
      nextKey: null,
      firstChildKey: children[0]?.key ?? null,
      lastChildKey: children[children.length - 1]?.key ?? null,
      props: {},
      colSpan: null,
      colIndex: null,
      childNodes: children,
    };
  });
}

function createTreeData(): Node<object>[] {
  return buildNodes([
    {
      key: "animals",
      text: "Animals",
      children: [
        { key: "aardvark", text: "Aardvark" },
        { key: "bear", text: "Bear" },
      ],
    },
    {
      key: "plants",
      text: "Plants",
    },
  ]);
}

describe("useTreeItem integration", () => {
  it("expands rows and focuses the selection manager via expandButtonProps", () => {
    const treeEl = document.createElement("div");
    const rowEl = document.createElement("div");

    const scope = effectScope();
    const state = scope.run(() =>
      useTreeState({
        collection: createTreeData(),
        selectionMode: "single",
      })
    )!;

    scope.run(() =>
      useTree(
        {
          "aria-label": "Integration tree",
        },
        state,
        { current: treeEl as HTMLElement | null }
      )
    );

    const node = state.collection.getItem("animals");
    if (!node) {
      throw new Error("Expected animals node");
    }

    const aria = scope.run(() =>
      useTreeItem(
        {
          node,
        },
        state,
        { current: rowEl as HTMLElement | null }
      )
    )!;

    expect(aria.expandButtonProps["aria-label"]).toBe("Expand");
    expect(aria.expandButtonProps["aria-labelledby"]).toContain("react-aria");

    aria.expandButtonProps.onPress?.({} as never);

    expect(state.expandedKeys.has("animals")).toBe(true);
    expect(state.selectionManager.isFocused).toBe(true);
    expect(state.selectionManager.focusedKey).toBe("animals");
    scope.stop();
  });

  it("does not expand disabled rows when expandButtonProps is pressed", () => {
    const treeEl = document.createElement("div");
    const rowEl = document.createElement("div");

    const scope = effectScope();
    const state = scope.run(() =>
      useTreeState({
        collection: createTreeData(),
        selectionMode: "single",
        disabledKeys: new Set(["animals"]),
      })
    )!;

    scope.run(() =>
      useTree(
        {
          "aria-label": "Integration tree",
        },
        state,
        { current: treeEl as HTMLElement | null }
      )
    );

    const node = state.collection.getItem("animals");
    if (!node) {
      throw new Error("Expected animals node");
    }

    const aria = scope.run(() =>
      useTreeItem(
        {
          node,
        },
        state,
        { current: rowEl as HTMLElement | null }
      )
    )!;

    aria.expandButtonProps.onPress?.({} as never);
    expect(state.expandedKeys.has("animals")).toBe(false);
    scope.stop();
  });
});
