import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import { Rect, Size } from "@vue-aria/virtualizer-state";
import { useScrollView } from "../src/useScrollView";

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

function createContainer(width = 120, height = 80): HTMLElement {
  const node = document.createElement("div");
  const testNode = node as HTMLElement & {
    __testClientWidth?: number;
    __testClientHeight?: number;
  };
  testNode.__testClientWidth = width;
  testNode.__testClientHeight = height;
  node.scrollLeft = 0;
  node.scrollTop = 0;
  return node;
}

describe("useScrollView", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("computes scroll and content props from content size", () => {
    const container = createContainer(100, 70);
    const scope = effectScope();
    const onVisibleRectChange = vi.fn();
    let api!: ReturnType<typeof useScrollView>;

    scope.run(() => {
      api = useScrollView(
        {
          contentSize: new Size(300, 200),
          onVisibleRectChange,
        },
        ref(container)
      );
    });

    api.updateSize();

    expect(onVisibleRectChange).toHaveBeenCalledWith(
      expect.objectContaining({ x: 0, y: 0, width: 100, height: 70 })
    );
    expect(api.scrollViewProps.value.style.overflow).toBe("auto");
    expect(api.contentProps.value.style.width).toBe(300);
    expect(api.contentProps.value.style.height).toBe(200);
    scope.stop();
  });

  it("emits scrolling lifecycle and visible rect updates on scroll", () => {
    vi.useFakeTimers();

    const container = createContainer(120, 90);
    const onVisibleRectChange = vi.fn();
    const onScrollStart = vi.fn();
    const onScrollEnd = vi.fn();

    const scope = effectScope();
    let api!: ReturnType<typeof useScrollView>;
    scope.run(() => {
      api = useScrollView(
        {
          contentSize: new Size(500, 400),
          onVisibleRectChange,
          onScrollStart,
          onScrollEnd,
        },
        ref(container)
      );
    });

    api.updateSize();

    container.scrollLeft = 40;
    container.scrollTop = 35;
    const scrollEvent = {
      target: container,
      currentTarget: container,
    } as unknown as Event;
    api.scrollViewProps.value.onScroll(scrollEvent);

    expect(onVisibleRectChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ x: 40, y: 35, width: 120, height: 90 })
    );
    expect(api.isScrolling.value).toBe(true);
    expect(onScrollStart).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(300);
    expect(api.isScrolling.value).toBe(false);
    expect(onScrollEnd).toHaveBeenCalledTimes(1);

    scope.stop();
    vi.useRealTimers();
  });

  it("supports horizontal and vertical overflow modes", () => {
    const horizontal = createContainer();
    const vertical = createContainer();

    const scope = effectScope();
    let horizontalApi!: ReturnType<typeof useScrollView>;
    let verticalApi!: ReturnType<typeof useScrollView>;

    scope.run(() => {
      horizontalApi = useScrollView(
        {
          contentSize: new Size(300, 100),
          scrollDirection: "horizontal",
          onVisibleRectChange: (_rect: Rect) => {},
        },
        ref(horizontal)
      );
      verticalApi = useScrollView(
        {
          contentSize: new Size(100, 300),
          scrollDirection: "vertical",
          onVisibleRectChange: (_rect: Rect) => {},
        },
        ref(vertical)
      );
    });

    expect(horizontalApi.scrollViewProps.value.style.overflowX).toBe("auto");
    expect(horizontalApi.scrollViewProps.value.style.overflowY).toBe("hidden");
    expect(verticalApi.scrollViewProps.value.style.overflowY).toBe("auto");
    expect(verticalApi.scrollViewProps.value.style.overflowX).toBe("hidden");

    scope.stop();
  });
});
