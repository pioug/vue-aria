import { useControlledState } from "@vue-aria/utils-state";
import type { Key, Node } from "@vue-aria/collections";
import { useListState, type ListState } from "./useListState";
import { computed } from "vue";

export interface SingleSelectListProps<T> {
  selectedKey?: Key | null;
  defaultSelectedKey?: Key | null;
  onSelectionChange?: (key: Key | null) => void;
  collection?: ListState<T>["collection"];
  items?: Iterable<T | Node<T>>;
  getKey?: (item: T) => Key;
  getTextValue?: (item: T) => string;
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

  const selectedKeys = computed(() =>
    selectedKeyRef.value != null ? new Set<Key>([selectedKeyRef.value]) : new Set<Key>()
  );
  const listState = useListState({
    ...props,
    get collection() {
      return props.collection;
    },
    get items() {
      return props.items;
    },
    get disabledKeys() {
      return props.disabledKeys;
    },
    selectionMode: "single",
    disallowEmptySelection: true,
    allowDuplicateSelectionEvents: true,
    get selectedKeys() {
      return selectedKeys.value;
    },
    onSelectionChange: (keys: any) => {
      const key = keys.values().next().value ?? null;
      if (key === selectedKeyRef.value && props.onSelectionChange) {
        props.onSelectionChange(key);
      }

      setSelectedKey(key);
    },
  });

  return {
    get collection() {
      return listState.collection;
    },
    get disabledKeys() {
      return listState.disabledKeys;
    },
    get selectionManager() {
      return listState.selectionManager;
    },
    get selectedKey() {
      return selectedKeyRef.value;
    },
    setSelectedKey,
    get selectedItem() {
      return selectedKeyRef.value != null ? listState.collection.getItem(selectedKeyRef.value) : null;
    },
  };
}
