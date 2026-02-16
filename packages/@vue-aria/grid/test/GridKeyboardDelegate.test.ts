import { describe, expect, it } from "vitest";
import { GridCollection, type GridNode } from "@vue-stately/grid";
import { GridKeyboardDelegate } from "../src/GridKeyboardDelegate";

function cell(key: string, index: number): GridNode<object> {
  return {
    type: "cell",
    key,
    value: null,
    level: 1,
    hasChildNodes: false,
    childNodes: [],
    rendered: key,
    textValue: key,
    index,
    parentKey: null,
    prevKey: null,
    nextKey: null,
    firstChildKey: null,
    lastChildKey: null,
    props: {},
  };
}

function createCollection() {
  return new GridCollection({
    columnCount: 2,
    items: [
      {
        type: "item",
        key: "row-1",
        textValue: "Alpha",
        childNodes: [cell("r1c1", 0), cell("r1c2", 1)],
      },
      {
        type: "item",
        key: "row-2",
        textValue: "Bravo",
        childNodes: [cell("r2c1", 0), cell("r2c2", 1)],
      },
      {
        type: "item",
        key: "row-3",
        textValue: "Charlie",
        childNodes: [cell("r3c1", 0), cell("r3c2", 1)],
      },
    ],
  });
}

function createLayoutDelegate() {
  const rects = new Map<string, { x: number; y: number; width: number; height: number }>([
    ["row-1", { x: 0, y: 0, width: 100, height: 30 }],
    ["row-2", { x: 0, y: 30, width: 100, height: 30 }],
    ["row-3", { x: 0, y: 60, width: 100, height: 30 }],
    ["r1c1", { x: 0, y: 0, width: 50, height: 30 }],
    ["r1c2", { x: 50, y: 0, width: 50, height: 30 }],
    ["r2c1", { x: 0, y: 30, width: 50, height: 30 }],
    ["r2c2", { x: 50, y: 30, width: 50, height: 30 }],
    ["r3c1", { x: 0, y: 60, width: 50, height: 30 }],
    ["r3c2", { x: 50, y: 60, width: 50, height: 30 }],
  ]);

  return {
    getItemRect(key: string) {
      return rects.get(key) ?? null;
    },
    getContentSize() {
      return { width: 100, height: 90 };
    },
    getVisibleRect() {
      return { x: 0, y: 0, width: 100, height: 40 };
    },
  };
}

describe("GridKeyboardDelegate", () => {
  it("navigates rows and cells in row focus mode", () => {
    const collection = createCollection();
    const delegate = new GridKeyboardDelegate({
      collection,
      disabledKeys: new Set(),
      direction: "ltr",
      ref: { current: document.createElement("div") as HTMLElement | null },
      layoutDelegate: createLayoutDelegate(),
      focusMode: "row",
    });

    expect(delegate.getKeyRightOf("row-1")).toBe("r1c1");
    expect(delegate.getKeyRightOf("r1c1")).toBe("r1c2");
    expect(delegate.getKeyRightOf("r1c2")).toBe("row-1");
    expect(delegate.getKeyLeftOf("row-1")).toBe("r1c2");
    expect(delegate.getKeyBelow("row-1")).toBe("row-2");
    expect(delegate.getKeyBelow("r1c1")).toBe("r2c1");
    expect(delegate.getKeyAbove("r2c2")).toBe("r1c2");
  });

  it("supports rtl horizontal direction for cell traversal", () => {
    const collection = createCollection();
    const delegate = new GridKeyboardDelegate({
      collection,
      disabledKeys: new Set(),
      direction: "rtl",
      ref: { current: document.createElement("div") as HTMLElement | null },
      layoutDelegate: createLayoutDelegate(),
      focusMode: "row",
    });

    expect(delegate.getKeyRightOf("row-1")).toBe("r1c2");
    expect(delegate.getKeyLeftOf("row-1")).toBe("r1c1");
    expect(delegate.getKeyRightOf("r1c2")).toBe("r1c1");
  });

  it("skips disabled rows and supports page/search APIs", () => {
    const collection = createCollection();
    const delegate = new GridKeyboardDelegate({
      collection,
      disabledKeys: new Set(["row-2"]),
      direction: "ltr",
      collator: new Intl.Collator("en-US", { usage: "search", sensitivity: "base" }),
      ref: { current: document.createElement("div") as HTMLElement | null },
      layoutDelegate: createLayoutDelegate(),
      focusMode: "cell",
    });

    expect(delegate.getKeyBelow("r1c1")).toBe("r3c1");
    expect(delegate.getFirstKey()).toBe("r1c1");
    expect(delegate.getLastKey()).toBe("r3c2");
    expect(delegate.getKeyPageBelow("r1c1")).toBe("r3c1");
    expect(delegate.getKeyPageAbove("r3c1")).toBe("r1c1");

    const searchableDelegate = new GridKeyboardDelegate({
      collection,
      disabledKeys: new Set(),
      direction: "ltr",
      collator: new Intl.Collator("en-US", { usage: "search", sensitivity: "base" }),
      ref: { current: document.createElement("div") as HTMLElement | null },
      layoutDelegate: createLayoutDelegate(),
      focusMode: "cell",
    });
    expect(searchableDelegate.getKeyForSearch("br")).toBe("r2c1");
  });
});
