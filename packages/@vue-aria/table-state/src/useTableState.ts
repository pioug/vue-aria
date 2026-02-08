import { computed, ref, toValue, watchEffect } from "vue";
import {
  useMultipleSelectionState,
  type SelectionBehavior,
  type SelectionMode,
  type UseMultipleSelectionStateOptions,
} from "@vue-aria/selection-state";
import type { Key, MaybeReactive, ReadonlyRef } from "@vue-aria/types";

export type SortDirection = "ascending" | "descending";

export interface SortDescriptor {
  column: Key;
  direction: SortDirection;
}

export interface TableColumn {
  key: Key;
  textValue?: string;
  isRowHeader?: boolean;
  isSelectionCell?: boolean;
  isDragButtonCell?: boolean;
}

export interface TableCell {
  key?: Key;
  textValue?: string;
  value?: unknown;
}

export interface TableRow<T = unknown> {
  key: Key;
  textValue?: string;
  value?: T;
  isDisabled?: boolean;
  cells?: Iterable<TableCell>;
}

export interface TableRowNode<T = unknown> extends TableRow<T> {
  cells: readonly TableCell[];
  prevKey?: Key;
  nextKey?: Key;
}

export interface TableCollection<T = unknown> {
  columns: readonly TableColumn[];
  rows: readonly TableRowNode<T>[];
  rowHeaderColumnKeys: ReadonlySet<Key>;
  size: number;
  getKeys: () => IterableIterator<Key>;
  getFirstKey: () => Key | null;
  getLastKey: () => Key | null;
  getKeyBefore: (key: Key) => Key | null;
  getKeyAfter: (key: Key) => Key | null;
  getItem: (key: Key) => TableRowNode<T> | null;
  getTextValue: (key: Key) => string;
}

export interface TableSelectionManager {
  selectionMode: ReadonlyRef<SelectionMode>;
  selectedKeys: ReadonlyRef<Set<Key>>;
  focusedKey: ReadonlyRef<Key | null>;
  isFocused: ReadonlyRef<boolean>;
  setFocused: (isFocused: boolean) => void;
  setFocusedKey: (key: Key | null) => void;
  isSelected: (key: Key) => boolean;
  isDisabled: (key: Key) => boolean;
  setSelectedKeys: (keys: Iterable<Key>) => void;
  select: (key: Key, behavior?: SelectionBehavior) => void;
}

export interface UseTableStateOptions<T = unknown>
  extends Omit<UseMultipleSelectionStateOptions, "disabledKeys"> {
  collection?: MaybeReactive<Iterable<TableRow<T>> | undefined>;
  columns?: MaybeReactive<Iterable<TableColumn> | undefined>;
  disabledKeys?: MaybeReactive<Iterable<Key> | undefined>;
  showSelectionCheckboxes?: MaybeReactive<boolean | undefined>;
  showDragButtons?: MaybeReactive<boolean | undefined>;
  sortDescriptor?: MaybeReactive<SortDescriptor | null | undefined>;
  onSortChange?: (descriptor: SortDescriptor) => void;
}

export interface UseTableStateResult<T = unknown> {
  collection: ReadonlyRef<TableCollection<T>>;
  disabledKeys: ReadonlyRef<Set<Key>>;
  selectionManager: TableSelectionManager;
  showSelectionCheckboxes: ReadonlyRef<boolean>;
  sortDescriptor: ReadonlyRef<SortDescriptor | null>;
  sort: (columnKey: Key, direction?: SortDirection) => void;
  isKeyboardNavigationDisabled: ReadonlyRef<boolean>;
  setKeyboardNavigationDisabled: (value: boolean) => void;
}

const SELECTION_COLUMN_KEY = "__table-selection-cell__";
const DRAG_COLUMN_KEY = "__table-drag-cell__";

function resolveBoolean(
  value: MaybeReactive<boolean | undefined> | undefined
): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

function resolveKeySet(
  value: MaybeReactive<Iterable<Key> | undefined> | undefined
): Set<Key> {
  if (value === undefined) {
    return new Set();
  }

  return new Set(toValue(value) ?? []);
}

function isSameSet(left: Set<Key>, right: Set<Key>): boolean {
  if (left.size !== right.size) {
    return false;
  }

  for (const key of left) {
    if (!right.has(key)) {
      return false;
    }
  }

  return true;
}

function toArray<T>(value: Iterable<T> | undefined): T[] {
  if (!value) {
    return [];
  }

  return Array.from(value);
}

