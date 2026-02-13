import { computed, ref, watch } from "vue";
import { TableColumnLayout } from "./TableColumnLayout";
import type { ColumnSize, GridNode, Key } from "./types";
import type { TableState } from "./useTableState";

export interface TableColumnResizeStateProps<T> {
  tableWidth: number;
  getDefaultWidth?: (node: GridNode<T>) => ColumnSize | null | undefined;
  getDefaultMinWidth?: (node: GridNode<T>) => ColumnSize | null | undefined;
}

export interface TableColumnResizeState<T> {
  updateResizedColumns: (key: Key, width: number) => Map<Key, ColumnSize>;
  startResize: (key: Key) => void;
  endResize: () => void;
  getColumnWidth: (key: Key) => number;
  getColumnMinWidth: (key: Key) => number;
  getColumnMaxWidth: (key: Key) => number;
  resizingColumn: Key | null;
  tableState: TableState<T>;
  columnWidths: Map<Key, number>;
}

export function useTableColumnResizeState<T>(
  props: TableColumnResizeStateProps<T>,
  state: TableState<T>
): TableColumnResizeState<T> {
  const resizingColumnRef = ref<Key | null>(null);
  const tableWidthRef = computed(() => props.tableWidth ?? 0);

  const columnLayoutRef = computed(
    () =>
      new TableColumnLayout<T>({
        getDefaultWidth: props.getDefaultWidth,
        getDefaultMinWidth: props.getDefaultMinWidth,
      })
  );

  const splitColumnsRef = computed(() =>
    columnLayoutRef.value.splitColumnsIntoControlledAndUncontrolled(
      state.collection.columns
    )
  );

  const controlledColumnsRef = computed(() => splitColumnsRef.value[0]);
  const uncontrolledColumnsRef = computed(() => splitColumnsRef.value[1]);

  const uncontrolledWidthsRef = ref<Map<Key, ColumnSize>>(
    columnLayoutRef.value.getInitialUncontrolledWidths(
      uncontrolledColumnsRef.value
    )
  );

  const lastColumnsRef = ref(state.collection.columns);
  watch(
    () => state.collection.columns,
    (columns) => {
      const lastColumns = lastColumnsRef.value;
      if (columns !== lastColumns) {
        if (
          columns.length !== lastColumns.length
          || columns.some((column, index) => column.key !== lastColumns[index].key)
        ) {
          uncontrolledWidthsRef.value =
            columnLayoutRef.value.getInitialUncontrolledWidths(
              uncontrolledColumnsRef.value
            );
        }
        lastColumnsRef.value = columns;
      }
    }
  );

  const colWidthsRef = computed(() =>
    columnLayoutRef.value.recombineColumns(
      state.collection.columns,
      uncontrolledWidthsRef.value,
      uncontrolledColumnsRef.value,
      controlledColumnsRef.value
    )
  );

  const startResize = (key: Key) => {
    resizingColumnRef.value = key;
  };

  const updateResizedColumns = (key: Key, width: number): Map<Key, ColumnSize> => {
    // Ensure layout min/max caches are initialized before resize math.
    void columnWidthsRef.value;
    const newSizes = columnLayoutRef.value.resizeColumnWidth(
      state.collection,
      uncontrolledWidthsRef.value,
      key,
      width
    );
    const map = new Map<Key, ColumnSize>(
      Array.from(uncontrolledColumnsRef.value).map(([columnKey]) => [
        columnKey,
        (newSizes.get(columnKey) ?? "1fr") as ColumnSize,
      ])
    );
    map.set(key, width);
    uncontrolledWidthsRef.value = map;
    return newSizes;
  };

  const endResize = () => {
    resizingColumnRef.value = null;
  };

  const columnWidthsRef = computed(() =>
    columnLayoutRef.value.buildColumnWidths(
      tableWidthRef.value,
      state.collection,
      colWidthsRef.value
    )
  );

  return {
    get resizingColumn() {
      return resizingColumnRef.value;
    },
    updateResizedColumns,
    startResize,
    endResize,
    getColumnWidth: (key: Key) => columnLayoutRef.value.getColumnWidth(key),
    getColumnMinWidth: (key: Key) =>
      columnLayoutRef.value.getColumnMinWidth(key),
    getColumnMaxWidth: (key: Key) =>
      columnLayoutRef.value.getColumnMaxWidth(key),
    tableState: state,
    get columnWidths() {
      return columnWidthsRef.value;
    },
  };
}
