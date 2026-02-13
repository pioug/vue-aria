import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import { getScrollParent } from "../src/getScrollParent";
import { isScrollable } from "../src/isScrollable";
import { useLoadMoreSentinel } from "../src/useLoadMoreSentinel";

interface MockObserverInstance {
  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  trigger: (entries: Partial<IntersectionObserverEntry>[]) => void;
}

function mockIntersectionObserver() {
  const original = globalThis.IntersectionObserver;
  const instances: MockObserverInstance[] = [];

  class MockIntersectionObserver {
    callback: IntersectionObserverCallback;
    options?: IntersectionObserverInit;
    observe = vi.fn();
    disconnect = vi.fn();

    constructor(
      callback: IntersectionObserverCallback,
      options?: IntersectionObserverInit
    ) {
      this.callback = callback;
      this.options = options;
      instances.push(this as unknown as MockObserverInstance);
    }

    trigger(entries: Partial<IntersectionObserverEntry>[]): void {
      this.callback(entries as IntersectionObserverEntry[], this as never);
    }
  }

  globalThis.IntersectionObserver =
    MockIntersectionObserver as unknown as typeof IntersectionObserver;

  return {
    instances,
    restore() {
      globalThis.IntersectionObserver = original;
    },
  };
}

function setHeightMetrics(
  element: HTMLElement,
  scrollHeight: number,
  clientHeight: number
): void {
  Object.defineProperty(element, "scrollHeight", {
    configurable: true,
    get: () => scrollHeight,
  });
  Object.defineProperty(element, "clientHeight", {
    configurable: true,
    get: () => clientHeight,
  });
}

describe("load more sentinel + scroll helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("observes sentinel in scroll parent and triggers on intersecting entries", () => {
    const io = mockIntersectionObserver();
    const onLoadMore = vi.fn();

    const scrollParent = document.createElement("div");
    scrollParent.style.overflow = "auto";
    const sentinel = document.createElement("div");
    scrollParent.appendChild(sentinel);
    document.body.appendChild(scrollParent);

    const scope = effectScope();
    scope.run(() => {
      useLoadMoreSentinel(
        {
          collection: [],
          onLoadMore,
          scrollOffset: 1,
        },
        ref(sentinel)
      );
    });

    expect(io.instances).toHaveLength(1);
    expect(io.instances[0]?.options?.root).toBe(scrollParent);
    expect(io.instances[0]?.options?.rootMargin).toBe("0px 100% 100% 100%");
    expect(io.instances[0]?.observe).toHaveBeenCalledWith(sentinel);

    io.instances[0]?.trigger([{ isIntersecting: false }]);
    io.instances[0]?.trigger([{ isIntersecting: true }]);
    expect(onLoadMore).toHaveBeenCalledTimes(1);

    scope.stop();
    io.restore();
  });

  it("recreates observer when collection changes", async () => {
    const io = mockIntersectionObserver();

    const scrollParent = document.createElement("div");
    scrollParent.style.overflow = "auto";
    const sentinel = document.createElement("div");
    scrollParent.appendChild(sentinel);
    document.body.appendChild(scrollParent);

    const collection = ref(["a"]);
    const scope = effectScope();
    scope.run(() => {
      useLoadMoreSentinel(
        {
          collection,
          onLoadMore: () => {},
        },
        ref(sentinel)
      );
    });

    expect(io.instances).toHaveLength(1);
    const first = io.instances[0];

    collection.value = ["a", "b"];
    await nextTick();

    expect(io.instances).toHaveLength(2);
    expect(first?.disconnect).toHaveBeenCalledTimes(1);
    expect(io.instances[1]?.observe).toHaveBeenCalledWith(sentinel);

    scope.stop();
    io.restore();
  });

  it("provides scrollability and scroll-parent helpers", () => {
    const scrollParent = document.createElement("div");
    scrollParent.style.overflow = "auto";
    setHeightMetrics(scrollParent, 200, 200);

    const child = document.createElement("div");
    scrollParent.appendChild(child);
    document.body.appendChild(scrollParent);

    expect(isScrollable(scrollParent)).toBe(true);
    expect(isScrollable(scrollParent, true)).toBe(false);

    setHeightMetrics(scrollParent, 300, 200);
    expect(isScrollable(scrollParent, true)).toBe(true);
    expect(getScrollParent(child)).toBe(scrollParent);

    const plainParent = document.createElement("div");
    const loneChild = document.createElement("div");
    plainParent.appendChild(loneChild);
    document.body.appendChild(plainParent);

    expect(getScrollParent(loneChild)).toBe(
      document.scrollingElement ?? document.documentElement
    );
  });
});
