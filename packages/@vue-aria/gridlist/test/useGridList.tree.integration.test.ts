import type { Node } from "@vue-aria/collections";
import { effectScope, nextTick } from "vue";
import { describe, expect, it } from "vitest";
import { useTreeState } from "@vue-aria/tree-state";
import { useGridList } from "../src/useGridList";
import { useGridListItem } from "../src/useGridListItem";

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
    { key: "plants", text: "Plants" },
  ]);
}

async function flush() {
  await nextTick();
  await nextTick();
}

describe("useGridList tree integration parity", () => {
  it("applies tree row metadata and expands parent rows with ArrowRight", async () => {
    const grid = document.createElement("div");
    const row = document.createElement("div");
    grid.appendChild(row);
    document.body.appendChild(grid);

    const scope = effectScope();
    const state = scope.run(() =>
      useTreeState({
        collection: createTreeData(),
        selectionMode: "none",
      })
    )!;

    const { gridProps } = scope.run(() =>
      useGridList(
        {
          "aria-label": "Tree grid list",
        },
        state as any,
        { current: grid as HTMLElement | null }
      )
    )!;

    const node = state.collection.getItem("animals");
    if (!node) {
      throw new Error("Expected animals node");
    }

    const itemAria = scope.run(() =>
      useGridListItem(
        {
          node,
        },
        state as any,
        { current: row as HTMLElement | null }
      )
    )!;

    if (typeof itemAria.rowProps.tabIndex === "number") {
      row.tabIndex = itemAria.rowProps.tabIndex as number;
    }

    expect(itemAria.rowProps["aria-expanded"]).toBe(false);
    expect(itemAria.rowProps["aria-level"]).toBe(1);
    expect(itemAria.rowProps["aria-posinset"]).toBe(1);
    expect(itemAria.rowProps["aria-setsize"]).toBe(2);

    const onGridKeydown = gridProps.onKeydown as ((event: KeyboardEvent) => void) | undefined;
    if (onGridKeydown) {
      grid.addEventListener("keydown", (event) => onGridKeydown(event as KeyboardEvent));
    }
    const onRowFocus = itemAria.rowProps.onFocus as ((event: FocusEvent) => void) | undefined;
    const onRowKeydownCapture = itemAria.rowProps.onKeydownCapture as
      | ((event: KeyboardEvent) => void)
      | undefined;
    if (onRowFocus) {
      row.addEventListener("focus", (event) => onRowFocus(event as FocusEvent));
    }
    if (onRowKeydownCapture) {
      row.addEventListener("keydown", (event) => onRowKeydownCapture(event as KeyboardEvent), true);
    }

    state.selectionManager.setFocused(true);
    state.selectionManager.setFocusedKey("animals");
    row.focus();
    row.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    await flush();

    expect(state.expandedKeys.has("animals")).toBe(true);
    expect([...state.collection.getKeys()]).toEqual(["animals", "aardvark", "bear", "plants"]);

    scope.stop();
    grid.remove();
  });
});
