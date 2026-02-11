import { computed, ref, toValue, watch, watchEffect } from "vue";
import type { Key, MaybeReactive, ReadonlyRef } from "@vue-aria/types";

export interface TabListItem {
  key: Key;
  isDisabled?: boolean;
}

export interface UseTabListStateOptions<T extends TabListItem = TabListItem> {
  collection?: MaybeReactive<Iterable<T> | undefined>;
  selectedKey?: MaybeReactive<Key | null | undefined>;
  defaultSelectedKey?: MaybeReactive<Key | null | undefined>;
  disabledKeys?: MaybeReactive<Iterable<Key> | undefined>;
  isDisabled?: MaybeReactive<boolean | undefined>;
  onSelectionChange?: (key: Key) => void;
}

export interface UseTabListStateResult<T extends TabListItem = TabListItem> {
  collection: ReadonlyRef<T[]>;
  selectedKey: ReadonlyRef<Key | null>;
  disabledKeys: ReadonlyRef<Set<Key>>;
  isDisabled: ReadonlyRef<boolean>;
  focusedKey: ReadonlyRef<Key | null>;
  setSelectedKey: (key: Key) => void;
  setFocusedKey: (key: Key | null) => void;
  isKeyDisabled: (key: Key) => boolean;
  getItem: (key: Key) => T | undefined;
  getFirstKey: () => Key | null;
  getLastKey: () => Key | null;
  getKeyAfter: (key: Key) => Key | null;
  getKeyBefore: (key: Key) => Key | null;
  registerTab: (key: Key, element: HTMLElement) => void;
  unregisterTab: (key: Key, element?: HTMLElement) => void;
  getTabElement: (key: Key) => HTMLElement | undefined;
}