function toCollectionArray<T>(value: MaybeReactive<Iterable<T> | undefined> | undefined): T[] {
  if (value === undefined) {
    return [];
  }

  return toArray(toValue(value));
}

function oppositeDirection(direction: SortDirection): SortDirection {
  return direction === "ascending" ? "descending" : "ascending";
}

function buildTableCollection<T>(
  rowsInput: Iterable<TableRow<T>> | undefined,
  columnsInput: Iterable<TableColumn> | undefined,
  options: {
    showSelectionCheckboxes: boolean;
    showDragButtons: boolean;
  }
): TableCollection<T> {
  const baseColumns = toArray(columnsInput);
  const rows = toArray(rowsInput);

  if (baseColumns.length === 0 && rows.length > 0) {
    const maxCellCount = Math.max(...rows.map((row) => toArray(row.cells).length), 0);
    for (let index = 0; index < maxCellCount; index += 1) {
      baseColumns.push({
        key: `column-${index}`,
      });
    }
  }

  const columns: TableColumn[] = [];
  if (options.showDragButtons) {
    columns.push({
      key: DRAG_COLUMN_KEY,
      isDragButtonCell: true,
    });
  }
  if (options.showSelectionCheckboxes) {
    columns.push({
      key: SELECTION_COLUMN_KEY,
      isSelectionCell: true,
    });
  }
  columns.push(...baseColumns);

  const rowHeaderColumnKeys = new Set<Key>(
    columns.filter((column) => column.isRowHeader).map((column) => column.key)
  );
  if (rowHeaderColumnKeys.size === 0) {
    const firstDefaultHeader = columns.find(
      (column) => !column.isSelectionCell && !column.isDragButtonCell
    );
    if (firstDefaultHeader) {
      rowHeaderColumnKeys.add(firstDefaultHeader.key);
    }
  }

  const specialColumnCount = columns.filter(
    (column) => column.isSelectionCell || column.isDragButtonCell
  ).length;

  const rowNodes: TableRowNode<T>[] = rows.map((row) => {
    const rawCells: TableCell[] = toArray(row.cells);
    const prefixCells: TableCell[] = Array.from({ length: specialColumnCount }, () => ({
      textValue: "",
    }));
    const mergedCells: TableCell[] = prefixCells.concat(rawCells);
    const paddedCells: TableCell[] = [...mergedCells];
    while (paddedCells.length < columns.length) {
      paddedCells.push({ textValue: "" });
    }

    return {
      key: row.key,
      textValue: row.textValue,
      value: row.value,
      isDisabled: row.isDisabled,
      cells: paddedCells.slice(0, columns.length),
    };
  });

  for (let index = 0; index < rowNodes.length; index += 1) {
    rowNodes[index].prevKey = index > 0 ? rowNodes[index - 1]?.key : undefined;
    rowNodes[index].nextKey =
      index + 1 < rowNodes.length ? rowNodes[index + 1]?.key : undefined;
  }

  const rowMap = new Map<Key, TableRowNode<T>>(rowNodes.map((row) => [row.key, row]));
  const rowHeaderIndices = columns
    .map((column, index) => (rowHeaderColumnKeys.has(column.key) ? index : -1))
    .filter((index) => index >= 0);

  return {
    columns,
    rows: rowNodes,
    rowHeaderColumnKeys,
    size: rowNodes.length,
    getKeys: () => rowMap.keys(),
    getFirstKey: () => rowNodes[0]?.key ?? null,
    getLastKey: () => rowNodes[rowNodes.length - 1]?.key ?? null,
    getKeyBefore: (key) => rowMap.get(key)?.prevKey ?? null,
    getKeyAfter: (key) => rowMap.get(key)?.nextKey ?? null,
    getItem: (key) => rowMap.get(key) ?? null,
    getTextValue: (key) => {
      const row = rowMap.get(key);
      if (!row) {
        return "";
      }

      if (row.textValue && row.textValue.length > 0) {
        return row.textValue;
      }

      const text = rowHeaderIndices
        .map((index) => row.cells[index]?.textValue)
        .filter((value): value is string => typeof value === "string" && value.length > 0)
        .join(" ");
      return text;
    },
  };
}

