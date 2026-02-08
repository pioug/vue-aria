import { computed, ref, toValue, watchEffect } from "vue";
import {
  useMultipleSelectionState,
  type SelectionBehavior,
  type SelectionMode,
  type UseMultipleSelectionStateOptions,
} from "@vue-aria/selection-state";
import type { Key, MaybeReactive, ReadonlyRef } from "@vue-aria/types";

export type TreeNodeType = "item" | "section";

export interface TreeInputNode<T = unknown> {
  key: Key;
  type?: TreeNodeType;
  textValue?: string;
  value?: T;
  isDisabled?: boolean;
  children?: Iterable<TreeInputNode<T>>;
}

export interface TreeCollectionNode<T = unknown> {
  type: TreeNodeType;
  key: Key;
  textValue?: string;
  value?: T;
  isDisabled?: boolean;
  level: number;
  parentKey: Key | null;
  hasChildNodes: boolean;
  childKeys: readonly Key[];
  prevKey?: Key;
  nextKey?: Key;
}

export interface TreeCollection<T = unknown> {
  nodes: readonly TreeCollectionNode<T>[];
  visibleNodes: readonly TreeCollectionNode<T>[];
  getKeys: () => IterableIterator<Key>;
  getFirstKey: () => Key | null;
  getLastKey: () => Key | null;
  getKeyBefore: (key: Key) => Key | null;
  getKeyAfter: (key: Key) => Key | null;
  getItem: (key: Key) => TreeCollectionNode<T> | null;
  getNode: (key: Key) => TreeCollectionNode<T> | null;
  getChildren: (key: Key | null) => readonly TreeCollectionNode<T>[];
}

export interface TreeSelectionManager {
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

export interface UseTreeStateOptions<T = unknown>
  extends Omit<UseMultipleSelectionStateOptions, "disabledKeys"> {
  collection?: MaybeReactive<Iterable<TreeInputNode<T>> | undefined>;
  expandedKeys?: MaybeReactive<Iterable<Key> | undefined>;
  defaultExpandedKeys?: MaybeReactive<Iterable<Key> | undefined>;
  onExpandedChange?: (keys: Set<Key>) => void;
  disabledKeys?: MaybeReactive<Iterable<Key> | undefined>;
}

export interface UseTreeStateResult<T = unknown> {
  collection: ReadonlyRef<TreeCollection<T>>;
  disabledKeys: ReadonlyRef<Set<Key>>;
  expandedKeys: ReadonlyRef<Set<Key>>;
  toggleKey: (key: Key) => void;
  setExpandedKeys: (keys: Set<Key>) => void;
  selectionManager: TreeSelectionManager;
}

interface MutableTreeNode<T> extends TreeCollectionNode<T> {
  childNodes: MutableTreeNode<T>[];
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

function toCollectionArray<T>(collection: Iterable<TreeInputNode<T>> | undefined): TreeInputNode<T>[] {
  if (!collection) {
    return [];
  }

  return Array.from(collection);
}

function buildTreeCollection<T>(
  input: Iterable<TreeInputNode<T>> | undefined,
  expandedKeys: Set<Key>
): TreeCollection<T> {
  const rawNodes = toCollectionArray(input);
  const allNodeMap = new Map<Key, MutableTreeNode<T>>();

  const createNode = (
    rawNode: TreeInputNode<T>,
    level: number,
    parentKey: Key | null
  ): MutableTreeNode<T> => {
    if (allNodeMap.has(rawNode.key)) {
      throw new Error(`Duplicate tree key: ${String(rawNode.key)}`);
    }

    const node: MutableTreeNode<T> = {
      type: rawNode.type ?? "item",
      key: rawNode.key,
      textValue: rawNode.textValue,
      value: rawNode.value,
      isDisabled: rawNode.isDisabled,
      level,
      parentKey,
      hasChildNodes: false,
      childKeys: [],
      childNodes: [],
    };
    allNodeMap.set(node.key, node);

    const childNodes = toCollectionArray(rawNode.children).map((child) =>
      createNode(child, level + 1, node.key)
    );
    node.childNodes = childNodes;
    node.hasChildNodes = childNodes.length > 0;
    node.childKeys = childNodes.map((child) => child.key);

    return node;
  };

  const rootNodes = rawNodes.map((node) => createNode(node, 1, null));
  const visibleNodes: MutableTreeNode<T>[] = [];

  const visitVisibleNode = (node: MutableTreeNode<T>): void => {
    visibleNodes.push(node);
    if (node.childNodes.length === 0) {
      return;
    }

    if (node.type === "section" || expandedKeys.has(node.key)) {
      for (const childNode of node.childNodes) {
        visitVisibleNode(childNode);
      }
    }
  };

  for (const rootNode of rootNodes) {
    visitVisibleNode(rootNode);
  }

  for (let index = 0; index < visibleNodes.length; index += 1) {
    const previous = index > 0 ? visibleNodes[index - 1] : undefined;
    const current = visibleNodes[index];
    const next = index + 1 < visibleNodes.length ? visibleNodes[index + 1] : undefined;

    current.prevKey = previous?.key;
    current.nextKey = next?.key;
  }

  const visibleNodeMap = new Map<Key, MutableTreeNode<T>>(
    visibleNodes.map((node) => [node.key, node])
  );

  const asPublic = (node: MutableTreeNode<T>): TreeCollectionNode<T> => node;

  return {
    nodes: rootNodes.map(asPublic),
    visibleNodes: visibleNodes.map(asPublic),
    getKeys: () => visibleNodeMap.keys(),
    getFirstKey: () => visibleNodes[0]?.key ?? null,
    getLastKey: () => visibleNodes[visibleNodes.length - 1]?.key ?? null,
    getKeyBefore: (key) => visibleNodeMap.get(key)?.prevKey ?? null,
    getKeyAfter: (key) => visibleNodeMap.get(key)?.nextKey ?? null,
    getItem: (key) => {
      const node = visibleNodeMap.get(key);
      return node ? asPublic(node) : null;
    },
    getNode: (key) => {
      const node = allNodeMap.get(key);
      return node ? asPublic(node) : null;
    },
    getChildren: (key) => {
      if (key === null) {
        return rootNodes.map(asPublic);
      }

      const node = allNodeMap.get(key);
      if (!node) {
        return [];
      }

      return node.childNodes.map(asPublic);
    },
  };
}

function toggleKey(set: Set<Key>, key: Key): Set<Key> {
  const next = new Set(set);
  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }

