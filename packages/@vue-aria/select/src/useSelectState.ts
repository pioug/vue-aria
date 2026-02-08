import { computed, ref, toValue } from "vue";
import { useListBoxState } from "@vue-aria/listbox";
import type { Key, MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { ListBoxItem, UseListBoxStateResult } from "@vue-aria/listbox";

export type FocusStrategy = "first" | "last" | null;

export interface UseSelectStateOptions<T extends ListBoxItem = ListBoxItem> {
  collection?: MaybeReactive<Iterable<T> | undefined>;
  selectedKey?: MaybeReactive<Key | null | undefined>;
  defaultSelectedKey?: MaybeReactive<Key | null | undefined>;
  onSelectionChange?: (key: Key | null) => void;
  isOpen?: MaybeReactive<boolean | undefined>;
  defaultOpen?: MaybeReactive<boolean | undefined>;
  onOpenChange?: (isOpen: boolean) => void;
  allowsEmptyCollection?: MaybeReactive<boolean | undefined>;
}

export interface UseSelectStateResult<T extends ListBoxItem = ListBoxItem>
  extends UseListBoxStateResult<T> {
  isOpen: ReadonlyRef<boolean>;
  focusStrategy: ReadonlyRef<FocusStrategy>;
  selectedKey: ReadonlyRef<Key | null>;
  selectedItem: ReadonlyRef<T | null>;
  value: ReadonlyRef<Key | null>;
  defaultSelectedKey: ReadonlyRef<Key | null>;
  isFocused: ReadonlyRef<boolean>;
  setFocused: (isFocused: boolean) => void;
  setSelectedKey: (key: Key | null) => void;
  open: (focusStrategy?: FocusStrategy) => void;
  close: () => void;
  toggle: (focusStrategy?: FocusStrategy) => void;
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

function resolveKey(value: MaybeReactive<Key | null | undefined> | undefined): Key | null {
  if (value === undefined) {
    return null;
  }

  return toValue(value) ?? null;
}

export function useSelectState<T extends ListBoxItem>(
  options: UseSelectStateOptions<T> = {}
): UseSelectStateResult<T> {
  const isControlledOpen = computed(() => options.isOpen !== undefined);
  const uncontrolledOpen = ref(resolveBoolean(options.defaultOpen));
  const isOpen = computed(() => {
    if (isControlledOpen.value) {
      return resolveBoolean(options.isOpen);
    }

    return uncontrolledOpen.value;
  });

  const setOpen = (nextOpen: boolean) => {
    if (!isControlledOpen.value) {
      uncontrolledOpen.value = nextOpen;
    }

    options.onOpenChange?.(nextOpen);
  };

  const focusStrategy = ref<FocusStrategy>(null);
  const isFocused = ref(false);

  const controlledSelectedKeys =
    options.selectedKey === undefined
      ? undefined
      : computed(() => {
          const key = resolveKey(options.selectedKey);
          return key === null ? [] : [key];
        });

  const defaultSelectedKeys =
    options.defaultSelectedKey === undefined
      ? undefined
      : computed(() => {
          const key = resolveKey(options.defaultSelectedKey);
          return key === null ? [] : [key];
        });

  const state = useListBoxState({
    collection: options.collection,
    selectionMode: "single",
    selectedKeys: controlledSelectedKeys,
    defaultSelectedKeys,
    onSelectionChange: (keys) => {
      const key = keys.values().next().value ?? null;
      options.onSelectionChange?.(key);
      setOpen(false);
    },
  });

  const selectedKey = computed<Key | null>(
    () => state.selectedKeys.value.values().next().value ?? null
  );
  const selectedItem = computed<T | null>(() => {
    if (selectedKey.value === null) {
      return null;
    }

    return state.getItem(selectedKey.value) ?? null;
  });
  const defaultSelectedKey = computed<Key | null>(() =>
    resolveKey(options.defaultSelectedKey)
  );
  const value = computed<Key | null>(() => selectedKey.value);

  const setSelectedKey = (key: Key | null) => {
    if (key === null) {
      state.setSelectedKeys(new Set());
      return;
    }

    state.setSelectedKeys(new Set([key]));
  };

  const open = (nextFocusStrategy: FocusStrategy = null) => {
    if (
      !resolveBoolean(options.allowsEmptyCollection) &&
      state.collection.value.length === 0
    ) {
      return;
    }

    focusStrategy.value = nextFocusStrategy;
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
  };

  const toggle = (nextFocusStrategy: FocusStrategy = null) => {
    if (isOpen.value) {
      close();
      return;
    }

    open(nextFocusStrategy);
  };

  const setFocused = (nextFocused: boolean) => {
    isFocused.value = nextFocused;
    state.setFocused(nextFocused);
  };

  return {
    ...state,
    isOpen,
    focusStrategy,
    selectedKey,
    selectedItem,
    value,
    defaultSelectedKey,
    isFocused,
    setFocused,
    setSelectedKey,
    open,
    close,
    toggle,
  };
}
