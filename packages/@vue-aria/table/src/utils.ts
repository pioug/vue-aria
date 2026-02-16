import type { Key } from "@vue-aria/collections";
import type { TableState } from "@vue-stately/table";

export const gridIds: WeakMap<TableState<unknown>, string> = new WeakMap();

function normalizeKey(key: Key): string {
  if (typeof key === "string") {
    return key.replace(/\s*/g, "");
  }

  return `${key}`;
}

export function getColumnHeaderId<T>(
  state: TableState<T>,
  columnKey: Key
): string {
  const gridId = gridIds.get(state as unknown as TableState<unknown>);
  if (!gridId) {
    throw new Error("Unknown grid");
  }

  return `${gridId}-${normalizeKey(columnKey)}`;
}

export function getCellId<T>(
  state: TableState<T>,
  rowKey: Key,
  columnKey: Key
): string {
  const gridId = gridIds.get(state as unknown as TableState<unknown>);
  if (!gridId) {
    throw new Error("Unknown grid");
  }

  return `${gridId}-${normalizeKey(rowKey)}-${normalizeKey(columnKey)}`;
}

export function getRowLabelledBy<T>(
  state: TableState<T>,
  rowKey: Key
): string {
  return [...state.collection.rowHeaderColumnKeys]
    .map((columnKey) => getCellId(state, rowKey, columnKey))
    .join(" ");
}
