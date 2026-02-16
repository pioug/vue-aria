import type { VNodeChild } from "vue";

import type { AriaLabelingProps, AsyncLoadable, Collection, CollectionBase, Direction, DOMProps, KeyboardDelegate, LoadingState, MultipleSelection, Node, Orientation, StyleProps } from "@vue-types/shared";

interface AriaCardProps extends AriaLabelingProps {}

type Scale = "S" | "M" | "L" | "xl";

export interface SpectrumCardProps extends AriaCardProps, StyleProps, DOMProps {
  children: VNodeChild,
  isQuiet?: boolean,
  layout?: "grid" | "waterfall" | "gallery",
  orientation?: Orientation
}

interface Layout<T> {
  direction?: Direction;
  collection?: Collection<Node<T>>;
  disabledKeys?: Iterable<string | number>;
}

interface LayoutOptions {
  cardOrientation?: Orientation,
  collator?: Intl.Collator,
  scale?: Scale
}

interface CardViewLayout<T> extends Layout<T>, KeyboardDelegate {
  collection: Collection<Node<T>>,
  disabledKeys: Iterable<string | number>,
  isLoading: boolean,
  direction: Direction,
  layoutType: string,
  margin?: number
}

export interface CardViewLayoutConstructor<T> {
  new (options?: LayoutOptions): CardViewLayout<T>
}

interface CardViewProps<T> extends CollectionBase<T>, MultipleSelection, Omit<AsyncLoadable, "isLoading"> {
  layout: CardViewLayoutConstructor<T> | CardViewLayout<T>,
  cardOrientation?: Orientation,
  isQuiet?: boolean,
  renderEmptyState?: () => VNodeChild,
  loadingState?: LoadingState
}

export interface AriaCardViewProps<T> extends CardViewProps<T>, DOMProps, AriaLabelingProps {}

export interface SpectrumCardViewProps<T> extends AriaCardViewProps<T>, StyleProps {}
