import type { Key } from "@vue-aria/collections";
import type { GridNode } from "@vue-aria/grid-state";

export type ColumnSize = number | string;

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
