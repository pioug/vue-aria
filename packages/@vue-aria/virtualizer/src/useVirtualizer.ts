import { computed, toValue } from "vue";
import type { CSSProperties } from "vue";
import { useLoadMore, mergeProps } from "@vue-aria/utils";
import type { Key, MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type {
  LayoutInfo,
  ReusableView,
  Size,
  UseVirtualizerStateOptions,
  UseVirtualizerStateResult,
} from "@vue-aria/virtualizer-state";
import { useVirtualizerState } from "@vue-aria/virtualizer-state";
import { useScrollView } from "./useScrollView";
import type { ScrollDirection, UseScrollViewResult } from "./useScrollView";

export interface DefaultRenderedView<T extends object, V> {
  key: Key;
  layoutInfo: LayoutInfo;
  parentLayoutInfo: LayoutInfo | null;
  rendered: V | null;
  reusableView: ReusableView<T, V>;
  children: DefaultRenderedView<T, V>[];
}

export type RenderWrapper<T extends object, V, W> = (
  parent: ReusableView<T, V> | null,
  reusableView: ReusableView<T, V>,
  children: ReusableView<T, V>[],
  renderChildren: (views: ReusableView<T, V>[]) => W[]
) => W | null;

export interface UseVirtualizerOptions<
  T extends object,
  V,
  W = DefaultRenderedView<T, V>,
  O = unknown,
  I = unknown
> extends UseVirtualizerStateOptions<T, V, O> {
  scrollRef: MaybeReactive<HTMLElement | null | undefined>;
  renderWrapper?: RenderWrapper<T, V, W>;
  scrollDirection?: MaybeReactive<ScrollDirection | undefined>;
  scrollViewProps?: MaybeReactive<Record<string, unknown> | undefined>;
  style?: MaybeReactive<CSSProperties | undefined>;
  innerStyle?: MaybeReactive<CSSProperties | undefined>;
  onScroll?: (event: Event) => void;
  isLoading?: MaybeReactive<boolean | undefined>;
  onLoadMore?: () => void;
  scrollOffset?: MaybeReactive<number | undefined>;
  items?: MaybeReactive<I>;
}

export interface UseVirtualizerResult<T extends object, V, W> {
  state: UseVirtualizerStateResult<T, V>;
  virtualizer: UseVirtualizerStateResult<T, V>["virtualizer"];
  visibleViews: UseVirtualizerStateResult<T, V>["visibleViews"];
  renderedViews: ReadonlyRef<W[]>;
  contentSize: ReadonlyRef<Size>;
  isScrolling: UseScrollViewResult["isScrolling"];
  scrollViewProps: ReadonlyRef<Record<string, unknown>>;
  contentProps: UseScrollViewResult["contentProps"];
  updateSize: UseScrollViewResult["updateSize"];
}

function defaultRenderWrapper<T extends object, V>(
  parent: ReusableView<T, V> | null,
  reusableView: ReusableView<T, V>,
  children: ReusableView<T, V>[],
  renderChildren: (views: ReusableView<T, V>[]) => DefaultRenderedView<T, V>[]
): DefaultRenderedView<T, V> | null {
  if (!reusableView.layoutInfo) {
    return null;
  }

  return {
    key: reusableView.key,
    layoutInfo: reusableView.layoutInfo,
    parentLayoutInfo: parent?.layoutInfo ?? null,
    rendered: reusableView.rendered,
    reusableView,
    children: renderChildren(children),
  };
}

function renderChildren<T extends object, V, W>(
  parent: ReusableView<T, V> | null,
  views: ReusableView<T, V>[],
  renderWrapper: RenderWrapper<T, V, W>
): W[] {
  const result: W[] = [];
  for (const view of views) {
    const children = view.children ? Array.from(view.children) : [];
    const wrapped = renderWrapper(parent, view, children, (childViews) =>
      renderChildren(view, childViews, renderWrapper)
    );
    if (wrapped != null) {
      result.push(wrapped);
    }
  }

  return result;
}

export function useVirtualizer<
  T extends object,
  V,
  W = DefaultRenderedView<T, V>,
  O = unknown,
  I = unknown
>(
  options: UseVirtualizerOptions<T, V, W, O, I>
): UseVirtualizerResult<T, V, W> {
  const state = useVirtualizerState<T, V, O>({
    renderView: options.renderView,
    layout: options.layout,
    collection: options.collection,
    persistedKeys: options.persistedKeys,
    layoutOptions: options.layoutOptions,
    onVisibleRectChange: (rect) => {
      const element = toValue(options.scrollRef);
      if (element) {
        element.scrollLeft = rect.x;
        element.scrollTop = rect.y;
      }
      options.onVisibleRectChange?.(rect);
    },
  });

  useLoadMore<I>(
    {
      isLoading: options.isLoading,
      onLoadMore: options.onLoadMore,
      scrollOffset: options.scrollOffset,
      items: options.items,
    },
    options.scrollRef
  );

  const scrollView = useScrollView(
    {
      contentSize: state.contentSize,
      onVisibleRectChange: (rect) => state.setVisibleRect(rect),
      onScrollStart: state.startScrolling,
      onScrollEnd: state.endScrolling,
      scrollDirection: options.scrollDirection,
      onScroll: options.onScroll,
      style: options.style,
      innerStyle: options.innerStyle,
    },
    options.scrollRef
  );

  const wrapper = computed<RenderWrapper<T, V, W>>(() => {
    return (
      options.renderWrapper ??
      (defaultRenderWrapper as unknown as RenderWrapper<T, V, W>)
    );
  });

  const renderedViews = computed<W[]>(() =>
    renderChildren(null, state.visibleViews.value, wrapper.value)
  );

  const scrollViewProps = computed<Record<string, unknown>>(() =>
    mergeProps(
      scrollView.scrollViewProps.value as Record<string, unknown>,
      (toValue(options.scrollViewProps) ?? {}) as Record<string, unknown>
    )
  );

  return {
    state,
    virtualizer: state.virtualizer,
    visibleViews: state.visibleViews,
    renderedViews,
    contentSize: state.contentSize,
    isScrolling: scrollView.isScrolling,
    scrollViewProps,
    contentProps: scrollView.contentProps,
    updateSize: scrollView.updateSize,
  };
}
