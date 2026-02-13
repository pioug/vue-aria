import { useGridState, type GridState } from "@vue-aria/grid-state";
import type {
  MultipleSelectionState,
  MultipleSelectionStateProps,
  SelectionMode,
} from "@vue-aria/selection-state";
import { computed, ref } from "vue";
import { TableCollection } from "./TableCollection";
import type {
  GridNode,
  Key,
  SortDescriptor,
  SortDirection,
  Sortable,
  TableCollection as ITableCollection,
} from "./types";

export interface TableState<T> extends GridState<T, ITableCollection<T>> {
  collection: ITableCollection<T>;
  showSelectionCheckboxes: boolean;
  sortDescriptor: SortDescriptor | null;
  sort(columnKey: Key, direction?: SortDirection): void;
  isKeyboardNavigationDisabled: boolean;
  setKeyboardNavigationDisabled: (val: boolean) => void;
}

export interface CollectionBuilderContext<T> {
  showSelectionCheckboxes: boolean;
  showDragButtons: boolean;
  selectionMode: SelectionMode;
  columns: GridNode<T>[];
}

export interface TableStateProps<T>
  extends MultipleSelectionStateProps,
    Sortable {
  children?: unknown;
  disabledKeys?: Iterable<Key>;
  collection?: ITableCollection<T>;
  showSelectionCheckboxes?: boolean;
  showDragButtons?: boolean;
  UNSAFE_selectionState?: MultipleSelectionState;
}

const OPPOSITE_SORT_DIRECTION: Record<SortDirection, SortDirection> = {
  ascending: "descending",
  descending: "ascending",
};

export function useTableState<T extends object>(
  props: TableStateProps<T>
): TableState<T> {
  const isKeyboardNavigationDisabledRef = ref(false);
  const selectionMode = computed<SelectionMode>(
    () => props.selectionMode ?? "none"
  );

  const context = computed<CollectionBuilderContext<T>>(() => ({
    showSelectionCheckboxes:
      !!props.showSelectionCheckboxes && selectionMode.value !== "none",
    showDragButtons: !!props.showDragButtons,
    selectionMode: selectionMode.value,
    columns: [],
  }));

  const collectionRef = computed<ITableCollection<T>>(
    () => props.collection ?? new TableCollection<T>([], null, context.value)
  );

  const gridState = useGridState<T, ITableCollection<T>>({
    ...props,
    get collection() {
      return collectionRef.value;
    },
    disabledBehavior: props.disabledBehavior || "selection",
  });

  return {
    get collection() {
      return collectionRef.value;
    },
    get disabledKeys() {
      return gridState.disabledKeys;
    },
    get selectionManager() {
      return gridState.selectionManager;
    },
    get showSelectionCheckboxes() {
      return props.showSelectionCheckboxes || false;
    },
    get sortDescriptor() {
      return props.sortDescriptor ?? null;
    },
    get isKeyboardNavigationDisabled() {
      return collectionRef.value.size === 0 || isKeyboardNavigationDisabledRef.value;
    },
    setKeyboardNavigationDisabled(val: boolean) {
      isKeyboardNavigationDisabledRef.value = val;
    },
    sort(columnKey: Key, direction?: SortDirection) {
      props.onSortChange?.({
        column: columnKey,
        direction:
          direction
          ?? (props.sortDescriptor?.column === columnKey
            ? OPPOSITE_SORT_DIRECTION[props.sortDescriptor.direction]
            : "ascending"),
      });
    },
  };
}

export function UNSTABLE_useFilteredTableState<T extends object>(
  state: TableState<T>,
  filterFn: ((nodeValue: string, node: GridNode<T>) => boolean) | null | undefined
): TableState<T> {
  const collection = filterFn
    ? state.collection.filter?.(filterFn) ?? state.collection
    : state.collection;
  const selectionManager = state.selectionManager.withCollection(
    collection as any
  );

  return {
    ...state,
    collection,
    selectionManager,
  };
}
