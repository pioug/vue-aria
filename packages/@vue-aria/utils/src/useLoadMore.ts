import { onScopeDispose, ref, toValue, watch, watchEffect } from "vue";
import type { MaybeReactive } from "@vue-types/shared";

export interface UseLoadMoreOptions<I = unknown> {
  isLoading?: MaybeReactive<boolean | undefined>;
  onLoadMore?: () => void;
  scrollOffset?: MaybeReactive<number | undefined>;
  items?: MaybeReactive<I>;
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

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

export function useLoadMore<I = unknown>(
  options: UseLoadMoreOptions<I>,
  refElement: MaybeReactive<HTMLElement | null | undefined>
): void {
  const isLoadingRef = ref(resolveBoolean(options.isLoading));
  const lastItems = ref(
    options.items === undefined ? undefined : toValue(options.items)
  );
  const currentElement = ref<HTMLElement | null>(null);
  const scrollHandler = ref<((event: Event) => void) | null>(null);

  watch(
    () => (options.isLoading === undefined ? undefined : toValue(options.isLoading)),
    (isLoading) => {
      if (isLoading !== undefined) {
        isLoadingRef.value = Boolean(isLoading);
      }
    },
    { immediate: true }
  );

  const onScroll = (): void => {
    const element = toValue(refElement);
    if (!element || isLoadingRef.value || !options.onLoadMore) {
      return;
    }

    const scrollOffset = resolveScrollOffset(options.scrollOffset);
    const shouldLoadMore =
      element.scrollHeight - element.scrollTop - element.clientHeight <
      element.clientHeight * scrollOffset;
    if (!shouldLoadMore) {
      return;
    }

    isLoadingRef.value = true;
    options.onLoadMore();
  };

  watch(
    () => toValue(refElement),
    (element) => {
      if (currentElement.value && scrollHandler.value) {
        currentElement.value.removeEventListener("scroll", scrollHandler.value);
      }

      currentElement.value = element ?? null;
      if (!element) {
        scrollHandler.value = null;
        return;
      }

      const handler = (_event: Event) => {
        onScroll();
      };
      scrollHandler.value = handler;
      element.addEventListener("scroll", handler);
    },
    { immediate: true }
  );

  watchEffect(() => {
    const element = toValue(refElement);
    const onLoadMore = options.onLoadMore;
    const items = options.items === undefined ? undefined : toValue(options.items);
    if (!element || isLoadingRef.value || !onLoadMore) {
      lastItems.value = items;
      return;
    }

    const shouldLoadMore =
      (items === undefined || items !== lastItems.value) &&
      element.clientHeight === element.scrollHeight;
    if (shouldLoadMore) {
      isLoadingRef.value = true;
      onLoadMore();
    }

    lastItems.value = items;
  });

  onScopeDispose(() => {
    if (currentElement.value && scrollHandler.value) {
      currentElement.value.removeEventListener("scroll", scrollHandler.value);
    }
    currentElement.value = null;
    scrollHandler.value = null;
  });
}
