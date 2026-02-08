import { computed, ref, toValue, watchEffect } from "vue";
import type { Key, MaybeReactive, ReadonlyRef } from "@vue-aria/types";

export interface UseDisclosureGroupStateOptions {
  allowsMultipleExpanded?: MaybeReactive<boolean | undefined>;
  isDisabled?: MaybeReactive<boolean | undefined>;
  expandedKeys?: MaybeReactive<Iterable<Key> | undefined>;
  defaultExpandedKeys?: MaybeReactive<Iterable<Key> | undefined>;
  onExpandedChange?: (keys: Set<Key>) => void;
}

export interface UseDisclosureGroupStateResult {
  allowsMultipleExpanded: ReadonlyRef<boolean>;
  isDisabled: ReadonlyRef<boolean>;
  expandedKeys: ReadonlyRef<Set<Key>>;
  toggleKey: (key: Key) => void;
  setExpandedKeys: (keys: Set<Key>) => void;
}

function toKeySet(keys: Iterable<Key> | undefined): Set<Key> {
  if (!keys) {
    return new Set();
  }

  return new Set(keys);
}

function normalizeExpandedKeys(
  keys: Set<Key>,
  allowsMultipleExpanded: boolean
): Set<Key> {
  if (allowsMultipleExpanded || keys.size <= 1) {
    return new Set(keys);
  }

  const firstKey = keys.values().next().value;
  if (firstKey === undefined) {
    return new Set();
  }

  return new Set([firstKey]);
}

export function useDisclosureGroupState(
  options: UseDisclosureGroupStateOptions = {}
): UseDisclosureGroupStateResult {
  const allowsMultipleExpanded = computed(() =>
    Boolean(toValue(options.allowsMultipleExpanded))
  );
  const isDisabled = computed(() => Boolean(toValue(options.isDisabled)));
  const isControlled = computed(() => options.expandedKeys !== undefined);
  const uncontrolledExpandedKeys = ref<Set<Key>>(
    toKeySet(toValue(options.defaultExpandedKeys))
  );

  const expandedKeys = computed<Set<Key>>(() => {
    if (isControlled.value) {
      return toKeySet(toValue(options.expandedKeys));
    }

    return uncontrolledExpandedKeys.value;
  });

  const setExpandedKeys = (keys: Set<Key>) => {
    const normalizedKeys = normalizeExpandedKeys(
      keys,
      allowsMultipleExpanded.value
    );

    if (!isControlled.value) {
      uncontrolledExpandedKeys.value = normalizedKeys;
    }

    options.onExpandedChange?.(normalizedKeys);
  };

  const toggleKey = (key: Key) => {
    let nextKeys: Set<Key>;
    if (allowsMultipleExpanded.value) {
      nextKeys = new Set(expandedKeys.value);
      if (nextKeys.has(key)) {
        nextKeys.delete(key);
      } else {
        nextKeys.add(key);
      }
    } else {
      nextKeys = new Set(expandedKeys.value.has(key) ? [] : [key]);
    }

    setExpandedKeys(nextKeys);
  };

  watchEffect(() => {
    if (!allowsMultipleExpanded.value && expandedKeys.value.size > 1) {
      setExpandedKeys(expandedKeys.value);
    }
  });

  return {
    allowsMultipleExpanded,
    isDisabled,
    expandedKeys,
    toggleKey,
    setExpandedKeys,
  };
}
