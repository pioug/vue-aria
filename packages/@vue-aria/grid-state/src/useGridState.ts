import type { Key, FocusStrategy, MultipleSelectionState, MultipleSelectionStateProps } from "@vue-stately/selection";
import { SelectionManager, useMultipleSelectionState } from "@vue-stately/selection";
import { computed, ref, watch } from "vue";
import type { GridCollectionType, GridNode } from "./GridCollection";

export interface GridState<T, C extends GridCollectionType<T>> {
  readonly collection: C;
  readonly disabledKeys: Set<Key>;
  readonly selectionManager: SelectionManager;
  readonly isKeyboardNavigationDisabled: boolean;
}

export interface GridStateOptions<T, C extends GridCollectionType<T>>
  extends MultipleSelectionStateProps {
  collection: C;
  disabledKeys?: Iterable<Key>;
  focusMode?: "row" | "cell";
  UNSAFE_selectionState?: MultipleSelectionState;
}

function getChildNodes<T>(
  item: GridNode<T>,
  collection: GridCollectionType<T>
): Iterable<GridNode<T>> {
  return collection.getChildren(item.key);
}

function getFirstItem<T>(iterable: Iterable<GridNode<T>>): GridNode<T> | null {
  for (const item of iterable) {
    return item;
  }

  return null;
}

function getLastItem<T>(iterable: Iterable<GridNode<T>>): GridNode<T> | null {
  let last: GridNode<T> | null = null;
  for (const item of iterable) {
    last = item;
  }

  return last;
}

export function useGridState<T extends object, C extends GridCollectionType<T>>(
  props: GridStateOptions<T, C>
): GridState<T, C> {
  const { focusMode } = props;
  const selectionState =
    props.UNSAFE_selectionState || useMultipleSelectionState(props);
  const disabledKeysRef = computed(() =>
    props.disabledKeys ? new Set(props.disabledKeys) : new Set<Key>()
  );

  const setFocusedKey = selectionState.setFocusedKey.bind(selectionState);
  selectionState.setFocusedKey = (
    key: Key | null,
    child: FocusStrategy = "first"
  ) => {
    if (focusMode === "cell" && key != null) {
      const item = props.collection.getItem(key);
      if (item?.type === "item") {
        const children = getChildNodes(item as GridNode<T>, props.collection);
        if (child === "last") {
          key = getLastItem(children)?.key ?? null;
        } else {
          key = getFirstItem(children)?.key ?? null;
        }
      }
    }

    setFocusedKey(key, child);
  };

  const selectionManagerRef = computed(
    () => new SelectionManager(props.collection as any, selectionState)
  );

  const cachedCollection = ref<C | null>(null);
  watch(
    () => [props.collection, selectionState.focusedKey] as const,
    ([collection]) => {
      if (
        selectionState.focusedKey != null
        && cachedCollection.value
        && !collection.getItem(selectionState.focusedKey)
      ) {
        const node = cachedCollection.value.getItem(selectionState.focusedKey);
        const parentNode =
          node?.parentKey != null
          && (node.type === "cell"
            || node.type === "rowheader"
            || node.type === "column")
            ? cachedCollection.value.getItem(node.parentKey)
            : node;
        if (!parentNode) {
          selectionState.setFocusedKey(null);
          cachedCollection.value = collection;
          return;
        }
        const cachedRows = cachedCollection.value.rows;
        const rows = collection.rows;
        const diff = cachedRows.length - rows.length;
        let index = Math.min(
          diff > 1 ? Math.max(parentNode.index - diff + 1, 0) : parentNode.index,
          rows.length - 1
        );
        let newRow: GridNode<T> | null = null;
        while (index >= 0) {
          if (
            !selectionManagerRef.value.isDisabled(rows[index].key)
            && rows[index].type !== "headerrow"
          ) {
            newRow = rows[index];
            break;
          }

          if (index < rows.length - 1) {
            index++;
          } else {
            if (index > parentNode.index) {
              index = parentNode.index;
            }
            index--;
          }
        }
        if (newRow) {
          const childNodes = newRow.hasChildNodes
            ? [...getChildNodes(newRow, collection)]
            : [];
          const keyToFocus =
            newRow.hasChildNodes
            && parentNode !== node
            && node
            && node.index < childNodes.length
              ? childNodes[node.index].key
              : newRow.key;
          selectionState.setFocusedKey(keyToFocus);
        } else {
          selectionState.setFocusedKey(null);
        }
      }
      cachedCollection.value = collection;
    },
    { immediate: true }
  );

  return {
    get collection() {
      return props.collection;
    },
    get disabledKeys() {
      return disabledKeysRef.value;
    },
    get isKeyboardNavigationDisabled() {
      return false;
    },
    get selectionManager() {
      return selectionManagerRef.value;
    },
  };
}
