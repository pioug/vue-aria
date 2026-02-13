import type { Key, Node } from "@vue-aria/collections";
import { useSingleSelectListState, type SingleSelectListState } from "@vue-aria/list-state";
import { ref, watchEffect } from "vue";

export interface TabListStateOptions<T> {
  items?: Iterable<T | Node<T>>;
  getKey?: (item: T) => Key;
  getTextValue?: (item: T) => string;
  selectedKey?: Key | null;
  defaultSelectedKey?: Key | null;
  onSelectionChange?: (key: Key) => void;
  disabledKeys?: Iterable<Key>;
  isDisabled?: boolean;
  collection?: SingleSelectListState<T>["collection"];
}

export interface TabListState<T> extends SingleSelectListState<T> {
  readonly isDisabled: boolean;
}

export function useTabListState<T extends object>(
  props: TabListStateOptions<T>
): TabListState<T> {
  const state = useSingleSelectListState<T>({
    ...props,
    onSelectionChange: props.onSelectionChange
      ? (key) => {
        if (key != null) {
          props.onSelectionChange?.(key);
        }
      }
      : undefined,
  });

  const lastSelectedKey = ref<Key | null>(state.selectedKey);
  watchEffect(() => {
    let selectedKey = state.selectedKey;
    if (
      props.selectedKey == null
      && (state.selectionManager.isEmpty
        || selectedKey == null
        || !state.collection.getItem(selectedKey))
    ) {
      selectedKey = findDefaultSelectedKey(state.collection as any, state.disabledKeys);
      if (selectedKey != null) {
        state.selectionManager.setSelectedKeys([selectedKey]);
      }
    }

    if (
      (selectedKey != null && state.selectionManager.focusedKey == null)
      || (!state.selectionManager.isFocused && selectedKey !== lastSelectedKey.value)
    ) {
      state.selectionManager.setFocusedKey(selectedKey);
    }

    lastSelectedKey.value = selectedKey;
  });

  return {
    ...state,
    get isDisabled() {
      return props.isDisabled || false;
    },
  };
}

function findDefaultSelectedKey<T>(
  collection: {
    getFirstKey(): Key | null;
    getLastKey(): Key | null;
    getKeyAfter(key: Key): Key | null;
    getItem(key: Key): { props?: { isDisabled?: boolean } } | null;
  },
  disabledKeys: Set<Key>
) {
  let selectedKey: Key | null = collection.getFirstKey();
  if (selectedKey == null) {
    return selectedKey;
  }

  while (
    selectedKey != null
    && (disabledKeys.has(selectedKey) || collection.getItem(selectedKey)?.props?.isDisabled)
    && selectedKey !== collection.getLastKey()
  ) {
    selectedKey = collection.getKeyAfter(selectedKey);
  }

  if (
    selectedKey != null
    && (disabledKeys.has(selectedKey) || collection.getItem(selectedKey)?.props?.isDisabled)
    && selectedKey === collection.getLastKey()
  ) {
    selectedKey = collection.getFirstKey();
  }

  return selectedKey;
}
