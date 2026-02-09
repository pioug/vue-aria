import { describe, expect, it, vi } from "vitest";
import type { Key } from "@vue-aria/types";
import { Layout } from "../src/Layout";
import { LayoutInfo } from "../src/LayoutInfo";
import { Point } from "../src/Point";
import { Rect } from "../src/Rect";
import { Size } from "../src/Size";
import { Virtualizer } from "../src/Virtualizer";
import type { VirtualizerCollection } from "../src/types";

interface Item {
  id: string;
}

class TestLayout extends Layout<Item> {
  readonly infos: Map<Key, LayoutInfo>;
  contentSize: Size;
  updateCalls = 0;

  constructor(infos: LayoutInfo[], contentSize: Size) {
    super();
    this.infos = new Map(infos.map((info) => [info.key, info]));
    this.contentSize = contentSize;
  }

  override getVisibleLayoutInfos(rect: Rect): LayoutInfo[] {
    return Array.from(this.infos.values()).filter((info) => info.rect.intersects(rect));
  }

  override getLayoutInfo(key: Key): LayoutInfo | null {
    return this.infos.get(key) ?? null;
  }

  override getContentSize(): Size {
    return this.contentSize;
  }

  override update(): void {
    this.updateCalls += 1;
  }
}

function createCollection(items: Item[]): VirtualizerCollection<Item> {
  const byKey = new Map(items.map((item) => [item.id, item]));
  return {
    getItem(key) {
      return byKey.get(String(key)) ?? null;
    },
  };
}

describe("Virtualizer", () => {
  it("returns the item key at a point", () => {
    const layout = new TestLayout(
      [
        new LayoutInfo("item", "a", new Rect(0, 0, 30, 30)),
        new LayoutInfo("item", "b", new Rect(40, 0, 30, 30)),
      ],
      new Size(70, 30)
    );

    const virtualizer = new Virtualizer<Item, string>({
      layout,
      collection: createCollection([{ id: "a" }, { id: "b" }]),
      delegate: {
        renderView: (_type, content) => content?.id ?? "",
        setVisibleRect: () => {},
        invalidate: () => {},
      },
    });

    expect(virtualizer.keyAtPoint(new Point(10, 10))).toBe("a");
    expect(virtualizer.keyAtPoint(new Point(50, 10))).toBe("b");
    expect(virtualizer.keyAtPoint(new Point(35, 10))).toBeNull();
  });

  it("treats parent keys as persisted when child keys are persisted", () => {
    const parent = new LayoutInfo("section", "parent", new Rect(0, 0, 100, 80));
    const child = new LayoutInfo("item", "child", new Rect(0, 0, 100, 40));
    child.parentKey = "parent";

    const layout = new TestLayout([parent, child], new Size(100, 80));
    const virtualizer = new Virtualizer<Item, string>({
      layout,
      collection: createCollection([{ id: "parent" }, { id: "child" }]),
      delegate: {
        renderView: (_type, content) => content?.id ?? "",
        setVisibleRect: () => {},
        invalidate: () => {},
      },
    });

    virtualizer.render({
      layout,
      collection: createCollection([{ id: "parent" }, { id: "child" }]),
      persistedKeys: new Set(["child"]),
      visibleRect: new Rect(0, 0, 100, 80),
      invalidationContext: {},
      isScrolling: false,
    });

    expect(virtualizer.isPersistedKey("child")).toBe(true);
    expect(virtualizer.isPersistedKey("parent")).toBe(true);
    expect(virtualizer.isPersistedKey("other")).toBe(false);
  });

  it("clamps visible offsets when content is smaller than the requested rect", () => {
    const layout = new TestLayout(
      [new LayoutInfo("item", "a", new Rect(0, 0, 120, 80))],
      new Size(120, 80)
    );

    const setVisibleRect = vi.fn();
    const virtualizer = new Virtualizer<Item, string>({
      layout,
      collection: createCollection([{ id: "a" }]),
      delegate: {
        renderView: (_type, content) => content?.id ?? "",
        setVisibleRect,
        invalidate: () => {},
      },
    });

    virtualizer.render({
      layout,
      collection: createCollection([{ id: "a" }]),
      visibleRect: new Rect(50, 30, 100, 70),
      invalidationContext: {},
      isScrolling: false,
    });

    expect(setVisibleRect).toHaveBeenCalledWith(
      expect.objectContaining({
        x: 20,
        y: 10,
        width: 100,
        height: 70,
      })
    );
  });

  it("invalidates when layout item size changes", () => {
    const layout = new TestLayout(
      [new LayoutInfo("item", "a", new Rect(0, 0, 100, 40))],
      new Size(100, 40)
    );
    const updateItemSize = vi.fn(() => true);
    layout.updateItemSize = updateItemSize;

    const invalidate = vi.fn();
    const virtualizer = new Virtualizer<Item, string>({
      layout,
      collection: createCollection([{ id: "a" }]),
      delegate: {
        renderView: (_type, content) => content?.id ?? "",
        setVisibleRect: () => {},
        invalidate,
      },
    });

    virtualizer.updateItemSize("a", new Size(100, 50));

    expect(updateItemSize).toHaveBeenCalledWith("a", expect.any(Size));
    expect(invalidate).toHaveBeenCalledWith({ itemSizeChanged: true });
  });
});
