import { describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import { LayoutInfo, Rect } from "@vue-aria/virtualizer-state";
import { useVirtualizerItem } from "../src/useVirtualizerItem";

describe("useVirtualizerItem", () => {
  it("measures item size and forwards it to virtualizer", () => {
    const item = new LayoutInfo("item", "a", new Rect(0, 0, 120, 40));
    const node = document.createElement("div");
    node.style.height = "24px";

    Object.defineProperty(node, "scrollWidth", {
      configurable: true,
      value: 180,
    });
    Object.defineProperty(node, "scrollHeight", {
      configurable: true,
      value: 72,
    });

    const virtualizer = {
      updateItemSize: vi.fn(),
    };

    const scope = effectScope();
    let api!: ReturnType<typeof useVirtualizerItem>;
    scope.run(() => {
      api = useVirtualizerItem({
        layoutInfo: item,
        virtualizer,
        ref: ref(node),
      });
    });

    api.updateSize();

    expect(virtualizer.updateItemSize).toHaveBeenCalledWith(
      "a",
      expect.objectContaining({ width: 180, height: 72 })
    );
    expect(node.style.height).toBe("24px");
    scope.stop();
  });

  it("does not update size when there is no layout key or node", () => {
    const virtualizer = {
      updateItemSize: vi.fn(),
    };

    const scope = effectScope();
    let api!: ReturnType<typeof useVirtualizerItem>;
    scope.run(() => {
      api = useVirtualizerItem({
        layoutInfo: null,
        virtualizer,
        ref: ref(null),
      });
    });

    api.updateSize();
    expect(virtualizer.updateItemSize).not.toHaveBeenCalled();
    scope.stop();
  });

  it("automatically updates estimated items after render", async () => {
    const item = new LayoutInfo("item", "a", new Rect(0, 0, 100, 30));
    item.estimatedSize = true;

    const node = document.createElement("div");
    Object.defineProperty(node, "scrollWidth", {
      configurable: true,
      value: 160,
    });
    Object.defineProperty(node, "scrollHeight", {
      configurable: true,
      value: 54,
    });

    const virtualizer = {
      updateItemSize: vi.fn(),
    };

    const scope = effectScope();
    scope.run(() => {
      useVirtualizerItem({
        layoutInfo: ref(item),
        virtualizer,
        ref: ref(node),
      });
    });

    await nextTick();

    expect(virtualizer.updateItemSize).toHaveBeenCalledWith(
      "a",
      expect.objectContaining({ width: 160, height: 54 })
    );
    scope.stop();
  });
});
