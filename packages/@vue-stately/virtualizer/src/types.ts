import {
  type Collection,
  type ItemDropTarget,
  type Key,
  type LayoutDelegate,
} from "@vue-stately/layout/src/types";
import type { Rect } from "./Rect";
import type { Layout } from "./Layout";

export interface InvalidationContext<O = any> {
  contentChanged?: boolean;
  offsetChanged?: boolean;
  sizeChanged?: boolean;
  itemSizeChanged?: boolean;
  layoutOptionsChanged?: boolean;
  layoutOptions?: O;
}

export interface VirtualizerDelegate<T extends object, V> {
  setVisibleRect(rect: Rect): void;
  renderView(type: string, content: T | null): V;
  invalidate(ctx: InvalidationContext): void;
}

export interface VirtualizerRenderOptions<T extends object, O = any> {
  layout: Layout<T>;
  collection: Collection<T>;
  persistedKeys?: Set<Key> | null;
  visibleRect: Rect;
  invalidationContext: InvalidationContext;
  isScrolling: boolean;
  layoutOptions?: O;
}

export interface Mutable<T> {
  -readonly [P in keyof T]: T[P];
}

export type { Collection, ItemDropTarget, Key, LayoutDelegate };
