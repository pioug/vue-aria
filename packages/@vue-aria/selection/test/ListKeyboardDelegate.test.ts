import { describe, expect, it } from "vitest";
import { ListKeyboardDelegate } from "../src/ListKeyboardDelegate";
import type { Key, Node } from "@vue-aria/collections";
import type { LayoutDelegate, Rect, SearchableCollection } from "../src/types";

interface TestNode extends Node<unknown> {
  textValue: string;
}

function createCollection(nodes: TestNode[]): SearchableCollection<unknown> {
  const index = new Map<Key, number>();
  const items = new Map<Key, TestNode>();

  nodes.forEach((node, i) => {
    index.set(node.key, i);
    items.set(node.key, node);
  });

  return {
    getItem(key: Key) {
      return items.get(key) ?? null;
    },
    getFirstKey() {
      return nodes[0]?.key ?? null;
    },
    getLastKey() {
      return nodes[nodes.length - 1]?.key ?? null;
    },
    getKeyBefore(key: Key) {
      const i = index.get(key);
      if (i == null || i <= 0) {
        return null;
      }

      return nodes[i - 1].key;
    },
    getKeyAfter(key: Key) {
      const i = index.get(key);
      if (i == null || i >= nodes.length - 1) {
        return null;
      }

      return nodes[i + 1].key;
    },
  };
}

function createNode(key: Key, textValue: string, isDisabled = false): TestNode {
  return {
    type: "item",
    key,
    value: null,
    level: 0,
    hasChildNodes: false,
    rendered: textValue,
    textValue,
    index: 0,
    parentKey: null,
    prevKey: null,
    nextKey: null,
    firstChildKey: null,
    lastChildKey: null,
    props: { isDisabled },
    colSpan: null,
    colIndex: null,
    childNodes: [],
  };
}

function rect(x: number, y: number): Rect {
  return { x, y, width: 100, height: 30 };
}

describe("ListKeyboardDelegate", () => {
  it("skips disabled items for next/previous/first/last", () => {
    const collection = createCollection([
      createNode("a", "Alpha", true),
      createNode("b", "Bravo"),
      createNode("c", "Charlie", true),
      createNode("d", "Delta"),
    ]);

    const delegate = new ListKeyboardDelegate({
      collection,
      ref: { current: null },
      disabledKeys: new Set<Key>(),
    });

    expect(delegate.getFirstKey()).toBe("b");
    expect(delegate.getLastKey()).toBe("d");
    expect(delegate.getNextKey("b")).toBe("d");
    expect(delegate.getPreviousKey("d")).toBe("b");
  });

  it("navigates by column in vertical grid", () => {
    const collection = createCollection([
      createNode("a", "Alpha"),
      createNode("b", "Bravo"),
      createNode("c", "Charlie"),
      createNode("d", "Delta"),
    ]);

    const layoutDelegate: LayoutDelegate = {
      getItemRect(key: Key) {
        if (key === "a") return rect(0, 0);
        if (key === "b") return rect(100, 0);
        if (key === "c") return rect(0, 30);
        if (key === "d") return rect(100, 30);
        return null;
      },
      getContentSize() {
        return { width: 200, height: 60 };
      },
      getVisibleRect() {
        return { x: 0, y: 0, width: 200, height: 60 };
      },
    };

    const delegate = new ListKeyboardDelegate({
      collection,
      ref: { current: null },
      layout: "grid",
      orientation: "vertical",
      direction: "ltr",
      layoutDelegate,
      disabledKeys: new Set<Key>(),
    });

    expect(delegate.getKeyBelow("a")).toBe("c");
    expect(delegate.getKeyAbove("d")).toBe("b");
    expect(delegate.getKeyRightOf?.("a")).toBe("b");
    expect(delegate.getKeyLeftOf?.("d")).toBe("c");
  });

  it("finds keys via collator search", () => {
    const collection = createCollection([
      createNode("a", "Alpha"),
      createNode("b", "Bravo"),
      createNode("c", "Charlie"),
    ]);

    const delegate = new ListKeyboardDelegate(
      collection,
      new Set<Key>(),
      { current: null },
      new Intl.Collator("en-US", { usage: "search", sensitivity: "base" })
    );

    expect(delegate.getKeyForSearch("br")).toBe("b");
    expect(delegate.getKeyForSearch("ch", "b")).toBe("c");
    expect(delegate.getKeyForSearch("zz")).toBeNull();
  });
});
