import { computed, toValue } from "vue";
import {
  useListBoxState,
  type ListBoxItem,
  type SelectionBehavior,
  type SelectionMode,
  type UseListBoxStateOptions,
} from "@vue-aria/listbox";
import type { Key, MaybeReactive, ReadonlyRef } from "@vue-aria/types";

export interface ListSelectionManager {
  selectionMode: ReadonlyRef<SelectionMode>;
  selectedKeys: ReadonlyRef<Set<Key>>;
  focusedKey: ReadonlyRef<Key | null>;
  isFocused: ReadonlyRef<boolean>;
  setFocused: (isFocused: boolean) => void;
  setFocusedKey: (key: Key | null) => void;
  isSelected: (key: Key) => boolean;
  isDisabled: (key: Key) => boolean;
  setSelectedKeys: (keys: Set<Key>) => void;
  select: (key: Key, behavior?: SelectionBehavior) => void;
}

export interface UseListStateOptions<T extends ListBoxItem = ListBoxItem>
  extends Omit<UseListBoxStateOptions<T>, "collection"> {
  collection?: MaybeReactive<Iterable<T> | undefined>;
  filter?: (collection: Iterable<T>) => Iterable<T>;
}

export interface UseListStateResult<T extends ListBoxItem = ListBoxItem> {
  collection: ReadonlyRef<T[]>;
  disabledKeys: ReadonlyRef<Set<Key>>;
  selectionManager: ListSelectionManager;
}

export function useListState<T extends ListBoxItem>(
  options: UseListStateOptions<T> = {}
): UseListStateResult<T> {
  const {
    filter,
    collection: inputCollection,
    ...listBoxOptions
  } = options;

  const filteredCollection = computed<Iterable<T> | undefined>(() => {
    if (inputCollection === undefined) {
      return undefined;
    }

    const resolvedCollection = toValue(inputCollection);
    if (resolvedCollection === undefined) {
      return undefined;
    }

    if (!filter) {
      return resolvedCollection;
    }

    return filter(resolvedCollection);
  });

  const state = useListBoxState<T>({
    ...listBoxOptions,
    collection: filteredCollection,
  });

  const selectionManager: ListSelectionManager = {
    selectionMode: state.selectionMode,
    selectedKeys: state.selectedKeys,
    focusedKey: state.focusedKey,
    isFocused: state.isFocused,
    setFocused: state.setFocused,
    setFocusedKey: state.setFocusedKey,
    isSelected: state.isSelected,
    isDisabled: state.isDisabledKey,
    setSelectedKeys: state.setSelectedKeys,
    select: state.selectKey,
  };

  return {
    collection: state.collection,
    disabledKeys: state.disabledKeys,
    selectionManager,
  };
}
