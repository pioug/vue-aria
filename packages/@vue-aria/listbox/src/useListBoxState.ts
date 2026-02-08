import { computed, ref, toValue, watchEffect } from "vue";
import type { Key, MaybeReactive, ReadonlyRef } from "@vue-aria/types";

export type SelectionMode = "none" | "single" | "multiple";
export type SelectionBehavior = "toggle" | "replace";

export interface ListBoxItem {
  key: Key;
  isDisabled?: boolean;
  textValue?: string;
}

export interface UseListBoxStateOptions<T extends ListBoxItem = ListBoxItem> {
  collection?: MaybeReactive<Iterable<T> | undefined>;
  selectionMode?: MaybeReactive<SelectionMode | undefined>;
  disallowEmptySelection?: MaybeReactive<boolean | undefined>;
  selectedKeys?: MaybeReactive<Iterable<Key> | undefined>;
  defaultSelectedKeys?: MaybeReactive<Iterable<Key> | undefined>;
  disabledKeys?: MaybeReactive<Iterable<Key> | undefined>;
  isDisabled?: MaybeReactive<boolean | undefined>;
  onSelectionChange?: (keys: Set<Key>) => void;
}

export interface UseListBoxStateResult<T extends ListBoxItem = ListBoxItem> {
  collection: ReadonlyRef<T[]>;
  selectionMode: ReadonlyRef<SelectionMode>;
  disallowEmptySelection: ReadonlyRef<boolean>;
  selectedKeys: ReadonlyRef<Set<Key>>;
  disabledKeys: ReadonlyRef<Set<Key>>;
  isDisabled: ReadonlyRef<boolean>;
  focusedKey: ReadonlyRef<Key | null>;
  isFocused: ReadonlyRef<boolean>;
  setFocused: (isFocused: boolean) => void;
  setFocusedKey: (key: Key | null) => void;
  isSelected: (key: Key) => boolean;
  isDisabledKey: (key: Key) => boolean;
  setSelectedKeys: (keys: Set<Key>) => void;
  selectKey: (key: Key, behavior?: SelectionBehavior) => void;
  getItem: (key: Key) => T | undefined;
  getFirstKey: () => Key | null;
  getLastKey: () => Key | null;
  getKeyAfter: (key: Key) => Key | null;
  getKeyBefore: (key: Key) => Key | null;
  getItemIndex: (key: Key) => number;
  registerOption: (key: Key, element: HTMLElement) => void;
  unregisterOption: (key: Key, element?: HTMLElement) => void;
  getOptionElement: (key: Key) => HTMLElement | undefined;
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

function resolveSelectionMode(
  value: MaybeReactive<SelectionMode | undefined> | undefined
): SelectionMode {
  if (value === undefined) {
    return "none";
  }

  return toValue(value) ?? "none";
}

function resolveSelectedKeys(
  value: MaybeReactive<Iterable<Key> | undefined> | undefined
): Set<Key> {
  if (value === undefined) {
    return new Set();
  }

  return new Set(toValue(value) ?? []);
}

function toCollectionArray<T extends ListBoxItem>(
  collection: Iterable<T> | undefined
): T[] {
  if (!collection) {
    return [];
  }

  return Array.from(collection);
}

function normalizeSelectedKeys(
  keys: Set<Key>,
  mode: SelectionMode
): Set<Key> {
  if (mode === "none") {
    return new Set();
  }

  if (mode === "single" && keys.size > 1) {
    const first = keys.values().next().value;
    return first === undefined ? new Set() : new Set([first]);
  }

  return new Set(keys);
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

export function useListBoxState<T extends ListBoxItem>(
  options: UseListBoxStateOptions<T> = {}
): UseListBoxStateResult<T> {
  const collection = computed<T[]>(() => {
    if (options.collection === undefined) {
      return [];
    }

    return toCollectionArray(toValue(options.collection));
  });
  const selectionMode = computed(() => resolveSelectionMode(options.selectionMode));
  const disallowEmptySelection = computed(() =>
    resolveBoolean(options.disallowEmptySelection)
  );
  const disabledKeys = computed(() => resolveSelectedKeys(options.disabledKeys));
  const isDisabled = computed(() => resolveBoolean(options.isDisabled));
  const isControlled = computed(() => options.selectedKeys !== undefined);
  const optionElements = new Map<Key, HTMLElement>();

  const uncontrolledSelectedKeys = ref<Set<Key>>(
    normalizeSelectedKeys(
      resolveSelectedKeys(options.defaultSelectedKeys),
      selectionMode.value
    )
  );
  const focusedKey = ref<Key | null>(null);
  const isFocused = ref(false);

  const selectedKeys = computed<Set<Key>>(() => {
    const resolved = isControlled.value
      ? resolveSelectedKeys(options.selectedKeys)
      : uncontrolledSelectedKeys.value;
    return normalizeSelectedKeys(resolved, selectionMode.value);
  });

  const getItem = (key: Key): T | undefined =>
    collection.value.find((item) => item.key === key);

  const getFirstKey = (): Key | null => collection.value[0]?.key ?? null;

  const getLastKey = (): Key | null =>
    collection.value[collection.value.length - 1]?.key ?? null;

  const getItemIndex = (key: Key): number =>
    collection.value.findIndex((item) => item.key === key);

  const getKeyAfter = (key: Key): Key | null => {
    const index = getItemIndex(key);
    if (index < 0 || index + 1 >= collection.value.length) {
      return null;
    }

    return collection.value[index + 1]?.key ?? null;
  };

  const getKeyBefore = (key: Key): Key | null => {
    const index = getItemIndex(key);
    if (index <= 0) {
      return null;
    }

    return collection.value[index - 1]?.key ?? null;
  };

  const isDisabledKey = (key: Key): boolean => {
    if (isDisabled.value) {
      return true;
    }

    const item = getItem(key);
    return disabledKeys.value.has(key) || Boolean(item?.isDisabled);
  };

  const setSelectedKeys = (keys: Set<Key>) => {
    const normalized = normalizeSelectedKeys(keys, selectionMode.value);
    if (
      disallowEmptySelection.value &&
      normalized.size === 0 &&
      selectedKeys.value.size > 0
    ) {
      return;
    }

    if (!isControlled.value) {
      uncontrolledSelectedKeys.value = normalized;
    }

    options.onSelectionChange?.(normalized);
  };

  const selectKey = (key: Key, behavior: SelectionBehavior = "replace") => {
    if (selectionMode.value === "none" || isDisabledKey(key)) {
      return;
    }

    if (selectionMode.value === "single" || behavior === "replace") {
      setSelectedKeys(new Set([key]));
      return;
    }

    const next = new Set(selectedKeys.value);
    if (next.has(key)) {
      if (disallowEmptySelection.value && next.size === 1) {
        return;
      }
      next.delete(key);
    } else {
      next.add(key);
    }
    setSelectedKeys(next);
  };

  watchEffect(() => {
    if (isControlled.value) {
      return;
    }

    const validKeys = new Set(collection.value.map((item) => item.key));
    const next = new Set<Key>();
    for (const key of selectedKeys.value) {
      if (validKeys.has(key)) {
        next.add(key);
      }
    }

    const normalized = normalizeSelectedKeys(next, selectionMode.value);
    if (!isSameSet(normalized, uncontrolledSelectedKeys.value)) {
      uncontrolledSelectedKeys.value = normalized;
    }
  });

  watchEffect(() => {
    if (focusedKey.value === null) {
      return;
    }

    if (!collection.value.some((item) => item.key === focusedKey.value)) {
      focusedKey.value = null;
    }
  });

  watchEffect(() => {
    if (focusedKey.value !== null) {
      return;
    }

    const firstSelected = selectedKeys.value.values().next().value;
    if (firstSelected !== undefined) {
      focusedKey.value = firstSelected;
      return;
    }

    focusedKey.value = getFirstKey();
  });

  return {
    collection,
    selectionMode,
    disallowEmptySelection,
    selectedKeys,
    disabledKeys,
    isDisabled,
    focusedKey,
    isFocused,
    setFocused: (nextFocused) => {
      isFocused.value = nextFocused;
    },
    setFocusedKey: (key) => {
      focusedKey.value = key;
    },
    isSelected: (key) => selectedKeys.value.has(key),
    isDisabledKey,
    setSelectedKeys,
    selectKey,
    getItem,
    getFirstKey,
    getLastKey,
    getKeyAfter,
    getKeyBefore,
    getItemIndex,
    registerOption: (key, element) => {
      optionElements.set(key, element);
    },
    unregisterOption: (key, element) => {
      const current = optionElements.get(key);
      if (!current) {
        return;
      }

      if (!element || current === element) {
        optionElements.delete(key);
      }
    },
    getOptionElement: (key) => optionElements.get(key),
  };
}
