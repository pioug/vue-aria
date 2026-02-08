import { computed, onScopeDispose, ref, toValue, watch } from "vue";
import type { CSSProperties } from "vue";
import { useLocale } from "@vue-aria/i18n";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import { Rect, Size } from "@vue-aria/virtualizer-state";
import { getScrollLeft } from "./utils";

export type ScrollDirection = "horizontal" | "vertical" | "both";

export interface UseScrollViewOptions {
  contentSize: MaybeReactive<Size>;
  onVisibleRectChange: (rect: Rect) => void;
  innerStyle?: MaybeReactive<CSSProperties | undefined>;
  onScrollStart?: () => void;
  onScrollEnd?: () => void;
  scrollDirection?: MaybeReactive<ScrollDirection | undefined>;
  onScroll?: (event: Event) => void;
  style?: MaybeReactive<CSSProperties | undefined>;
}

export interface UseScrollViewResult {
  isScrolling: ReadonlyRef<boolean>;
  scrollViewProps: ReadonlyRef<{
    role: "presentation";
    onScroll: (event: Event) => void;
    style: CSSProperties;
  }>;
  contentProps: ReadonlyRef<{
    role: "presentation";
    style: CSSProperties;
  }>;
  updateSize: () => void;
}

interface InternalState {
  scrollTop: number;
  scrollLeft: number;
  scrollEndTime: number;
  scrollTimeout: ReturnType<typeof setTimeout> | null;
  width: number;
  height: number;
  isScrolling: boolean;
}

function createScrollState(): InternalState {
  return {
    scrollTop: 0,
    scrollLeft: 0,
    scrollEndTime: 0,
    scrollTimeout: null,
    width: 0,
    height: 0,
    isScrolling: false,
  };
}

export function useScrollView(
  options: UseScrollViewOptions,
  scrollRef: MaybeReactive<HTMLElement | null | undefined>
): UseScrollViewResult {
  const state = createScrollState();
  const isScrolling = ref(false);
  const locale = useLocale();
  const isUpdatingSize = ref(false);
  const lastContentSize = ref<Size | null>(null);

  const onScroll = (event: Event): void => {
    const target = event.currentTarget as HTMLElement | null;
    if (!target || target !== event.target) {
      return;
    }

    options.onScroll?.(event);

    const contentSize = toValue(options.contentSize);
    const scrollTop = target.scrollTop;
    const scrollLeft = getScrollLeft(target, locale.value.direction);

    state.scrollTop = Math.max(
      0,
      Math.min(scrollTop, contentSize.height - state.height)
    );
    state.scrollLeft = Math.max(
      0,
      Math.min(scrollLeft, contentSize.width - state.width)
    );
    options.onVisibleRectChange(
      new Rect(state.scrollLeft, state.scrollTop, state.width, state.height)
    );

    if (!state.isScrolling) {
      state.isScrolling = true;
      isScrolling.value = true;
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("tk.disconnect-observer"));
      }
      options.onScrollStart?.();
    }

    const now = Date.now();
    if (state.scrollEndTime <= now + 50) {
      state.scrollEndTime = now + 300;
      if (state.scrollTimeout != null) {
        clearTimeout(state.scrollTimeout);
      }

      state.scrollTimeout = setTimeout(() => {
        state.isScrolling = false;
        isScrolling.value = false;
        state.scrollTimeout = null;

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("tk.connect-observer"));
        }
        options.onScrollEnd?.();
      }, 300);
    }
  };

  const updateSize = (): void => {
    const dom = toValue(scrollRef);
    if (!dom || isUpdatingSize.value) {
      return;
    }

    isUpdatingSize.value = true;
    const isTestEnv = process.env.NODE_ENV === "test" && !process.env.VIRT_ON;
    const hasHTMLElement = typeof HTMLElement !== "undefined";
    const isClientWidthMocked =
      hasHTMLElement &&
      Object.getOwnPropertyNames(HTMLElement.prototype).includes("clientWidth");
    const isClientHeightMocked =
      hasHTMLElement &&
      Object.getOwnPropertyNames(HTMLElement.prototype).includes("clientHeight");

    const clientWidth = dom.clientWidth;
    const clientHeight = dom.clientHeight;
    const width = isTestEnv && !isClientWidthMocked ? Infinity : clientWidth;
    const height = isTestEnv && !isClientHeightMocked ? Infinity : clientHeight;

    if (state.width !== width || state.height !== height) {
      state.width = width;
      state.height = height;
      options.onVisibleRectChange(
        new Rect(state.scrollLeft, state.scrollTop, width, height)
      );

      if (
        (!isTestEnv && clientWidth !== dom.clientWidth) ||
        clientHeight !== dom.clientHeight
      ) {
        state.width = dom.clientWidth;
        state.height = dom.clientHeight;
        options.onVisibleRectChange(
          new Rect(state.scrollLeft, state.scrollTop, state.width, state.height)
        );
      }
    }

    isUpdatingSize.value = false;
  };

  watch(
    () => toValue(options.contentSize),
    (contentSize) => {
      if (
        !isUpdatingSize.value &&
        (lastContentSize.value == null || !contentSize.equals(lastContentSize.value))
      ) {
        queueMicrotask(updateSize);
      }
      lastContentSize.value = contentSize;
    },
    { immediate: true }
  );

  watch(
    () => toValue(scrollRef),
    (dom, _, onCleanup) => {
      if (!dom || typeof ResizeObserver === "undefined") {
        return;
      }

      const observer = new ResizeObserver(() => {
        updateSize();
      });
      observer.observe(dom);
      onCleanup(() => {
        observer.disconnect();
      });
    },
    { immediate: true }
  );

  onScopeDispose(() => {
    if (state.scrollTimeout != null) {
      clearTimeout(state.scrollTimeout);
    }

    if (state.isScrolling && typeof window !== "undefined") {
      window.dispatchEvent(new Event("tk.connect-observer"));
    }
  });

  const scrollViewProps = computed(() => {
    const contentSize = toValue(options.contentSize);
    const scrollDirection = toValue(options.scrollDirection) ?? "both";
    const style: CSSProperties = {
      padding: 0,
      ...(toValue(options.style) ?? {}),
    };

    if (scrollDirection === "horizontal") {
      style.overflowX = "auto";
      style.overflowY = "hidden";
    } else if (scrollDirection === "vertical" || contentSize.width === state.width) {
      style.overflowY = "auto";
      style.overflowX = "hidden";
    } else {
      style.overflow = "auto";
    }

    return {
      role: "presentation" as const,
      onScroll,
      style,
    };
  });

  const contentProps = computed(() => {
    const contentSize = toValue(options.contentSize);
    const style: CSSProperties = {
      width: Number.isFinite(contentSize.width) ? contentSize.width : undefined,
      height: Number.isFinite(contentSize.height) ? contentSize.height : undefined,
      pointerEvents: isScrolling.value ? "none" : "auto",
      position: "relative",
      ...(toValue(options.innerStyle) ?? {}),
    };

    return {
      role: "presentation" as const,
      style,
    };
  });

  return {
    isScrolling,
    scrollViewProps,
    contentProps,
    updateSize,
  };
}
