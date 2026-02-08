import type { SelectionBehavior } from "@vue-aria/selection-state";
import type { Key } from "@vue-aria/types";
import type { UseTreeStateResult } from "@vue-aria/tree-state";

export interface TreeData {
  id?: string;
  selectionBehavior?: SelectionBehavior;
  shouldUseVirtualFocus?: boolean;
  isVirtualized?: boolean;
  onAction?: (key: Key) => void;
  rowElements?: Map<Key, HTMLElement>;
}

export const treeData: WeakMap<object, TreeData> = new WeakMap();

function normalizeKey(key: Key): string {
  if (typeof key === "string") {
    return key.replace(/\s*/g, "");
  }

  return String(key);
}

function getTreeData<T>(state: UseTreeStateResult<T>): TreeData {
  const data = treeData.get(state as object);
  if (!data?.id) {
    throw new Error("Unknown tree");
  }

  return data;
}

export function getRowElementMap<T>(state: UseTreeStateResult<T>): Map<Key, HTMLElement> {
  const existing = treeData.get(state as object);
  if (existing?.rowElements) {
    return existing.rowElements;
  }

  const rowElements = new Map<Key, HTMLElement>();
  if (existing) {
    existing.rowElements = rowElements;
    return rowElements;
  }

  treeData.set(state as object, {
    rowElements,
  });

  return rowElements;
}

export function getTreeRowId<T>(state: UseTreeStateResult<T>, itemKey: Key): string {
  const data = getTreeData(state);
  return `${data.id}-row-${normalizeKey(itemKey)}`;
}

export function getTreeCellId<T>(state: UseTreeStateResult<T>, itemKey: Key): string {
  const data = getTreeData(state);
  return `${data.id}-cell-${normalizeKey(itemKey)}`;
}
