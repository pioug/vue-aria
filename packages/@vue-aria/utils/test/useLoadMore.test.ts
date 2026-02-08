import { describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import { useLoadMore } from "../src/useLoadMore";

function setDimension(
  element: HTMLElement,
  key: "scrollHeight" | "clientHeight",
  value: number
): void {
  Object.defineProperty(element, key, {
    configurable: true,
    get: () => value,
  });
}

function createScrollableElement(params: {
  scrollHeight: number;
  clientHeight: number;
  scrollTop?: number;
}): HTMLElement {
  const element = document.createElement("div");
  setDimension(element, "scrollHeight", params.scrollHeight);
  setDimension(element, "clientHeight", params.clientHeight);
  element.scrollTop = params.scrollTop ?? 0;
  return element;
}

describe("useLoadMore", () => {
  it("calls onLoadMore when scrolling near the bottom", () => {
    const onLoadMore = vi.fn();
    const element = createScrollableElement({
      scrollHeight: 600,
      clientHeight: 200,
      scrollTop: 350,
    });

    const scope = effectScope();
    scope.run(() => {
      useLoadMore(
        {
          onLoadMore,
          scrollOffset: 1,
        },
        ref(element)
      );
    });

    element.dispatchEvent(new Event("scroll"));
    element.dispatchEvent(new Event("scroll"));

    expect(onLoadMore).toHaveBeenCalledTimes(1);
    scope.stop();
  });

  it("resets loading lock when isLoading changes", async () => {
    const onLoadMore = vi.fn();
    const isLoading = ref(false);
    const element = createScrollableElement({
      scrollHeight: 600,
      clientHeight: 200,
      scrollTop: 350,
    });

    const scope = effectScope();
    scope.run(() => {
      useLoadMore(
        {
          onLoadMore,
          isLoading,
        },
        ref(element)
      );
    });

    element.dispatchEvent(new Event("scroll"));
    expect(onLoadMore).toHaveBeenCalledTimes(1);

    isLoading.value = true;
    await nextTick();
    isLoading.value = false;
    await nextTick();

    element.dispatchEvent(new Event("scroll"));
    expect(onLoadMore).toHaveBeenCalledTimes(2);
    scope.stop();
  });

  it("triggers load when items change and content does not overflow", async () => {
    const onLoadMore = vi.fn();
    const items = ref(["a"]);
    const element = createScrollableElement({
      scrollHeight: 200,
      clientHeight: 200,
      scrollTop: 0,
    });

    const scope = effectScope();
    scope.run(() => {
      useLoadMore(
        {
          onLoadMore,
          items,
        },
        ref(element)
      );
    });

    expect(onLoadMore).toHaveBeenCalledTimes(0);

    items.value = ["a", "b"];
    await nextTick();
    expect(onLoadMore).toHaveBeenCalledTimes(1);

    items.value = ["a", "b", "c"];
    await nextTick();
    expect(onLoadMore).toHaveBeenCalledTimes(1);

    scope.stop();
  });
});
