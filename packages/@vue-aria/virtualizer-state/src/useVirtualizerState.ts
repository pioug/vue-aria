import { computed, ref, shallowRef, toValue, watchPostEffect } from "vue";
import type { Key, MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { InvalidationContext, VirtualizerCollection } from "./types";
import { Layout } from "./Layout";
import { Rect } from "./Rect";
import type { ReusableView } from "./ReusableView";
import { Size } from "./Size";
import { Virtualizer } from "./Virtualizer";

export interface UseVirtualizerStateOptions<T extends object, V, O = unknown> {
  renderView: (type: string, content: T | null) => V;
  layout: MaybeReactive<Layout<T, O>>;
  collection: MaybeReactive<VirtualizerCollection<T>>;
  onVisibleRectChange?: (rect: Rect) => void;
  persistedKeys?: MaybeReactive<Set<Key> | null | undefined>;
  layoutOptions?: MaybeReactive<O | undefined>;
}

export interface UseVirtualizerStateResult<T extends object, V> {
  visibleViews: ReadonlyRef<ReusableView<T, V>[]>;
  setVisibleRect: (rect: Rect) => void;
  contentSize: ReadonlyRef<Size>;
  virtualizer: Virtualizer<T, V>;
  isScrolling: ReadonlyRef<boolean>;
  startScrolling: () => void;
  endScrolling: () => void;
}

export function useVirtualizerState<T extends object, V, O = unknown>(
  options: UseVirtualizerStateOptions<T, V, O>
): UseVirtualizerStateResult<T, V> {
  const visibleRect = ref(new Rect(0, 0, 0, 0));
  const isScrolling = ref(false);
  const invalidationContext = shallowRef<InvalidationContext<O>>({});
  const visibleRectChanged = ref(false);

  const virtualizer = new Virtualizer<T, V>({
    collection: toValue(options.collection),
    layout: toValue(options.layout),
    delegate: {
      setVisibleRect(rect) {
        visibleRect.value = rect;
        visibleRectChanged.value = true;
      },
      renderView: options.renderView,
      invalidate(context) {
        invalidationContext.value = context as InvalidationContext<O>;
      },
    },
  });

  watchPostEffect(() => {
    if (!visibleRectChanged.value) {
      return;
    }

    visibleRectChanged.value = false;
    options.onVisibleRectChange?.(visibleRect.value);
  });

  const mergedInvalidationContext = computed<InvalidationContext<O>>(() => {
    const context = invalidationContext.value;
    if (options.layoutOptions != null) {
      const layoutOptions = toValue(options.layoutOptions) as O | undefined;
      return {
        ...context,
        layoutOptions,
      };
    }

    return context;
  });

  const visibleViews = computed<ReusableView<T, V>[]>(() =>
    virtualizer.render<O>({
      layout: toValue(options.layout),
      collection: toValue(options.collection),
      persistedKeys:
        options.persistedKeys == null ? undefined : toValue(options.persistedKeys),
      layoutOptions:
        options.layoutOptions == null ? undefined : toValue(options.layoutOptions),
      visibleRect: visibleRect.value,
      invalidationContext: mergedInvalidationContext.value,
      isScrolling: isScrolling.value,
    })
  );

  const contentSize = computed<Size>(() => {
    void visibleViews.value;
    return virtualizer.contentSize;
  });

  const setVisibleRect = (rect: Rect): void => {
    visibleRect.value = rect;
  };

  const startScrolling = (): void => {
    isScrolling.value = true;
  };

  const endScrolling = (): void => {
    isScrolling.value = false;
  };

  return {
    virtualizer,
    visibleViews,
    setVisibleRect,
    contentSize,
    isScrolling,
    startScrolling,
    endScrolling,
  };
}
