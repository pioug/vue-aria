import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import type { Key } from "@vue-aria/types";
import { Layout, LayoutInfo, Rect, Size } from "@vue-aria/virtualizer-state";
import { useVirtualizer } from "../src/useVirtualizer";

interface Item {
  id: string;
}

class NestedLayout extends Layout<Item> {
  private infos = new Map<Key, LayoutInfo>();

  constructor() {
    super();
    const section = new LayoutInfo("section", "section-1", new Rect(0, 0, 300, 120));
    const item = new LayoutInfo("item", "item-a", new Rect(0, 0, 300, 40));
    item.parentKey = section.key;

    this.infos.set(section.key, section);
    this.infos.set(item.key, item);
  }

  getVisibleLayoutInfos(): LayoutInfo[] {
    return Array.from(this.infos.values());
  }

  getLayoutInfo(key: Key): LayoutInfo | null {
    return this.infos.get(key) ?? null;
  }

  getContentSize(): Size {
    return new Size(600, 500);
  }
}

let originalClientWidth: PropertyDescriptor | undefined;
let originalClientHeight: PropertyDescriptor | undefined;

beforeAll(() => {
  originalClientWidth = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "clientWidth"
  );
  originalClientHeight = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "clientHeight"
  );

  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get() {
      return (this as HTMLElement & { __testClientWidth?: number }).__testClientWidth ?? 0;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    get() {
      return (
        (this as HTMLElement & { __testClientHeight?: number }).__testClientHeight ?? 0
      );
    },
  });
});

afterAll(() => {
  if (originalClientWidth) {
    Object.defineProperty(HTMLElement.prototype, "clientWidth", originalClientWidth);
  }
  if (originalClientHeight) {
    Object.defineProperty(HTMLElement.prototype, "clientHeight", originalClientHeight);
  }
});

function createContainer({
  clientWidth = 200,
  clientHeight = 120,
  scrollHeight = 600,
  scrollTop = 0,
}: {
  clientWidth?: number;
  clientHeight?: number;
  scrollHeight?: number;
  scrollTop?: number;
} = {}): HTMLElement {
  const container = document.createElement("div");
  const testNode = container as HTMLElement & {
    __testClientWidth?: number;
    __testClientHeight?: number;
  };
  testNode.__testClientWidth = clientWidth;
  testNode.__testClientHeight = clientHeight;
  Object.defineProperty(container, "scrollHeight", {
    configurable: true,
    get: () => scrollHeight,
  });
  container.scrollTop = scrollTop;
  container.scrollLeft = 0;
  return container;
}

describe("useVirtualizer", () => {
  it("composes virtualizer state, scroll props, and rendered tree output", () => {
    const layout = new NestedLayout();
    const collection = {
      getItem: (key: Key): Item | null => {
        if (key === "item-a") {
          return { id: "Alpha" };
        }
        return null;
      },
    };
    const container = createContainer();

    const scope = effectScope();
    let api!: ReturnType<typeof useVirtualizer<Item, { type: string; id: string | null }>>;

    scope.run(() => {
      api = useVirtualizer({
        layout,
        collection,
        renderView: (type, content) => ({
          type,
          id: content?.id ?? null,
        }),
        scrollRef: ref(container),
      });
    });

    api.updateSize();

    expect(api.scrollViewProps.value.role).toBe("presentation");
    expect(api.contentProps.value.role).toBe("presentation");
    expect(api.renderedViews.value).toHaveLength(1);
    expect(api.renderedViews.value[0]?.layoutInfo.key).toBe("section-1");
    expect(api.renderedViews.value[0]?.children).toHaveLength(1);
    expect(api.renderedViews.value[0]?.children[0]?.layoutInfo.key).toBe("item-a");
    expect(api.renderedViews.value[0]?.children[0]?.rendered).toEqual({
      type: "item",
      id: "Alpha",
    });

    scope.stop();
  });

  it("supports custom render wrappers", () => {
    const container = createContainer();

    const scope = effectScope();
    let api!: ReturnType<typeof useVirtualizer<Item, string, string>>;
    scope.run(() => {
      api = useVirtualizer<Item, string, string>({
        layout: new NestedLayout(),
        collection: {
          getItem: (key: Key) => (key === "item-a" ? { id: "Alpha" } : null),
        },
        renderView: (type, content) => `${type}:${content?.id ?? "none"}`,
        scrollRef: ref(container),
        renderWrapper: (parent, view, children, renderChildren) => {
          const renderedChildren = renderChildren(children).join("|");
          return `${parent?.layoutInfo?.key ?? "root"}>${
            view.layoutInfo?.key ?? "unknown"
          }[${renderedChildren}]`;
        },
      });
    });

    expect(api.renderedViews.value).toEqual([
      "root>section-1[section-1>item-a[]]",
    ]);

    scope.stop();
  });

  it("syncs delegated visible rect changes back to scroll position", async () => {
    const container = createContainer();
    const scope = effectScope();
    let api!: ReturnType<typeof useVirtualizer<Item, string>>;

    scope.run(() => {
      api = useVirtualizer({
        layout: new NestedLayout(),
        collection: {
          getItem: (key: Key) => (key === "item-a" ? { id: "Alpha" } : null),
        },
        renderView: (type, content) => `${type}:${content?.id ?? "none"}`,
        scrollRef: ref(container),
      });
    });

    api.state.virtualizer.delegate.setVisibleRect(new Rect(25, 30, 180, 90));
    await nextTick();

    expect(container.scrollLeft).toBe(25);
    expect(container.scrollTop).toBe(30);
    scope.stop();
  });

  it("integrates load more behavior against the same scroll ref", () => {
    const onLoadMore = vi.fn();
    const container = createContainer({
      clientHeight: 200,
      scrollHeight: 600,
      scrollTop: 350,
    });

    const scope = effectScope();
    scope.run(() => {
      useVirtualizer({
        layout: new NestedLayout(),
        collection: {
          getItem: (key: Key) => (key === "item-a" ? { id: "Alpha" } : null),
        },
        renderView: (type, content) => `${type}:${content?.id ?? "none"}`,
        scrollRef: ref(container),
        onLoadMore,
        scrollOffset: 1,
      });
    });

    container.dispatchEvent(new Event("scroll"));
    container.dispatchEvent(new Event("scroll"));

    expect(onLoadMore).toHaveBeenCalledTimes(1);
    scope.stop();
  });
});
