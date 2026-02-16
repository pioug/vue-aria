import { useControlledState } from "@vue-stately/utils";
import {
  SelectionManager,
  useMultipleSelectionState,
  type DisabledBehavior,
  type Key,
  type MultipleSelectionManager,
  type MultipleSelectionStateProps,
} from "@vue-stately/selection";
import type { Node } from "@vue-aria/collections";
import { computed, watchEffect } from "vue";
import { TreeCollection, type TreeCollectionType } from "./TreeCollection";

type TreeNodeInput<T extends object> = T | Node<T>;

export interface TreeProps<T extends object> extends MultipleSelectionStateProps {
  /** Optional iterable collection nodes (Vue-friendly parity path). */
  collection?: Iterable<Node<T>> | TreeCollectionType<T>;
  /** Optional iterable children fallback. */
  children?: Iterable<Node<T>>;
  /** Optional item data source for collection-building parity. */
  items?: Iterable<TreeNodeInput<T>>;
  /** Optional key extractor for item data sources. */
  getKey?: (item: T) => Key;
  /** Optional text extractor for item data sources. */
  getTextValue?: (item: T) => string;
  /** Optional child extractor for nested item data sources. */
  getChildren?: (item: T) => Iterable<TreeNodeInput<T>> | undefined;
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

function isNodeLike<T extends object>(item: TreeNodeInput<T>): item is Node<T> {
  return typeof item === "object" && item != null && "type" in item && "key" in item && "textValue" in item;
}

function defaultGetKey<T extends object>(item: T, index: number, parentKey: Key | null): Key {
  if (typeof item === "object" && item != null) {
    const keyLike = (item as { key?: Key; id?: Key }).key ?? (item as { id?: Key }).id;
    if (keyLike != null) {
      return keyLike;
    }
  }

  return parentKey != null ? `${parentKey}.${index}` : index;
}

function defaultGetTextValue<T extends object>(item: T, key: Key): string {
  if (typeof item === "object" && item != null) {
    const text =
      (item as { textValue?: string; label?: string; name?: string }).textValue
      ?? (item as { label?: string }).label
      ?? (item as { name?: string }).name;
    if (text != null) {
      return String(text);
    }
  }

  return String(key);
}

function normalizeTreeItems<T extends object>(
  props: TreeProps<T>,
  source: Iterable<TreeNodeInput<T>>,
  parentKey: Key | null = null,
  level = 0
): Node<T>[] {
  const nodes: Node<T>[] = [];
  let index = 0;
  for (const item of source) {
    if (isNodeLike(item)) {
      nodes.push(item);
      index += 1;
      continue;
    }

    const key = props.getKey ? props.getKey(item) : defaultGetKey(item, index, parentKey);
    const textValue = props.getTextValue ? props.getTextValue(item) : defaultGetTextValue(item, key);
    const childItems = props.getChildren?.(item);
    const childNodes = childItems ? normalizeTreeItems(props, childItems, key, level + 1) : [];

    nodes.push({
      type: "item",
      key,
      value: item,
      level,
      hasChildNodes: childNodes.length > 0,
      rendered: textValue,
      textValue,
      index,
      parentKey,
      prevKey: null,
      nextKey: null,
      firstChildKey: childNodes[0]?.key ?? null,
      lastChildKey: childNodes[childNodes.length - 1]?.key ?? null,
      props: {},
      colSpan: null,
      colIndex: null,
      childNodes: childNodes,
    });
    index += 1;
  }

  return nodes;
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

    const nodes =
      (props.collection as Iterable<Node<T>> | undefined)
      ?? props.children
      ?? normalizeTreeItems(
        props,
        props.items ?? []
      );
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
