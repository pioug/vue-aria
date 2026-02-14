import type { Node } from "@vue-aria/collections";
import { effectScope, nextTick } from "vue";
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
        {
          key: "bear",
          text: "Bear",
          children: [
            { key: "black-bear", text: "Black Bear" },
            { key: "brown-bear", text: "Brown Bear" },
          ],
        },
        { key: "kangaroo", text: "Kangaroo" },
        { key: "snake", text: "Snake" },
      ],
    },
    {
      key: "fruits",
      text: "Fruits",
      children: [
        { key: "apple", text: "Apple" },
        { key: "orange", text: "Orange" },
        {
          key: "kiwi",
          text: "Kiwi",
          children: [
            { key: "golden-kiwi", text: "Golden Kiwi" },
            { key: "fuzzy-kiwi", text: "Fuzzy Kiwi" },
          ],
        },
      ],
    },
  ]);
}

async function flush() {
  await nextTick();
  await nextTick();
}

function attachRowHandlers(
  element: HTMLElement,
  rowProps: Record<string, unknown>
): () => void {
  const disposers: Array<() => void> = [];
  const register = (
    key: "onKeydownCapture" | "onKeydown" | "onKeyup" | "onFocus",
    eventName: keyof HTMLElementEventMap,
    capture = false
  ) => {
    const handler = rowProps[key] as ((event: Event) => void) | undefined;
    if (!handler) {
      return;
    }

    const listener = (event: Event) => handler(event);
    element.addEventListener(eventName, listener as EventListener, capture);
    disposers.push(() => element.removeEventListener(eventName, listener as EventListener, capture));
  };

  register("onFocus", "focus");
  register("onKeydownCapture", "keydown", true);
  register("onKeydown", "keydown");
  register("onKeyup", "keyup");

  return () => {
    for (const dispose of disposers) {
      dispose();
    }
  };
}

describe("tree keyboard navigation parity", () => {
  it("supports keyboard expansion and directional navigation from upstream story behavior", async () => {
    const grid = document.createElement("div");
    const animalsRow = document.createElement("div");
    const bearRow = document.createElement("div");
    animalsRow.tabIndex = 0;
    bearRow.tabIndex = 0;
    document.body.append(grid, animalsRow, bearRow);

    const scope = effectScope();
    const state = scope.run(() =>
      useTreeState({
        collection: createTreeData(),
        selectionMode: "none",
      })
    )!;

    let gridProps = scope.run(() =>
      useTree(
        {
          "aria-label": "Keyboard tree",
        },
        state,
        { current: grid as HTMLElement | null }
      ).gridProps
    )!;

    expect([...state.collection.getKeys()]).toEqual(["animals", "fruits"]);

    const animalsItemAria = scope.run(() =>
      useTreeItem(
        {
          node: state.collection.getItem("animals")!,
        },
        state,
        { current: animalsRow as HTMLElement | null }
      )
    )!;

    const disposeAnimalsHandlers = attachRowHandlers(animalsRow, animalsItemAria.rowProps);
    state.selectionManager.setFocused(true);
    state.selectionManager.setFocusedKey("animals");
    animalsRow.focus();
    animalsRow.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })
    );
    animalsRow.dispatchEvent(
      new KeyboardEvent("keyup", { key: "Enter", bubbles: true, cancelable: true })
    );
    await flush();
    expect(state.expandedKeys.has("animals")).toBe(true);
    expect([...state.collection.getKeys()]).toEqual([
      "animals",
      "aardvark",
      "bear",
      "kangaroo",
      "snake",
      "fruits",
    ]);

    const bearItemAria = scope.run(() =>
      useTreeItem(
        {
          node: state.collection.getItem("bear")!,
        },
        state,
        { current: bearRow as HTMLElement | null }
      )
    )!;
    const disposeBearHandlers = attachRowHandlers(bearRow, bearItemAria.rowProps);
    state.selectionManager.setFocusedKey("bear");
    bearRow.focus();
    bearRow.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })
    );
    bearRow.dispatchEvent(
      new KeyboardEvent("keyup", { key: "Enter", bubbles: true, cancelable: true })
    );
    await flush();
    expect(state.expandedKeys.has("bear")).toBe(true);
    expect([...state.collection.getKeys()]).toEqual([
      "animals",
      "aardvark",
      "bear",
      "black-bear",
      "brown-bear",
      "kangaroo",
      "snake",
      "fruits",
    ]);

    gridProps = scope.run(() =>
      useTree(
        {
          "aria-label": "Keyboard tree",
        },
        state,
        { current: grid as HTMLElement | null }
      ).gridProps
    )!;
    const onGridKeydown = gridProps.onKeydown as ((event: KeyboardEvent) => void) | undefined;
    if (!onGridKeydown) {
      throw new Error("Expected grid keydown handler");
    }
    grid.addEventListener("keydown", (event) => onGridKeydown(event as KeyboardEvent));
    state.selectionManager.setFocused(true);
    state.selectionManager.setFocusedKey("animals");
    grid.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
    await flush();
    expect(state.selectionManager.focusedKey).toBe("aardvark");
    grid.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
    await flush();
    expect(state.selectionManager.focusedKey).toBe("bear");

    state.selectionManager.setFocusedKey("bear");
    bearRow.focus();
    bearRow.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true })
    );
    await flush();
    expect(state.expandedKeys.has("bear")).toBe(false);
    expect([...state.collection.getKeys()]).toEqual([
      "animals",
      "aardvark",
      "bear",
      "kangaroo",
      "snake",
      "fruits",
    ]);

    state.selectionManager.setFocusedKey("animals");
    animalsRow.focus();
    animalsRow.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true })
    );
    await flush();
    expect(state.expandedKeys.has("animals")).toBe(false);
    expect([...state.collection.getKeys()]).toEqual(["animals", "fruits"]);

    disposeAnimalsHandlers();
    disposeBearHandlers();
    scope.stop();
    grid.remove();
    animalsRow.remove();
    bearRow.remove();
  });
});
