import { useControlledState } from "@vue-aria/utils-state";
import {
  SelectionManager,
  useMultipleSelectionState,
  type DisabledBehavior,
  type Key,
  type MultipleSelectionManager,
  type MultipleSelectionStateProps,
} from "@vue-aria/selection-state";
import type { Node } from "@vue-aria/collections";
import { computed, watchEffect } from "vue";
import { TreeCollection, type TreeCollectionType } from "./TreeCollection";

export interface TreeProps<T> extends MultipleSelectionStateProps {
  /** Optional iterable collection nodes (Vue-friendly parity path). */
  collection?: Iterable<Node<T>> | TreeCollectionType<T>;
  /** Optional iterable children fallback. */
  children?: Iterable<Node<T>>;
  /** Set of expanded item keys (controlled). */
  expandedKeys?: Iterable<Key>;
  /** Initial expanded item keys (uncontrolled). */
  defaultExpandedKeys?: Iterable<Key>;
  /** Called when expanded keys change. */
  onExpandedChange?: (keys: Set<Key>) => void;
  /** Whether disabled keys apply to all interactions or selection only. */
  disabledBehavior?: DisabledBehavior;
}

export interface TreeState<T> {
  /** A collection of visible items in the tree. */
  readonly collection: TreeCollectionType<T>;
  /** A set of keys for items that are disabled. */
  readonly disabledKeys: Set<Key>;
  /** A set of keys for items that are expanded. */
  readonly expandedKeys: Set<Key>;
  /** Toggles the expanded state for an item by key. */
  toggleKey(key: Key): void;
  /** Replaces the set of expanded keys. */
  setExpandedKeys(keys: Set<Key>): void;
  /** Multiple selection manager for tree items. */
  readonly selectionManager: MultipleSelectionManager;
}

function isCollectionLike<T>(
  value: unknown
): value is TreeCollectionType<T> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const collection = value as Record<string, unknown>;
  return (
    typeof collection.getItem === "function"
    && typeof collection.getFirstKey === "function"
    && typeof collection.getKeyAfter === "function"
    && typeof collection.getChildren === "function"
  );
}

function toggleExpanded(set: Set<Key>, key: Key): Set<Key> {
  const next = new Set(set);
  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }

  return next;
}

/**
 * Provides state management for tree-like components.
 * Handles expanded state and multiple selection state.
 */
export function useTreeState<T extends object>(props: TreeProps<T>): TreeState<T> {
  const [expandedKeysRef, setExpandedKeysState] = useControlledState<Set<Key>, Set<Key>>(
    () =>
      props.expandedKeys != null
        ? new Set(props.expandedKeys)
        : undefined,
    () =>
      props.defaultExpandedKeys != null
        ? new Set(props.defaultExpandedKeys)
        : new Set<Key>(),
    props.onExpandedChange
  );

  const selectionState = useMultipleSelectionState(props);

  const disabledKeysRef = computed(() =>
    props.disabledKeys ? new Set(props.disabledKeys) : new Set<Key>()
  );

  const treeRef = computed<TreeCollectionType<T>>(() => {
    if (props.collection && isCollectionLike<T>(props.collection)) {
      return props.collection;
    }

    const nodes = (props.collection as Iterable<Node<T>> | undefined)
      ?? props.children
      ?? [];
    return new TreeCollection(nodes, { expandedKeys: expandedKeysRef.value });
  });

  watchEffect(() => {
    if (
      selectionState.focusedKey != null
      && !treeRef.value.getItem(selectionState.focusedKey)
    ) {
      selectionState.setFocusedKey(null);
    }
  });

  const selectionManagerRef = computed(
    () =>
      new SelectionManager(
        treeRef.value as any,
        selectionState
      ) as MultipleSelectionManager
  );

  const setExpandedKeys = (keys: Set<Key>) => {
    setExpandedKeysState(keys);
  };

  const toggleKey = (key: Key) => {
    setExpandedKeysState((current) => toggleExpanded(current, key));
  };

  return {
    get collection() {
      return treeRef.value;
    },
    get disabledKeys() {
      return disabledKeysRef.value;
    },
    get expandedKeys() {
      return expandedKeysRef.value;
    },
    toggleKey,
    setExpandedKeys,
    get selectionManager() {
      return selectionManagerRef.value;
    },
  };
}