export function useTableState<T = unknown>(
  options: UseTableStateOptions<T> = {}
): UseTableStateResult<T> {
  const showSelectionCheckboxes = computed(() =>
    resolveBoolean(options.showSelectionCheckboxes) &&
    options.selectionMode !== undefined &&
    toValue(options.selectionMode) !== "none"
  );
  const showDragButtons = computed(() => resolveBoolean(options.showDragButtons));

  const tableCollection = computed<TableCollection<T>>(() =>
    buildTableCollection(
      options.collection === undefined ? undefined : toValue(options.collection),
      options.columns === undefined ? undefined : toValue(options.columns),
      {
        showSelectionCheckboxes: showSelectionCheckboxes.value,
        showDragButtons: showDragButtons.value,
      }
    )
  );

  const disabledKeys = computed(() => resolveKeySet(options.disabledKeys));
  const selectionState = useMultipleSelectionState({
    selectionMode: options.selectionMode,
    disallowEmptySelection: options.disallowEmptySelection,
    allowDuplicateSelectionEvents: options.allowDuplicateSelectionEvents,
    selectionBehavior: options.selectionBehavior,
    selectedKeys: options.selectedKeys,
    defaultSelectedKeys: options.defaultSelectedKeys,
    onSelectionChange: options.onSelectionChange,
    disabledKeys: options.disabledKeys,
    disabledBehavior: options.disabledBehavior ?? "selection",
  });

  watchEffect(() => {
    const focusedKey = selectionState.focusedKey.value;
    if (focusedKey === null) {
      return;
    }

    if (!tableCollection.value.getItem(focusedKey)) {
      selectionState.setFocusedKey(null);
    }
  });

  watchEffect(() => {
    const currentSelection = selectionState.selectedKeys.value;
    if (currentSelection.size === 0) {
      return;
    }

    const nextSelection = new Set<Key>();
    for (const key of currentSelection) {
      if (tableCollection.value.getItem(key)) {
        nextSelection.add(key);
      }
    }

    if (!isSameSet(nextSelection, currentSelection)) {
      selectionState.setSelectedKeys(nextSelection);
    }
  });

  const isDisabled = (key: Key): boolean => {
    if (disabledKeys.value.has(key)) {
      return true;
    }

    return Boolean(tableCollection.value.getItem(key)?.isDisabled);
  };

  const setSelectedKeys = (keys: Iterable<Key>): void => {
    selectionState.setSelectedKeys(new Set(keys));
  };

  const select = (key: Key, behavior: SelectionBehavior = "replace"): void => {
    if (selectionState.selectionMode.value === "none" || isDisabled(key)) {
      return;
    }

    if (selectionState.selectionMode.value === "single" || behavior === "replace") {
      setSelectedKeys([key]);
      return;
    }

    const nextSelection = new Set(selectionState.selectedKeys.value);
    if (nextSelection.has(key)) {
      nextSelection.delete(key);
    } else {
      nextSelection.add(key);
    }
    setSelectedKeys(nextSelection);
  };

  const selectionManager: TableSelectionManager = {
    selectionMode: selectionState.selectionMode,
    selectedKeys: selectionState.selectedKeys,
    focusedKey: selectionState.focusedKey,
    isFocused: selectionState.isFocused,
    setFocused: selectionState.setFocused,
    setFocusedKey: selectionState.setFocusedKey,
    isSelected: (key) => selectionState.selectedKeys.value.has(key),
    isDisabled,
    setSelectedKeys,
    select,
  };

  const sortDescriptor = computed<SortDescriptor | null>(() => {
    if (options.sortDescriptor === undefined) {
      return null;
    }

    return toValue(options.sortDescriptor) ?? null;
  });

  const sort = (columnKey: Key, direction?: SortDirection): void => {
    const currentSort = sortDescriptor.value;
    const nextDirection =
      direction ??
      (currentSort?.column === columnKey
        ? oppositeDirection(currentSort.direction)
        : "ascending");

    options.onSortChange?.({
      column: columnKey,
      direction: nextDirection,
    });
  };

  const keyboardNavigationDisabled = ref(false);
  const isKeyboardNavigationDisabled = computed(
    () => tableCollection.value.size === 0 || keyboardNavigationDisabled.value
  );

  return {
    collection: tableCollection,
    disabledKeys,
    selectionManager,
    showSelectionCheckboxes,
    sortDescriptor,
    sort,
    isKeyboardNavigationDisabled,
    setKeyboardNavigationDisabled: (value) => {
      keyboardNavigationDisabled.value = value;
    },
  };
}
