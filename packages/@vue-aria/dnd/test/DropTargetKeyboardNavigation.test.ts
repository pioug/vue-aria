import { describe, expect, it } from "vitest";
import { navigate } from "../src/DropTargetKeyboardNavigation";
import type {
  Collection,
  CollectionNode,
  DropTarget,
  KeyboardDelegate,
} from "../src/types";
import type { Key } from "@vue-aria/types";

interface Item {
  id: string;
  name: string;
  childItems?: Item[];
}

const rows: Item[] = [
  {
    id: "projects",
    name: "Projects",
    childItems: [
      { id: "project-1", name: "Project 1" },
      {
        id: "project-2",
        name: "Project 2",
        childItems: [
          { id: "project-2A", name: "Project 2A" },
          { id: "project-2B", name: "Project 2B" },
          { id: "project-2C", name: "Project 2C" },
        ],
      },
      { id: "project-3", name: "Project 3" },
      { id: "project-4", name: "Project 4" },
      {
        id: "project-5",
        name: "Project 5",
        childItems: [
          { id: "project-5A", name: "Project 5A" },
          { id: "project-5B", name: "Project 5B" },
          { id: "project-5C", name: "Project 5C" },
        ],
      },
    ],
  },
  {
    id: "reports",
    name: "Reports",
    childItems: [
      {
        id: "reports-1",
        name: "Reports 1",
        childItems: [
          {
            id: "reports-1A",
            name: "Reports 1A",
            childItems: [
              {
                id: "reports-1AB",
                name: "Reports 1AB",
                childItems: [{ id: "reports-1ABC", name: "Reports 1ABC" }],
              },
            ],
          },
          { id: "reports-1B", name: "Reports 1B" },
          { id: "reports-1C", name: "Reports 1C" },
        ],
      },
      { id: "reports-2", name: "Reports 2" },
    ],
  },
];

class TestCollection implements Collection<Item> {
  private readonly map: Map<Key, CollectionNode<Item>>;
  private readonly rootNodes: CollectionNode<Item>[];

  constructor(items: Item[]) {
    this.map = new Map<Key, CollectionNode<Item>>();

    const visitItem = (
      item: Item,
      index: number,
      level = 0,
      parentKey: Key | null = null
    ): CollectionNode<Item> => {
      const childNodes = item.childItems ? visitItems(item.childItems, level + 1, item.id) : [];
      return {
        type: "item",
        key: item.id,
        value: item,
        level,
        hasChildNodes: childNodes.length > 0,
        childNodes,
        rendered: null,
        textValue: "",
        index,
        parentKey,
        nextKey: null,
        prevKey: null,
      };
    };

    const visitItems = (
      currentItems: Item[],
      level: number,
      parentKey: Key | null
    ): CollectionNode<Item>[] => {
      let last: CollectionNode<Item> | null = null;
      const nodes: CollectionNode<Item>[] = [];

      currentItems.forEach((item, index) => {
        const node = visitItem(item, index, level, parentKey);
        this.map.set(item.id, node);
        nodes.push(node);

        node.prevKey = last?.key ?? null;
        if (last) {
          last.nextKey = node.key;
        }

        last = node;
      });

      return nodes;
    };

    this.rootNodes = visitItems(items, 0, null);
  }

  getItem(key: Key): CollectionNode<Item> | null {
    return this.map.get(key) ?? null;
  }

  getFirstKey(): Key | null {
    return this.rootNodes[0]?.key ?? null;
  }

  getLastKey(): Key | null {
    let lastNode = this.rootNodes[this.rootNodes.length - 1];
    let lastKey = lastNode?.prevKey ?? null;

    while (lastNode?.hasChildNodes) {
      const children = Array.from(lastNode.childNodes);
      lastNode = children[children.length - 1] ?? null;
      if (lastNode) {
        lastKey = lastNode.key;
      }
    }

    return lastKey;
  }

  getKeyBefore(key: Key): Key | null {
    const item = this.map.get(key);
    if (!item) {
      return null;
    }

    if (item.prevKey == null) {
      return item.parentKey ?? null;
    }

    let prevKey = item.prevKey;
    let prevNode = this.map.get(prevKey);

    while (prevNode?.hasChildNodes) {
      const children = Array.from(prevNode.childNodes);
      prevNode = children[children.length - 1] ?? null;
      if (prevNode) {
        prevKey = prevNode.key;
      }
    }

    return prevKey;
  }

