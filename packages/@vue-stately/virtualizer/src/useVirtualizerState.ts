import { computed, ref, watch } from "vue";
import { type Collection, type InvalidationContext, type Key } from "./types";
import { Layout } from "./Layout";
import { Rect } from "./Rect";
import { ReusableView } from "./ReusableView";
import { Size } from "./Size";
import { Virtualizer } from "./Virtualizer";

export interface VirtualizerProps<T extends object, V, O> {
  renderView(type: string, content: T | null): V;
  layout: Layout<T>;
  collection: Collection<T>;
  onVisibleRectChange(rect: Rect): void;
  persistedKeys?: Set<Key> | null;
  layoutOptions?: O;
}

export interface VirtualizerState<T extends object, V> {
  visibleViews: ReusableView<T, V>[];
  setVisibleRect: (rect: Rect) => void;
  contentSize: Size;
  virtualizer: Virtualizer<T, V>;
  isScrolling: boolean;
  startScrolling: () => void;
  endScrolling: () => void;
}

export function useVirtualizerState<T extends object, V, O = any>(
  opts: VirtualizerProps<T, V, O>
): VirtualizerState<T, V> {
  const visibleRect = ref(new Rect(0, 0, 0, 0));
  const isScrolling = ref(false);
  const invalidationContext = ref<InvalidationContext>({});
  const visibleRectChanged = ref(false);

  const setInvalidationContext = (ctx: InvalidationContext) => {
    invalidationContext.value = ctx;
  };

  const virtualizer = new Virtualizer<T, V>({
    collection: opts.collection,
    layout: opts.layout,
    delegate: {
      setVisibleRect(rect) {
        visibleRect.value = rect;
        visibleRectChanged.value = true;
      },
      renderView: opts.renderView,
      invalidate: setInvalidationContext,
    },
  });

  const setVisibleRect = (rect: Rect): void => {
    visibleRect.value = rect;
    visibleRectChanged.value = true;
  };

  const mergedInvalidationContext = computed(() => {
    if (opts.layoutOptions != null) {
      return {
        ...invalidationContext.value,
        layoutOptions: opts.layoutOptions,
      };
    }
    return invalidationContext.value;
  });

  const visibleViews = computed(() =>
    virtualizer.render({
      layout: opts.layout,
      collection: opts.collection,
      persistedKeys: opts.persistedKeys,
      layoutOptions: opts.layoutOptions,
      visibleRect: visibleRect.value,
      invalidationContext: mergedInvalidationContext.value,
      isScrolling: isScrolling.value,
    })
  );

  watch(
    visibleRect,
    (rect) => {
      if (!visibleRectChanged.value) {
        return;
      }

      visibleRectChanged.value = false;
      opts.onVisibleRectChange(rect);
    },
    { deep: true }
  );

  const startScrolling = () => {
    isScrolling.value = true;
  };
  const endScrolling = () => {
    isScrolling.value = false;
  };

  return {
    virtualizer,
    get visibleViews() {
      return visibleViews.value;
    },
    setVisibleRect,
    get contentSize() {
      return virtualizer.contentSize;
    },
    get isScrolling() {
      return isScrolling.value;
    },
    startScrolling,
    endScrolling,
  };
}
