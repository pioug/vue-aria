import { SelectionManager, useMultipleSelectionState, type MultipleSelectionStateProps } from "@vue-aria/selection-state";
import type { Key, Node } from "@vue-aria/collections";
import type { LayoutDelegate } from "@vue-aria/selection";
import type { Collection } from "@vue-aria/selection-state";
import { ListCollection } from "./ListCollection";

export interface ListProps<T> extends MultipleSelectionStateProps {
  collection?: Collection<Node<T>>;
  items?: Iterable<T | Node<T>>;
  getKey?: (item: T) => Key;
  getTextValue?: (item: T) => string;
  filter?: (nodes: Iterable<Node<T>>) => Iterable<Node<T>>;
  suppressTextValueWarning?: boolean;
  layoutDelegate?: LayoutDelegate;
}

export interface ListState<T> {
  collection: Collection<Node<T>>;
  disabledKeys: Set<Key>;
  selectionManager: SelectionManager;
}

function isNode<T>(item: T | Node<T>): item is Node<T> {
  return typeof item === "object" && item != null && "key" in item && "type" in item && "textValue" in item;
}

function defaultGetKey<T>(item: T, index: number): Key {
  if (typeof item === "object" && item != null) {
    const keyLike = (item as { key?: Key; id?: Key }).key ?? (item as { id?: Key }).id;
    if (keyLike != null) {
      return keyLike;
    }
  }

  return index;
}

function defaultGetTextValue<T>(item: T, key: Key): string {
  if (typeof item === "string") {
    return item;
  }

  if (typeof item === "object" && item != null) {
    const text =
      (item as { textValue?: string; label?: string; name?: string }).textValue ??
      (item as { label?: string }).label ??
      (item as { name?: string }).name;
    if (text != null) {
      return String(text);
    }
  }

  return String(key);
}

function normalizeItems<T extends object>(props: ListProps<T>): Iterable<Node<T>> {
  const source = props.items ?? [];
  const nodes: Node<T>[] = [];
  let index = 0;
  for (const item of source) {
    if (isNode(item)) {
      nodes.push(item);
      index += 1;
      continue;
    }

    const key = props.getKey ? props.getKey(item) : defaultGetKey(item, index);
    const textValue = props.getTextValue ? props.getTextValue(item) : defaultGetTextValue(item, key);
    nodes.push({
      type: "item",
      key,
      value: item,
      level: 0,
      hasChildNodes: false,
      rendered: textValue,
      textValue,
      index,
      parentKey: null,
      prevKey: null,
      nextKey: null,
      firstChildKey: null,
      lastChildKey: null,
      props: {},
      colSpan: null,
      colIndex: null,
      childNodes: [],
    });
    index += 1;
  }

  return nodes;
}

export function useListState<T extends object>(props: ListProps<T>): ListState<T> {
  const { filter, layoutDelegate } = props;
  const selectionState = useMultipleSelectionState(props);
  const disabledKeys = props.disabledKeys ? new Set(props.disabledKeys) : new Set<Key>();

  const baseCollection = props.collection ?? new ListCollection<T>(normalizeItems(props));
  const collection = filter
    ? new ListCollection<T>(filter(baseCollection as unknown as Iterable<Node<T>>))
    : baseCollection;

  const selectionManager = new SelectionManager(collection as Collection<Node<unknown>>, selectionState, {
    layoutDelegate: layoutDelegate as any,
  });

  return {
    collection,
    disabledKeys,
    selectionManager,
  };
}

export function UNSTABLE_useFilteredListState<T extends object>(
  state: ListState<T>,
  filterFn: ((nodeValue: string, node: Node<T>) => boolean) | null | undefined
): ListState<T> {
  if (!filterFn) {
    return state;
  }

  const nodes: Node<T>[] = [];
  const collection = state.collection as any;
  for (const key of collection.getKeys()) {
    const node = collection.getItem(key) as Node<T> | null;
    if (node && filterFn(node.textValue, node)) {
      nodes.push(node);
    }
  }

  const filteredCollection = new ListCollection<T>(nodes);
  const selectionManager = state.selectionManager.withCollection(
    filteredCollection as unknown as Collection<Node<unknown>>
  );

  return {
    collection: filteredCollection,
    selectionManager,
    disabledKeys: state.disabledKeys,
  };
}
