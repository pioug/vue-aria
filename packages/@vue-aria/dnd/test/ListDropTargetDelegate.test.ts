import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { ListDropTargetDelegate } from "../src/ListDropTargetDelegate";
import type { CollectionNode, DropTarget } from "../src/types";

function createRect(left: number, top: number, width: number, height: number): DOMRect {
  return {
    x: left,
    y: top,
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    toJSON: () => ({}),
  } as DOMRect;
}

function setRect(
  element: HTMLElement,
  left: number,
  top: number,
  width: number,
  height: number
): void {
  const rect = createRect(left, top, width, height);
  Object.defineProperty(element, "getBoundingClientRect", {
    configurable: true,
    value: () => rect,
  });
}

function createNode(key: string, index: number): CollectionNode {
  return {
    type: "item",
    key,
    value: { key },
    level: 0,
    hasChildNodes: false,
    childNodes: [],
    rendered: null,
    textValue: key,
    index,
    parentKey: null,
    nextKey: null,
    prevKey: null,
  };
}

function createVerticalStack(): {
  delegate: ListDropTargetDelegate;
  container: HTMLElement;
} {
  const container = document.createElement("div");
  container.dataset.collection = "demo";
  setRect(container, 0, 0, 100, 120);

  const keys = ["a", "b", "c"];
  const nodes = keys.map((key, index) => createNode(key, index));

  keys.forEach((key, index) => {
    const item = document.createElement("div");
    item.dataset.key = key;
    item.dataset.collection = "demo";
    setRect(item, 0, index * 40, 100, 40);
    container.appendChild(item);
  });

  document.body.appendChild(container);

  return {
    delegate: new ListDropTargetDelegate(nodes, ref(container), {
      layout: "stack",
      orientation: "vertical",
      direction: "ltr",
    }),
    container,
  };
}

function createHorizontalRTLStack(): {
  delegate: ListDropTargetDelegate;
  container: HTMLElement;
} {
  const container = document.createElement("div");
  container.dataset.collection = "demo-rtl";
  setRect(container, 0, 0, 120, 40);

  const keys = ["a", "b", "c"];
  const nodes = keys.map((key, index) => createNode(key, index));

  keys.forEach((key, index) => {
    const item = document.createElement("div");
    item.dataset.key = key;
    item.dataset.collection = "demo-rtl";
    setRect(item, (keys.length - 1 - index) * 40, 0, 40, 40);
    container.appendChild(item);
  });

  document.body.appendChild(container);

  return {
    delegate: new ListDropTargetDelegate(nodes, ref(container), {
      layout: "stack",
      orientation: "horizontal",
      direction: "rtl",
    }),
    container,
  };
}

function isAlwaysValid(_target: DropTarget): boolean {
  return true;
}

describe("ListDropTargetDelegate", () => {
  it("returns root when collection is empty", () => {
    const container = document.createElement("div");
    setRect(container, 0, 0, 100, 100);
    document.body.appendChild(container);

    const delegate = new ListDropTargetDelegate([], ref(container));
    expect(delegate.getDropTargetFromPoint(10, 10, isAlwaysValid)).toEqual({
      type: "root",
    });
  });

  it("returns item on position when pointer is centered", () => {
    const { delegate } = createVerticalStack();

    expect(delegate.getDropTargetFromPoint(50, 20, isAlwaysValid)).toEqual({
      type: "item",
      key: "a",
      dropPosition: "on",
    });
  });

  it("returns before/after positions near item edges", () => {
    const { delegate } = createVerticalStack();

    expect(delegate.getDropTargetFromPoint(50, 2, isAlwaysValid)).toEqual({
      type: "item",
      key: "a",
      dropPosition: "before",
    });

    expect(delegate.getDropTargetFromPoint(50, 38, isAlwaysValid)).toEqual({
      type: "item",
      key: "a",
      dropPosition: "after",
    });
  });

  it("falls back to before/after when dropping on item is invalid", () => {
    const { delegate } = createVerticalStack();
    const onlyEdgeDrops = (target: DropTarget) =>
      target.type === "item" && target.dropPosition !== "on";

    expect(delegate.getDropTargetFromPoint(50, 10, onlyEdgeDrops)).toEqual({
      type: "item",
      key: "a",
      dropPosition: "before",
    });

    expect(delegate.getDropTargetFromPoint(50, 30, onlyEdgeDrops)).toEqual({
      type: "item",
      key: "a",
      dropPosition: "after",
    });
  });

  it("inverts before/after for horizontal rtl flow", () => {
    const { delegate } = createHorizontalRTLStack();

    expect(delegate.getDropTargetFromPoint(2, 20, isAlwaysValid)).toEqual({
      type: "item",
      key: "c",
      dropPosition: "after",
    });

    expect(delegate.getDropTargetFromPoint(38, 20, isAlwaysValid)).toEqual({
      type: "item",
      key: "c",
      dropPosition: "before",
    });
  });
});
