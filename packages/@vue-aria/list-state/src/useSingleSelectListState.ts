import { useControlledState } from "@vue-aria/utils-state";
import type { Key, Node } from "@vue-aria/collections";
import { useListState, type ListState } from "./useListState";

export interface SingleSelectListProps<T> {
  selectedKey?: Key | null;
  defaultSelectedKey?: Key | null;
  onSelectionChange?: (key: Key | null) => void;
  collection?: ListState<T>["collection"];
  items?: Iterable<Node<T>>;
  disabledKeys?: Iterable<Key>;
}

export interface SingleSelectListState<T> extends ListState<T> {
  readonly selectedKey: Key | null;
  setSelectedKey(key: Key | null): void;
  readonly selectedItem: Node<T> | null;
}

export function useSingleSelectListState<T extends object>(
  props: SingleSelectListProps<T>
): SingleSelectListState<T> {
  const [selectedKeyRef, setSelectedKey] = useControlledState<Key | null, Key | null>(
    () => props.selectedKey,
    () => props.defaultSelectedKey ?? null,
    props.onSelectionChange
  );

  const selectedKeys = selectedKeyRef.value != null ? new Set<Key>([selectedKeyRef.value]) : new Set<Key>();
  const { collection, disabledKeys, selectionManager } = useListState({
    ...props,
    selectionMode: "single",
    disallowEmptySelection: true,
    allowDuplicateSelectionEvents: true,
    selectedKeys,
    onSelectionChange: (keys: any) => {
      const key = keys.values().next().value ?? null;
      if (key === selectedKeyRef.value && props.onSelectionChange) {
        props.onSelectionChange(key);
      }

      setSelectedKey(key);
    },
  });

  return {
    collection,
    disabledKeys,
    selectionManager,
    get selectedKey() {
      return selectedKeyRef.value;
    },
    setSelectedKey,
    get selectedItem() {
      return selectedKeyRef.value != null ? collection.getItem(selectedKeyRef.value) : null;
    },
  };
}
