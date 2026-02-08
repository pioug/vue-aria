import type { SelectionBehavior } from "@vue-aria/selection-state";
import type { Key } from "@vue-aria/types";
import type { UseTableStateResult } from "@vue-aria/table-state";

export interface TableData {
  id?: string;
  selectionBehavior?: SelectionBehavior;
  shouldUseVirtualFocus?: boolean;
  isVirtualized?: boolean;
  onAction?: (key: Key) => void;
  rowElements?: Map<Key, HTMLElement>;
}

export const tableData: WeakMap<object, TableData> = new WeakMap();

function normalizeKey(key: Key): string {
  if (typeof key === "string") {
    return key.replace(/\s*/g, "");
  }

  return String(key);
}

function getTableData<T>(state: UseTableStateResult<T>): TableData {
  const data = tableData.get(state as object);
  if (!data?.id) {
    throw new Error("Unknown grid");
  }

  return data;
}

export function getRowElementMap<T>(state: UseTableStateResult<T>): Map<Key, HTMLElement> {
  const existing = tableData.get(state as object);
  if (existing?.rowElements) {
    return existing.rowElements;
  }

  const rowElements = new Map<Key, HTMLElement>();
  if (existing) {
    existing.rowElements = rowElements;
    return rowElements;
  }

  tableData.set(state as object, {
    rowElements,
  });

  return rowElements;
}

export function getColumnHeaderId<T>(state: UseTableStateResult<T>, columnKey: Key): string {
  const data = getTableData(state);
  return `${data.id}-${normalizeKey(columnKey)}`;
}

export function getRowId<T>(state: UseTableStateResult<T>, rowKey: Key): string {
  const data = getTableData(state);
  return `${data.id}-row-${normalizeKey(rowKey)}`;
}

export function getCellId<T>(
  state: UseTableStateResult<T>,
  rowKey: Key,
  columnKey: Key
): string {
  const data = getTableData(state);
  return `${data.id}-${normalizeKey(rowKey)}-${normalizeKey(columnKey)}`;
}

export function getRowLabelledBy<T>(state: UseTableStateResult<T>, rowKey: Key): string {
  return Array.from(state.collection.value.rowHeaderColumnKeys)
    .map((columnKey) => getCellId(state, rowKey, columnKey))
    .join(" ");
}
