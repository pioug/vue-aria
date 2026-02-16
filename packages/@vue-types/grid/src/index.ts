import type { Collection, Key, Node } from "@vue-types/shared";

export interface GridCollection<T> extends Collection<GridNode<T>> {
  columnCount: number;
  rows: GridNode<T>[];
}

export interface GridRow<T> extends Partial<GridNode<T>> {
  key?: Key;
  type: string;
  childNodes: Iterable<Node<T>>;
}

export interface GridNode<T> extends Node<T> {
  column?: GridNode<T>;
  colspan?: number;
  colSpan?: number | null;
  colIndex?: number | null;
  indexOfType?: number;
}
