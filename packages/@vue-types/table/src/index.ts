import type { VNodeChild } from "vue";

import type {
  AriaLabelingProps,
  AsyncLoadable,
  DOMProps,
  Key,
  LinkDOMProps,
  LoadingState,
  MultipleSelection,
  Sortable,
  SpectrumSelectionProps,
  StyleProps
} from "@vue-types/shared";
import type { GridCollection, GridNode } from "@vue-types/grid";

export type ColumnStaticSize = number | `${number}` | `${number}%`;
export type ColumnDynamicSize = `${number}fr`;
export type ColumnSize = ColumnStaticSize | ColumnDynamicSize;

export interface TableProps<T> extends MultipleSelection, Sortable {
  children: [TableHeaderProps<T>, TableBodyProps<T>];
  disabledKeys?: Iterable<Key>;
  escapeKeyBehavior?: "clearSelection" | "none";
  shouldSelectOnPressUp?: boolean;
}

export interface SpectrumTableProps<T> extends TableProps<T>, SpectrumSelectionProps, DOMProps, AriaLabelingProps, StyleProps {
  density?: "compact" | "regular" | "spacious";
  overflowMode?: "wrap" | "truncate";
  isQuiet?: boolean;
  renderEmptyState?: () => VNodeChild;
  onAction?: (key: Key) => void;
  onResizeStart?: (widths: Map<Key, ColumnSize>) => void;
  onResize?: (widths: Map<Key, ColumnSize>) => void;
  onResizeEnd?: (widths: Map<Key, ColumnSize>) => void;
}

export interface TableHeaderProps<T> {
  columns?: T[];
  children: ColumnElement<T> | ColumnElement<T>[] | ColumnRenderer<T>;
}

export type ColumnElement<T> = VNodeChild;
export type ColumnRenderer<T> = (item: T) => ColumnElement<T>;

export interface ColumnProps<T> {
  title?: VNodeChild;
  children: VNodeChild | ColumnElement<T> | ColumnElement<T>[];
  childColumns?: T[];
  width?: ColumnSize | null;
  minWidth?: ColumnStaticSize | null;
  maxWidth?: ColumnStaticSize | null;
  defaultWidth?: ColumnSize | null;
  allowsResizing?: boolean;
  allowsSorting?: boolean;
  isRowHeader?: boolean;
  textValue?: string;
}

export interface SpectrumColumnProps<T> extends ColumnProps<T> {
  align?: "start" | "center" | "end";
  showDivider?: boolean;
  hideHeader?: boolean;
}

export type RowElement<T> = VNodeChild;

export interface TableBodyProps<T> extends Omit<AsyncLoadable, "isLoading"> {
  children: RowElement<T> | RowElement<T>[] | ((item: T) => RowElement<T>);
  items?: Iterable<T>;
  loadingState?: LoadingState;
}

export interface RowProps<T> extends LinkDOMProps {
  UNSTABLE_childItems?: Iterable<T>;
  children: CellElement | CellElement[] | CellRenderer;
  textValue?: string;
}

export interface CellProps {
  children: VNodeChild;
  textValue?: string;
  colSpan?: number;
}

export type CellElement = VNodeChild;
export type CellRenderer = (columnKey: Key) => CellElement;

export interface TableCollection<T> extends GridCollection<T> {
  headerRows: GridNode<T>[];
  columns: GridNode<T>[];
  rowHeaderColumnKeys: Set<Key>;
  head?: GridNode<T>;
  body: GridNode<T>;
}
