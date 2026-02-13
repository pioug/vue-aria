import type { Key } from "@vue-aria/collections";
import type { GridNode } from "@vue-aria/grid-state";

export type ColumnSize = number | string;
export type ColumnStaticSize = number | `${number}` | `${number}%`;

export interface TableHeaderProps<T> {
  columns?: T[];
  children: ColumnElement<T> | ColumnElement<T>[] | ColumnRenderer<T>;
}

export type ColumnElement<T> = {
  type?: unknown;
  props?: ColumnProps<T>;
};

export type ColumnRenderer<T> = (item: T) => ColumnElement<T>;

export interface ColumnProps<T> {
  title?: unknown;
  children: unknown;
  childColumns?: T[];
  width?: ColumnSize | null;
  minWidth?: ColumnStaticSize | null;
  maxWidth?: ColumnStaticSize | null;
  defaultWidth?: ColumnSize | null;
  allowsResizing?: boolean;
  allowsSorting?: boolean;
  isRowHeader?: boolean;
  textValue?: string;
  "aria-label"?: string;
}

export type RowElement<T> = {
  type?: unknown;
  props?: RowProps<T>;
};

export interface TableBodyProps<T> {
  children: RowElement<T> | RowElement<T>[] | ((item: T) => RowElement<T>);
  items?: Iterable<T>;
  loadingState?: string;
}

export interface RowProps<T> {
  UNSTABLE_childItems?: Iterable<T>;
  children: unknown;
  textValue?: string;
  "aria-label"?: string;
}

export interface CellProps {
  children: unknown;
  textValue?: string;
  colSpan?: number;
  "aria-label"?: string;
}

export interface TablePartialNode<T> {
  type: string;
  key?: Key;
  value?: T;
  props?: Record<string, unknown>;
  element?: unknown;
  renderer?: (value: T) => unknown;
  hasChildNodes?: boolean;
  rendered?: unknown;
  textValue?: string;
  "aria-label"?: string;
  childNodes?: () => Iterable<TablePartialNode<T>>;
  shouldInvalidate?: (newContext: unknown) => boolean;
}

export type SortDirection = "ascending" | "descending";

export interface SortDescriptor {
  column: Key;
  direction: SortDirection;
}

export interface Sortable {
  sortDescriptor?: SortDescriptor;
  onSortChange?: (descriptor: SortDescriptor) => void;
}

export interface TableCollection<T> {
  columnCount: number;
  rows: GridNode<T>[];
  headerRows: GridNode<T>[];
  columns: GridNode<T>[];
  rowHeaderColumnKeys: Set<Key>;
  body: GridNode<T>;
  readonly size: number;
  getKeys(): IterableIterator<Key>;
  getKeyBefore(key: Key): Key | null;
  getKeyAfter(key: Key): Key | null;
  getFirstKey(): Key | null;
  getLastKey(): Key | null;
  getItem(key: Key): GridNode<T> | null;
  at(idx: number): GridNode<T> | null;
  getChildren(key: Key): Iterable<GridNode<T>>;
  getTextValue(key: Key): string;
  filter?(
    filterFn: (nodeValue: string, node: GridNode<T>) => boolean
  ): TableCollection<T>;
  [Symbol.iterator](): IterableIterator<GridNode<T>>;
}

export type { Key, GridNode };
