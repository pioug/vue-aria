import { describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { Layout } from "../src/Layout";
import { LayoutInfo } from "../src/LayoutInfo";
import { Rect } from "../src/Rect";
import { Size } from "../src/Size";
import { useVirtualizerState } from "../src/useVirtualizerState";
import type { Key } from "@vue-aria/types";

interface Item {
  id: string;
}

class StaticLayout extends Layout<Item> {
  private infos = new Map<Key, LayoutInfo>([
    ["a", new LayoutInfo("item", "a", new Rect(0, 0, 100, 40))],
  ]);

  getVisibleLayoutInfos(): LayoutInfo[] {
    return Array.from(this.infos.values());
  }

  getLayoutInfo(key: Key): LayoutInfo | null {
    return this.infos.get(key) ?? null;
  }

  getContentSize(): Size {
    return new Size(300, 120);
  }
}

describe("useVirtualizerState", () => {
  it("returns visible views and content size", () => {
    const item: Item = { id: "a" };
    const collection = {
      getItem: (key: Key) => (key === "a" ? item : null),
    };

    const state = useVirtualizerState({
      layout: new StaticLayout(),
      collection,
      renderView: (type, content) => ({ type, content }),
    });

    expect(state.visibleViews.value).toHaveLength(1);
    expect(state.visibleViews.value[0]?.layoutInfo?.key).toBe("a");
    expect(state.contentSize.value.width).toBe(300);
    expect(state.contentSize.value.height).toBe(120);
  });

  it("calls onVisibleRectChange when delegate updates visible rect", async () => {
    const onVisibleRectChange = vi.fn();
    const state = useVirtualizerState({
      layout: new StaticLayout(),
      collection: {
        getItem: (key: Key) => (key === "a" ? { id: "a" } : null),
      },
      renderView: (type, content) => ({ type, content }),
      onVisibleRectChange,
    });

    state.virtualizer.delegate.setVisibleRect(new Rect(10, 20, 150, 90));
    await nextTick();

    expect(onVisibleRectChange).toHaveBeenCalledWith(
      expect.objectContaining({
        x: 10,
        y: 20,
        width: 150,
        height: 90,
      })
    );
  });

  it("tracks scroll state", () => {
    const state = useVirtualizerState({
      layout: new StaticLayout(),
      collection: {
        getItem: () => ({ id: "a" }),
      },
      renderView: (type, content) => ({ type, content }),
    });

    expect(state.isScrolling.value).toBe(false);
    state.startScrolling();
    expect(state.isScrolling.value).toBe(true);
    state.endScrolling();
    expect(state.isScrolling.value).toBe(false);
  });
});