  getKeyAfter(key: Key): Key | null {
    const item = this.map.get(key);
    if (!item) {
      return null;
    }

    if (item.hasChildNodes) {
      return Array.from(item.childNodes)[0]?.key ?? null;
    }

    if (item.nextKey != null) {
      return item.nextKey;
    }

    let parentKey = item.parentKey;
    while (parentKey != null) {
      const parentNode = this.map.get(parentKey);
      if (!parentNode) {
        return null;
      }

      if (parentNode.nextKey != null) {
        return parentNode.nextKey;
      }

      parentKey = parentNode.parentKey;
    }

    return null;
  }

  [Symbol.iterator](): Iterator<CollectionNode<Item>> {
    return this.rootNodes.values();
  }
}

const collection = new TestCollection(rows);

const expectedTargets: DropTarget[] = [
  { type: "root" },
  { type: "item", key: "projects", dropPosition: "before" },
  { type: "item", key: "projects", dropPosition: "on" },
  { type: "item", key: "project-1", dropPosition: "before" },
  { type: "item", key: "project-1", dropPosition: "on" },
  { type: "item", key: "project-2", dropPosition: "before" },
  { type: "item", key: "project-2", dropPosition: "on" },
  { type: "item", key: "project-2A", dropPosition: "before" },
  { type: "item", key: "project-2A", dropPosition: "on" },
  { type: "item", key: "project-2B", dropPosition: "before" },
  { type: "item", key: "project-2B", dropPosition: "on" },
  { type: "item", key: "project-2C", dropPosition: "before" },
  { type: "item", key: "project-2C", dropPosition: "on" },
  { type: "item", key: "project-2C", dropPosition: "after" },
  { type: "item", key: "project-3", dropPosition: "before" },
  { type: "item", key: "project-3", dropPosition: "on" },
  { type: "item", key: "project-4", dropPosition: "before" },
  { type: "item", key: "project-4", dropPosition: "on" },
  { type: "item", key: "project-5", dropPosition: "before" },
  { type: "item", key: "project-5", dropPosition: "on" },
  { type: "item", key: "project-5A", dropPosition: "before" },
  { type: "item", key: "project-5A", dropPosition: "on" },
  { type: "item", key: "project-5B", dropPosition: "before" },
  { type: "item", key: "project-5B", dropPosition: "on" },
  { type: "item", key: "project-5C", dropPosition: "before" },
  { type: "item", key: "project-5C", dropPosition: "on" },
  { type: "item", key: "project-5C", dropPosition: "after" },
  { type: "item", key: "project-5", dropPosition: "after" },
  { type: "item", key: "reports", dropPosition: "before" },
  { type: "item", key: "reports", dropPosition: "on" },
  { type: "item", key: "reports-1", dropPosition: "before" },
  { type: "item", key: "reports-1", dropPosition: "on" },
  { type: "item", key: "reports-1A", dropPosition: "before" },
  { type: "item", key: "reports-1A", dropPosition: "on" },
  { type: "item", key: "reports-1AB", dropPosition: "before" },
  { type: "item", key: "reports-1AB", dropPosition: "on" },
  { type: "item", key: "reports-1ABC", dropPosition: "before" },
  { type: "item", key: "reports-1ABC", dropPosition: "on" },
  { type: "item", key: "reports-1ABC", dropPosition: "after" },
  { type: "item", key: "reports-1AB", dropPosition: "after" },
  { type: "item", key: "reports-1B", dropPosition: "before" },
  { type: "item", key: "reports-1B", dropPosition: "on" },
  { type: "item", key: "reports-1C", dropPosition: "before" },
  { type: "item", key: "reports-1C", dropPosition: "on" },
  { type: "item", key: "reports-1C", dropPosition: "after" },
  { type: "item", key: "reports-2", dropPosition: "before" },
  { type: "item", key: "reports-2", dropPosition: "on" },
  { type: "item", key: "reports-2", dropPosition: "after" },
  { type: "item", key: "reports", dropPosition: "after" },
];

