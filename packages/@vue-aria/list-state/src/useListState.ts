import { SelectionManager, useMultipleSelectionState, type MultipleSelectionStateProps } from "@vue-aria/selection-state";
import type { Key, Node } from "@vue-aria/collections";
import type { LayoutDelegate } from "@vue-aria/selection";
import type { Collection } from "@vue-aria/selection-state";
import { ListCollection } from "./ListCollection";

export interface ListProps<T> extends MultipleSelectionStateProps {
  collection?: Collection<Node<T>>;
  items?: Iterable<Node<T>>;
  filter?: (nodes: Iterable<Node<T>>) => Iterable<Node<T>>;
  suppressTextValueWarning?: boolean;
  layoutDelegate?: LayoutDelegate;
}

export interface ListState<T> {
  collection: Collection<Node<T>>;
  disabledKeys: Set<Key>;
  selectionManager: SelectionManager;
}

export function useListState<T extends object>(props: ListProps<T>): ListState<T> {
  const { filter, layoutDelegate } = props;
  const selectionState = useMultipleSelectionState(props);
  const disabledKeys = props.disabledKeys ? new Set(props.disabledKeys) : new Set<Key>();

  const baseCollection =
    props.collection ?? new ListCollection<T>(props.items ?? ([] as unknown as Iterable<Node<T>>));
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
