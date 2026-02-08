import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  defineComponent,
  h,
  nextTick,
  type VNodeChild,
} from "vue";
import { render } from "@testing-library/vue";
import type { Key } from "@vue-aria/types";
import { Layout, LayoutInfo, Rect, Size } from "@vue-aria/virtualizer-state";
import { Virtualizer } from "../src/Virtualizer";

interface Item {
  id: string;
}

class SingleItemLayout extends Layout<Item> {
  private info = new LayoutInfo("item", "a", new Rect(0, 0, 300, 40));

  getVisibleLayoutInfos(): LayoutInfo[] {
    return [this.info];
  }

  getLayoutInfo(key: Key): LayoutInfo | null {
    return key === this.info.key ? this.info : null;
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

describe("Virtualizer component", () => {
  it("renders items from the default slot", () => {
    const layout = new SingleItemLayout();
    const Host = defineComponent({
      setup() {
        return () =>
          h(
            Virtualizer,
            {
              layout,
              collection: {
                getItem: (key: Key) => (key === "a" ? { id: "Alpha" } : null),
              },
            },
            {
              default: ({ type, content }: { type: string; content: Item | null }) =>
                h("span", { "data-testid": "cell" }, `${type}:${content?.id ?? "none"}`),
            }
          );
      },
    });

    const { getByTestId } = render(Host);
    expect(getByTestId("cell").textContent).toBe("item:Alpha");
  });

  it("triggers load more when scrolling near the bottom", async () => {
    const onLoadMore = vi.fn();
    const layout = new SingleItemLayout();

    const Host = defineComponent({
      setup() {
        return () =>
          h(
            Virtualizer,
            {
              layout,
              collection: {
                getItem: (key: Key) => (key === "a" ? { id: "Alpha" } : null),
              },
              onLoadMore,
              scrollOffset: 1,
            },
            {
              default: ({ type, content }: { type: string; content: Item | null }) =>
                h("span", `${type}:${content?.id ?? "none"}`),
            }
          );
      },
    });

    const { getAllByRole } = render(Host);
    const outer = getAllByRole("presentation")[0] as HTMLElement;
    const testOuter = outer as HTMLElement & {
      __testClientWidth?: number;
      __testClientHeight?: number;
    };
    testOuter.__testClientWidth = 300;
    testOuter.__testClientHeight = 200;
    Object.defineProperty(outer, "scrollHeight", {
      configurable: true,
      get: () => 600,
    });
    outer.scrollTop = 350;
    await nextTick();

    outer.dispatchEvent(new Event("scroll"));
    outer.dispatchEvent(new Event("scroll"));
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("supports custom render wrappers", () => {
    const layout = new SingleItemLayout();
    const Host = defineComponent({
      setup() {
        return () =>
          h(
            Virtualizer,
            {
              layout,
              collection: {
                getItem: (key: Key) => (key === "a" ? { id: "Alpha" } : null),
              },
              renderWrapper: (
                _parent,
                reusableView,
                children,
                renderChildren
              ): VNodeChild =>
                h(
                  "div",
                  { "data-testid": "wrapped" },
                  [reusableView.rendered?.() ?? null, ...renderChildren(children)]
                ),
            },
            {
              default: ({ type, content }: { type: string; content: Item | null }) =>
                h("span", `${type}:${content?.id ?? "none"}`),
            }
          );
      },
    });

    const { getByTestId } = render(Host);
    expect(getByTestId("wrapped").textContent).toContain("item:Alpha");
  });
});