function toCollectionArray<T extends TabListItem>(
  collection: Iterable<T> | undefined
): T[] {
  if (!collection) {
    return [];
  }

  return Array.from(collection);
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

function resolveKey(
  value: MaybeReactive<Key | null | undefined> | undefined
): Key | null {
  if (value === undefined) {
    return null;
  }

  return toValue(value) ?? null;
}

function resolveDisabledKeys(
  value: MaybeReactive<Iterable<Key> | undefined> | undefined
): Set<Key> {
  if (value === undefined) {
    return new Set();
  }

  return new Set(toValue(value) ?? []);
}

function findDefaultSelectedKey<T extends TabListItem>(
  collection: T[],
  disabledKeys: Set<Key>
): Key | null {
  if (collection.length === 0) {
    return null;
  }

  let selectedKey: Key | null = collection[0]?.key ?? null;
  const lastKey = collection[collection.length - 1]?.key ?? null;

  while (selectedKey !== null) {
    const item = collection.find((entry) => entry.key === selectedKey);
    const isDisabled = disabledKeys.has(selectedKey) || Boolean(item?.isDisabled);
    if (!isDisabled) {
      break;
    }

    if (selectedKey === lastKey) {
      selectedKey = collection[0]?.key ?? null;
      break;
    }

    const index = collection.findIndex((entry) => entry.key === selectedKey);
    if (index < 0 || index + 1 >= collection.length) {
      selectedKey = null;
      break;
    }

    selectedKey = collection[index + 1]?.key ?? null;
  }

  return selectedKey;
}

export function useTabListState<T extends TabListItem>(
  options: UseTabListStateOptions<T> = {}
): UseTabListStateResult<T> {
  const collection = computed<T[]>(() => {
    if (options.collection === undefined) {
      return [];
    }

    return toCollectionArray(toValue(options.collection));
  });

  const disabledKeys = computed(() => resolveDisabledKeys(options.disabledKeys));
  const isDisabled = computed(() => resolveBoolean(options.isDisabled));
  const isControlled = computed(() => options.selectedKey !== undefined);
  const hasExplicitDefaultSelectedKey = computed(
    () => resolveKey(options.defaultSelectedKey) !== null
  );
  const tabElements = new Map<Key, HTMLElement>();

  const initialUncontrolledKey = (() => {
    const explicitDefault = resolveKey(options.defaultSelectedKey);
    if (explicitDefault !== null) {
      return explicitDefault;
    }

    return findDefaultSelectedKey(collection.value, disabledKeys.value);
  })();

  const uncontrolledSelectedKey = ref<Key | null>(initialUncontrolledKey);

  const selectedKey = computed<Key | null>(() => {
    if (isControlled.value) {
      return resolveKey(options.selectedKey);
    }

    return uncontrolledSelectedKey.value;
  });

  const focusedKey = ref<Key | null>(selectedKey.value);
  const hasAnnouncedAllDisabledFallbackSelection = ref(false);

  const getItem = (key: Key): T | undefined =>
    collection.value.find((entry) => entry.key === key);

  const getFirstKey = (): Key | null => collection.value[0]?.key ?? null;

  const getLastKey = (): Key | null =>
    collection.value[collection.value.length - 1]?.key ?? null;

  const getKeyAfter = (key: Key): Key | null => {
    const index = collection.value.findIndex((entry) => entry.key === key);
    if (index < 0 || index + 1 >= collection.value.length) {
      return null;
    }

    return collection.value[index + 1]?.key ?? null;
  };

  const getKeyBefore = (key: Key): Key | null => {
    const index = collection.value.findIndex((entry) => entry.key === key);
    if (index <= 0) {
      return null;
    }

    return collection.value[index - 1]?.key ?? null;
  };

  const isKeyDisabled = (key: Key): boolean => {
    if (isDisabled.value) {
      return true;
    }

    const item = getItem(key);
    return disabledKeys.value.has(key) || Boolean(item?.isDisabled);
  };

  const setSelectedKey = (key: Key) => {
    if (!isControlled.value) {
      uncontrolledSelectedKey.value = key;
    }

    options.onSelectionChange?.(key);
  };

  const setFocusedKey = (key: Key | null) => {
    focusedKey.value = key;
  };

  watchEffect(() => {
    if (isControlled.value) {
      return;
    }

    const currentSelectedKey = selectedKey.value;
    const hasCurrentSelection =
      currentSelectedKey !== null && getItem(currentSelectedKey) !== undefined;

    if (hasCurrentSelection) {
      return;
    }

    const nextSelectedKey = findDefaultSelectedKey(
      collection.value,
      disabledKeys.value
    );

    if (nextSelectedKey === null) {
      uncontrolledSelectedKey.value = null;
      return;
    }

    if (nextSelectedKey !== uncontrolledSelectedKey.value) {
      uncontrolledSelectedKey.value = nextSelectedKey;
      options.onSelectionChange?.(nextSelectedKey);
    }
  });

  watchEffect(() => {
    if (isControlled.value || hasExplicitDefaultSelectedKey.value) {
      return;
    }

    if (hasAnnouncedAllDisabledFallbackSelection.value) {
      return;
    }

    if (collection.value.length === 0) {
      return;
    }

    const allTabsDisabled = collection.value.every(
      (item) => disabledKeys.value.has(item.key) || Boolean(item.isDisabled)
    );
    if (!allTabsDisabled || selectedKey.value === null) {
      return;
    }

    hasAnnouncedAllDisabledFallbackSelection.value = true;
    options.onSelectionChange?.(selectedKey.value);
  });

  watch(
    selectedKey,
    (nextSelectedKey, previousSelectedKey) => {
      if (nextSelectedKey === null) {
        return;
      }

      if (
        focusedKey.value === null ||
        previousSelectedKey !== nextSelectedKey
      ) {
        focusedKey.value = nextSelectedKey;
      }
    },
    { immediate: true }
  );

  return {
    collection,
    selectedKey,
    disabledKeys,
    isDisabled,
    focusedKey,
    setSelectedKey,
    setFocusedKey,
    isKeyDisabled,
    getItem,
    getFirstKey,
    getLastKey,
    getKeyAfter,
    getKeyBefore,
    registerTab: (key, element) => {
      tabElements.set(key, element);
    },
    unregisterTab: (key, element) => {
      const current = tabElements.get(key);
      if (!current) {
        return;
      }

      if (!element || current === element) {
        tabElements.delete(key);
      }
    },
    getTabElement: (key) => tabElements.get(key),
  };
}
