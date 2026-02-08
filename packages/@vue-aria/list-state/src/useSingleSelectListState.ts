import { computed, ref, toValue } from "vue";
import type { Key, MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { ListBoxItem } from "@vue-aria/listbox";
import { useListState, type UseListStateOptions, type UseListStateResult } from "./useListState";

export interface UseSingleSelectListStateOptions<T extends ListBoxItem = ListBoxItem>
  extends Omit<
    UseListStateOptions<T>,
    "selectionMode" | "selectedKeys" | "defaultSelectedKeys" | "onSelectionChange"
  > {
  selectedKey?: MaybeReactive<Key | null | undefined>;
  defaultSelectedKey?: MaybeReactive<Key | null | undefined>;
  onSelectionChange?: (key: Key | null) => void;
}

export interface UseSingleSelectListStateResult<T extends ListBoxItem = ListBoxItem>
  extends UseListStateResult<T> {
  selectedKey: ReadonlyRef<Key | null>;
  selectedItem: ReadonlyRef<T | null>;
  setSelectedKey: (key: Key | null) => void;
}

function resolveKey(value: MaybeReactive<Key | null | undefined> | undefined): Key | null {
  if (value === undefined) {
    return null;
  }

  return toValue(value) ?? null;
}

export function useSingleSelectListState<T extends ListBoxItem>(
  options: UseSingleSelectListStateOptions<T> = {}
): UseSingleSelectListStateResult<T> {
  const isControlled = computed(() => options.selectedKey !== undefined);
  const uncontrolledSelectedKey = ref<Key | null>(
    resolveKey(options.defaultSelectedKey)
  );

  const selectedKey = computed<Key | null>(() => {
    if (isControlled.value) {
      return resolveKey(options.selectedKey);
    }

    return uncontrolledSelectedKey.value;
  });

  const setSelectedKey = (key: Key | null): void => {
    if (!isControlled.value) {
      uncontrolledSelectedKey.value = key;
    }

    options.onSelectionChange?.(key);
  };

  const listState = useListState<T>({
    collection: options.collection,
    filter: options.filter,
    disabledKeys: options.disabledKeys,
    isDisabled: options.isDisabled,
    selectionMode: "single",
    selectedKeys: computed(() => {
      if (selectedKey.value === null) {
        return [];
      }

      return [selectedKey.value];
    }),
    onSelectionChange: (keys) => {
      const nextKey = keys.values().next().value ?? null;
      setSelectedKey(nextKey);
    },
  });

  const selectedItem = computed<T | null>(() => {
    if (selectedKey.value === null) {
      return null;
    }

    return (
      listState.collection.value.find((item) => item.key === selectedKey.value) ??
      null
    );
  });

  return {
    ...listState,
    selectedKey,
    selectedItem,
    setSelectedKey,
  };
}
