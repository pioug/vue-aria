import type { Key } from "./useVirtualizerItem";
import type { Rect, Size } from "./utils";
import { ScrollView } from "./ScrollView";

export interface VirtualizerCollection<T extends object> {
  getChildren: () => Iterable<[T, number]>;
}

export interface VirtualizerItemView<T> {
  key: Key;
  content: T;
}

export interface VirtualizerLayoutOptions {}
export interface VirtualizerLayout {
  layoutInfoForItem(item: VirtualizerItemView<any>, index: number): {
    key: Key;
    x: number;
    y: number;
    width: number;
    height: number;
    estimatedSize?: number;
    opacity?: number;
    isSticky?: boolean;
    allowOverflow?: boolean;
  };
}

interface VirtualizerProps<T extends object, V, O> {
  children: (type: string, content: T) => V;
  renderWrapper?: (parent: unknown, reusableView: VirtualizerItemView<T>, children: VirtualizerItemView<T>[], renderChildren: (views: VirtualizerItemView<T>[]) => V[]) => V;
  layout: VirtualizerLayout;
  collection: VirtualizerCollection<T>;
  persistedKeys?: Set<Key> | null;
  scrollDirection?: "horizontal" | "vertical" | "both";
  isLoading?: boolean;
  onLoadMore?: () => void;
  layoutOptions?: O;
}

interface VirtualizerState<T, O> {
  visibleViews: VirtualizerItemView<T>[];
  setVisibleRect: (rect: Rect) => void;
  contentSize: Size;
}

function createVirtualizerState<T, O>(props: VirtualizerProps<T, any, O>): VirtualizerState<T, O> {
  const children = Array.from(props.collection.getChildren?.() ?? []);
  const views = children.map(([item]) => ({
    key: (item as {key?: Key}).key ?? Math.random(),
    content: item as any,
    item,
  } as VirtualizerItemView<T>));
  const item = views[0]?.content as any;
  const fakeWidth = typeof item?.width === "number" ? item.width : 0;
  const fakeHeight = children.length * 40;
  return {
    visibleViews: views,
    setVisibleRect: () => undefined,
    contentSize: {width: fakeWidth || 0, height: fakeHeight},
  };
}

export function Virtualizer<T extends object, V, O>(props: VirtualizerProps<T, V, O>): {
  virtualizerProps: Record<string, unknown>;
  content: V[];
} {
  const {
    children,
    renderWrapper,
    collection,
    layout,
    onLoadMore,
    layoutOptions,
    scrollDirection = "vertical",
  } = props;

  const ref = { current: null as unknown as HTMLElement | null };
  const state = createVirtualizerState<T, O>({ ...props, collection, layout } as VirtualizerProps<T, V, O>);
  const content = state.visibleViews.map((view) => {
    const render = renderWrapper
      ? renderWrapper(null, view as unknown as never, [] as never[], () => [])
      : children("item", view.content);
    onLoadMore?.();
    return render as V;
  });

  const { scrollViewProps, contentProps } = ScrollView({
    contentSize: state.contentSize,
    onVisibleRectChange: state.setVisibleRect,
    scrollDirection,
    onScrollStart: () => undefined,
    onScrollEnd: () => undefined,
    ref,
  });

  return {
    virtualizerProps: {
      role: "presentation",
      ...scrollViewProps,
      layout: layoutOptions ? JSON.stringify(layoutOptions) : undefined,
      collection,
    },
    content: [ ...content ],
  };
};
