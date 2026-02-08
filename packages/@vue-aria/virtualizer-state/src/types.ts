import type { Key } from "@vue-aria/types";
import type { Layout } from "./Layout";
import type { Rect } from "./Rect";

export interface VirtualizerCollection<T extends object> {
  getItem: (key: Key) => T | null;
}

export interface ItemDropTarget {
  type: "item";
  key: Key;
  dropPosition: "before" | "on" | "after";
}

export interface InvalidationContext<O = unknown> {
  contentChanged?: boolean;
  offsetChanged?: boolean;
  sizeChanged?: boolean;
  itemSizeChanged?: boolean;
  layoutOptionsChanged?: boolean;
  layoutOptions?: O;
}

export interface VirtualizerDelegate<T extends object, V> {
  setVisibleRect: (rect: Rect) => void;
  renderView: (type: string, content: T | null) => V;
  invalidate: (context: InvalidationContext) => void;
}

export interface VirtualizerRenderOptions<T extends object, O = unknown> {
  layout: Layout<T>;
  collection: VirtualizerCollection<T>;
  persistedKeys?: Set<Key> | null;
  visibleRect: Rect;
  invalidationContext: InvalidationContext<O>;
  isScrolling: boolean;
  layoutOptions?: O;
}

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
