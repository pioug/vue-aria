import { onScopeDispose, toValue, watch } from "vue";
import type { MaybeReactive } from "@vue-types/shared";
import { getScrollParent } from "./getScrollParent";

export interface UseLoadMoreSentinelOptions<C = unknown> {
  collection: MaybeReactive<C>;
  onLoadMore?: () => void;
  scrollOffset?: MaybeReactive<number | undefined>;
}

export type LoadMoreSentinelProps<C = unknown> =
  UseLoadMoreSentinelOptions<C>;

function resolveScrollOffset(
  value: MaybeReactive<number | undefined> | undefined
): number {
  if (value === undefined) {
    return 1;
  }

  const offset = toValue(value);
  if (offset == null || Number.isNaN(offset)) {
    return 1;
  }

  return offset;
}

export function useLoadMoreSentinel<C = unknown>(
  options: UseLoadMoreSentinelOptions<C>,
  refElement: MaybeReactive<HTMLElement | null | undefined>
): void {
  let observer: IntersectionObserver | null = null;

  const disconnectObserver = (): void => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  watch(
    [
      () => toValue(options.collection),
      () => toValue(refElement),
      () => resolveScrollOffset(options.scrollOffset),
    ],
    ([_, element, scrollOffset]) => {
      disconnectObserver();
      if (!element || typeof IntersectionObserver === "undefined") {
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && options.onLoadMore) {
              options.onLoadMore();
            }
          }
        },
        {
          root: getScrollParent(element) as HTMLElement,
          rootMargin: `0px ${100 * scrollOffset}% ${100 * scrollOffset}% ${
            100 * scrollOffset
          }%`,
        }
      );
      observer.observe(element);
    },
    { immediate: true }
  );

  onScopeDispose(() => {
    disconnectObserver();
  });
}
