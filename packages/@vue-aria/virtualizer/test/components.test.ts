import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { render } from "@testing-library/vue";
import { LayoutInfo, Rect, Size } from "@vue-aria/virtualizer-state";
import { ScrollView } from "../src/ScrollView";
import { VirtualizerItem } from "../src/VirtualizerItem";

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

describe("virtualizer components", () => {
  it("renders VirtualizerItem with layout style and size updates", async () => {
    const layoutInfo = new LayoutInfo("item", "item-a", new Rect(10, 20, 120, 40));
    layoutInfo.estimatedSize = true;
    const virtualizer = {
      updateItemSize: vi.fn(),
    };

    const { getByRole } = render(VirtualizerItem, {
      props: {
        layoutInfo,
        virtualizer,
      },
      slots: {
        default: "Item content",
      },
    });

    await nextTick();

    const item = getByRole("presentation");
    expect(item.textContent).toContain("Item content");
    expect(item.style.position).toBe("absolute");
    expect(virtualizer.updateItemSize).toHaveBeenCalledWith(
      "item-a",
      expect.objectContaining({ width: 0, height: 0 })
    );
  });

  it("renders ScrollView and forwards scrolling callbacks", async () => {
    vi.useFakeTimers();

    const onVisibleRectChange = vi.fn();
    const onScrollStart = vi.fn();
    const onScrollEnd = vi.fn();

    const { getAllByRole } = render(ScrollView, {
      props: {
        contentSize: new Size(400, 300),
        onVisibleRectChange,
        onScrollStart,
        onScrollEnd,
      },
      slots: {
        default: "Virtualized content",
      },
    });

    const [outer, inner] = getAllByRole("presentation") as HTMLElement[];
    const testOuter = outer as HTMLElement & {
      __testClientWidth?: number;
      __testClientHeight?: number;
    };
    testOuter.__testClientWidth = 120;
    testOuter.__testClientHeight = 90;

    await nextTick();

    outer.scrollLeft = 30;
    outer.scrollTop = 25;
    outer.dispatchEvent(new Event("scroll"));

    expect(inner.textContent).toContain("Virtualized content");
    expect(onVisibleRectChange).toHaveBeenCalled();
    expect(onScrollStart).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(300);
    expect(onScrollEnd).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
