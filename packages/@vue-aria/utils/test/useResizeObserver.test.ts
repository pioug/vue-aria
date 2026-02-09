import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import { useResizeObserver } from "../src/useResizeObserver";

interface MockResizeObserverInstance {
  callback: ResizeObserverCallback;
  observe: ReturnType<typeof vi.fn>;
  unobserve: ReturnType<typeof vi.fn>;
  trigger: (entries: Partial<ResizeObserverEntry>[]) => void;
}

function mockResizeObserver() {
  const original = globalThis.ResizeObserver;
  const instances: MockResizeObserverInstance[] = [];

  class MockResizeObserver {
    callback: ResizeObserverCallback;
    observe = vi.fn();
    unobserve = vi.fn();

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
      instances.push(this as unknown as MockResizeObserverInstance);
    }

    trigger(entries: Partial<ResizeObserverEntry>[]): void {
      this.callback(entries as ResizeObserverEntry[], this as never);
    }
  }

  globalThis.ResizeObserver =
    MockResizeObserver as unknown as typeof ResizeObserver;

  return {
    instances,
    restore() {
      globalThis.ResizeObserver = original;
    },
  };
}

describe("useResizeObserver", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("observes the element and calls onResize for non-empty entries", () => {
    const resizeObserver = mockResizeObserver();
    const onResize = vi.fn();
    const element = document.createElement("div");
    const elementRef = ref(element);

    const scope = effectScope();
    scope.run(() => {
      useResizeObserver({
        ref: elementRef,
        box: "border-box",
        onResize,
      });
    });

    expect(resizeObserver.instances).toHaveLength(1);
    expect(resizeObserver.instances[0]?.observe).toHaveBeenCalledWith(element, {
      box: "border-box",
    });

    resizeObserver.instances[0]?.trigger([]);
    expect(onResize).not.toHaveBeenCalled();

    resizeObserver.instances[0]?.trigger([{ target: element }]);
    expect(onResize).toHaveBeenCalledTimes(1);

    scope.stop();
    expect(resizeObserver.instances[0]?.unobserve).toHaveBeenCalledWith(element);
    resizeObserver.restore();
  });

  it("recreates the observer when the observed element changes", async () => {
    const resizeObserver = mockResizeObserver();
    const first = document.createElement("div");
    const second = document.createElement("div");
    const elementRef = ref<HTMLElement | null>(first);

    const scope = effectScope();
    scope.run(() => {
      useResizeObserver({
        ref: elementRef,
        onResize: () => {},
      });
    });

    expect(resizeObserver.instances).toHaveLength(1);
    const firstObserver = resizeObserver.instances[0];

    elementRef.value = second;
    await nextTick();

    expect(resizeObserver.instances).toHaveLength(2);
    expect(firstObserver?.unobserve).toHaveBeenCalledWith(first);
    expect(resizeObserver.instances[1]?.observe).toHaveBeenCalledWith(second, {
      box: undefined,
    });

    scope.stop();
    expect(resizeObserver.instances[1]?.unobserve).toHaveBeenCalledWith(second);
    resizeObserver.restore();
  });

  it("falls back to window resize events when ResizeObserver is unavailable", () => {
    vi.stubGlobal("ResizeObserver", undefined);
    const onResize = vi.fn();
    const addEventListener = vi.spyOn(window, "addEventListener");
    const removeEventListener = vi.spyOn(window, "removeEventListener");
    const element = document.createElement("div");
    const elementRef = ref(element);

    const scope = effectScope();
    scope.run(() => {
      useResizeObserver({
        ref: elementRef,
        onResize,
      });
    });

    expect(addEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
      false
    );

    window.dispatchEvent(new Event("resize"));
    expect(onResize).toHaveBeenCalledTimes(1);

    scope.stop();

    expect(removeEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
      false
    );
  });
});
