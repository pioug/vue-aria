export type Key = string | number;

export interface RectLike {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SizeLike {
  width: number;
  height: number;
}

export interface Collection<T> extends Iterable<T> {
  readonly size: number;
  getKeys(): IterableIterator<Key>;
  getItem(key: Key): T | null;
  getKeyBefore(key: Key): Key | null;
  getKeyAfter(key: Key): Key | null;
  getFirstKey(): Key | null;
  getLastKey(): Key | null;
  at(idx: number): T | null;
  getChildren?(key: Key): Iterable<T>;
  getTextValue?(key: Key): string;
  filter?(filterFn: (nodeValue: string, node: T) => boolean): Collection<T>;
}

export interface Node<T> {
  type: string;
  key: Key;
  value: T | null;
  level: number;
  hasChildNodes: boolean;
  childNodes: Iterable<Node<T>>;
  rendered: unknown;
  textValue: string;
  index: number;
  parentKey?: Key | null;
  prevKey?: Key | null;
  nextKey?: Key | null;
  firstChildKey?: Key | null;
  lastChildKey?: Key | null;
  props?: Record<string, unknown>;
  colSpan?: number | null;
  colspan?: number | null;
  colIndex?: number | null;
  "aria-label"?: string;
  shouldInvalidate?: (context: unknown) => boolean;
  render?: (node: Node<T>) => unknown;
}

export type DropPosition = "on" | "before" | "after";

export interface RootDropTarget {
  type: "root";
}

export interface ItemDropTarget {
  type: "item";
  key: Key;
  dropPosition: DropPosition;
}

export type DropTarget = RootDropTarget | ItemDropTarget;

export interface LayoutDelegate {
  getItemRect(key: Key): RectLike | null;
  getVisibleRect(): RectLike;
  getContentSize(): SizeLike;
  getKeyRange?(from: Key, to: Key): Key[];
}

export interface DropTargetDelegate {
  getDropTargetFromPoint(
    x: number,
    y: number,
    isValidDropTarget: (target: DropTarget) => boolean
  ): DropTarget | null;
}

export interface GridNode<T> extends Node<T> {
  column?: GridNode<T>;
  colSpan?: number | null;
  colIndex?: number | null;
  indexOfType?: number;
}

export interface GridCollection<T> extends Collection<GridNode<T>> {
  columnCount: number;
  rows: GridNode<T>[];
}

export interface TableCollection<T> extends GridCollection<T> {
  headerRows: GridNode<T>[];
  columns: GridNode<T>[];
  rowHeaderColumnKeys: Set<Key>;
  head?: GridNode<T>;
  body: GridNode<T>;
}

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