function createKeyboardDelegate(
  options: { orientation?: "vertical" | "horizontal"; direction?: "ltr" | "rtl" } = {}
): KeyboardDelegate {
  const orientation = options.orientation ?? "vertical";
  const direction = options.direction ?? "ltr";

  const getAfter = (key: Key) => collection.getKeyAfter(key);
  const getBefore = (key: Key) => collection.getKeyBefore(key);

  return {
    getFirstKey: () => collection.getFirstKey(),
    getLastKey: () => collection.getLastKey(),
    getKeyAbove: (key) => (orientation === "vertical" ? getBefore(key) : null),
    getKeyBelow: (key) => (orientation === "vertical" ? getAfter(key) : null),
    getKeyRightOf: (key) => {
      if (orientation !== "horizontal") {
        return null;
      }
      return direction === "rtl" ? getBefore(key) : getAfter(key);
    },
    getKeyLeftOf: (key) => {
      if (orientation !== "horizontal") {
        return null;
      }
      return direction === "rtl" ? getAfter(key) : getBefore(key);
    },
  };
}

function collect(
  keyboardDelegate: KeyboardDelegate,
  direction: "up" | "down" | "left" | "right",
  rtl = false
): DropTarget[] {
  const results: DropTarget[] = [];
  let target: DropTarget | null = null;

  do {
    target = navigate(keyboardDelegate, collection, target, direction, rtl);
    if (target != null) {
      results.push(target);
    }
  } while (target != null);

  return results;
}

describe("drop target keyboard navigation", () => {
  it("sanity checks collection traversal", () => {
    const nextKeys: Key[] = [];
    let key = collection.getFirstKey();

    while (key != null) {
      nextKeys.push(key);
      key = collection.getKeyAfter(key);
    }

    const expectedKeys = [
      "projects",
      "project-1",
      "project-2",
      "project-2A",
      "project-2B",
      "project-2C",
      "project-3",
      "project-4",
      "project-5",
      "project-5A",
      "project-5B",
      "project-5C",
      "reports",
      "reports-1",
      "reports-1A",
      "reports-1AB",
      "reports-1ABC",
      "reports-1B",
      "reports-1C",
      "reports-2",
    ];

    expect(nextKeys).toEqual(expectedKeys);

    const prevKeys: Key[] = [];
    key = collection.getLastKey();

    while (key != null) {
      prevKeys.push(key);
      key = collection.getKeyBefore(key);
    }

    expect(prevKeys).toEqual([...expectedKeys].reverse());
  });

  it("navigates forward vertically", () => {
    const keyboardDelegate = createKeyboardDelegate();
    const results = collect(keyboardDelegate, "down");
    expect(results).toEqual(expectedTargets);
  });

  it("navigates backward vertically", () => {
    const keyboardDelegate = createKeyboardDelegate();
    const results = collect(keyboardDelegate, "up");
    expect(results.reverse()).toEqual(expectedTargets);
  });

  it("navigates forward horizontally (ltr)", () => {
    const keyboardDelegate = createKeyboardDelegate({
      orientation: "horizontal",
      direction: "ltr",
    });

    const results = collect(keyboardDelegate, "right");
    expect(results).toEqual(expectedTargets);
  });

  it("navigates forward horizontally (rtl)", () => {
    const keyboardDelegate = createKeyboardDelegate({
      orientation: "horizontal",
      direction: "rtl",
    });

    const results = collect(keyboardDelegate, "left", true);
    expect(results).toEqual(expectedTargets);
  });

  it("navigates backward horizontally (ltr)", () => {
    const keyboardDelegate = createKeyboardDelegate({
      orientation: "horizontal",
      direction: "ltr",
    });

    const results = collect(keyboardDelegate, "left");
    expect(results.reverse()).toEqual(expectedTargets);
  });

  it("navigates backward horizontally (rtl)", () => {
    const keyboardDelegate = createKeyboardDelegate({
      orientation: "horizontal",
      direction: "rtl",
    });

    const results = collect(keyboardDelegate, "right", true);
    expect(results.reverse()).toEqual(expectedTargets);
  });
});