  return next;
}

export function useTreeState<T = unknown>(
  options: UseTreeStateOptions<T> = {}
): UseTreeStateResult<T> {
  const isExpandedControlled = computed(() => options.expandedKeys !== undefined);
  const uncontrolledExpandedKeys = ref<Set<Key>>(
    resolveKeySet(options.defaultExpandedKeys)
  );
  const expandedKeys = computed<Set<Key>>(() => {
    if (isExpandedControlled.value) {
      return resolveKeySet(options.expandedKeys);
    }

    return uncontrolledExpandedKeys.value;
  });

  const setExpandedKeys = (keys: Set<Key>): void => {
    const nextKeys = new Set(keys);
    if (!isExpandedControlled.value) {
      uncontrolledExpandedKeys.value = nextKeys;
    }

    options.onExpandedChange?.(nextKeys);
  };

  const disabledKeys = computed(() => resolveKeySet(options.disabledKeys));
  const treeCollection = computed<TreeCollection<T>>(() =>
    buildTreeCollection(
      options.collection === undefined ? undefined : toValue(options.collection),
      expandedKeys.value
    )
  );

  const selectionState = useMultipleSelectionState({
    selectionMode: options.selectionMode,
    disallowEmptySelection: options.disallowEmptySelection,
    allowDuplicateSelectionEvents: options.allowDuplicateSelectionEvents,
    selectionBehavior: options.selectionBehavior,
    selectedKeys: options.selectedKeys,
    defaultSelectedKeys: options.defaultSelectedKeys,
    onSelectionChange: options.onSelectionChange,
    disabledKeys: options.disabledKeys,
    disabledBehavior: options.disabledBehavior,
  });

  watchEffect(() => {
    const focusedKey = selectionState.focusedKey.value;
    if (focusedKey === null) {
      return;
    }

    if (!treeCollection.value.getItem(focusedKey)) {
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
      if (treeCollection.value.getNode(key)) {
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

    return Boolean(treeCollection.value.getNode(key)?.isDisabled);
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

  const selectionManager: TreeSelectionManager = {
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

  const toggle = (key: Key): void => {
    setExpandedKeys(toggleKey(expandedKeys.value, key));
  };

  return {
    collection: treeCollection,
    disabledKeys,
    expandedKeys,
    toggleKey: toggle,
    setExpandedKeys,
    selectionManager,
  };
}
