import type { Key } from "@vue-aria/collections";
import type { GridNode } from "@vue-aria/grid-state";

export type ColumnSize = number | string;

export interface TableCollection<T> {
  columns: GridNode<T>[];
}

export type { Key, GridNode };
