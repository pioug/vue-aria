import { computed, ref, toValue, watchEffect } from "vue";
import type { Key, MaybeReactive, ReadonlyRef } from "@vue-aria/types";

export type SelectionMode = "none" | "single" | "multiple";
export type SelectionBehavior = "toggle" | "replace";
export type DisabledBehavior = "all" | "selection";
export type FocusStrategy = "first" | "last" | null;

export interface UseMultipleSelectionStateOptions {
  selectionMode?: MaybeReactive<SelectionMode | undefined>;
  disallowEmptySelection?: MaybeReactive<boolean | undefined>;
  allowDuplicateSelectionEvents?: MaybeReactive<boolean | undefined>;
  selectionBehavior?: MaybeReactive<SelectionBehavior | undefined>;
  selectedKeys?: MaybeReactive<Iterable<Key> | undefined>;
  defaultSelectedKeys?: MaybeReactive<Iterable<Key> | undefined>;
  onSelectionChange?: (keys: Set<Key>) => void;
  disabledKeys?: MaybeReactive<Iterable<Key> | undefined>;
  disabledBehavior?: MaybeReactive<DisabledBehavior | undefined>;
}

export interface UseMultipleSelectionStateResult {
  selectionMode: ReadonlyRef<SelectionMode>;
  disallowEmptySelection: ReadonlyRef<boolean>;
  selectionBehavior: ReadonlyRef<SelectionBehavior>;
  setSelectionBehavior: (selectionBehavior: SelectionBehavior) => void;
  isFocused: ReadonlyRef<boolean>;
  setFocused: (isFocused: boolean) => void;
  focusedKey: ReadonlyRef<Key | null>;
  childFocusStrategy: ReadonlyRef<FocusStrategy>;
  setFocusedKey: (key: Key | null, childFocusStrategy?: FocusStrategy) => void;
  selectedKeys: ReadonlyRef<Set<Key>>;
  setSelectedKeys: (keys: Iterable<Key>) => void;
  disabledKeys: ReadonlyRef<Set<Key>>;
  disabledBehavior: ReadonlyRef<DisabledBehavior>;
}

function resolveBoolean(
  value: MaybeReactive<boolean | undefined> | undefined
): boolean {
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

function resolveSelectionBehavior(
  value: MaybeReactive<SelectionBehavior | undefined> | undefined
): SelectionBehavior {
  if (value === undefined) {
    return "toggle";
  }

  return toValue(value) ?? "toggle";
}

function resolveDisabledBehavior(
  value: MaybeReactive<DisabledBehavior | undefined> | undefined
): DisabledBehavior {
  if (value === undefined) {
    return "all";
  }

  return toValue(value) ?? "all";
}

function resolveSelectedKeys(
  value: MaybeReactive<Iterable<Key> | undefined> | undefined
): Set<Key> {
  if (value === undefined) {
    return new Set();
  }

  return new Set(toValue(value) ?? []);
}

function normalizeSelectedKeys(
  keys: Set<Key>,
  selectionMode: SelectionMode
): Set<Key> {
  if (selectionMode === "none") {
    return new Set();
  }

  if (selectionMode === "single" && keys.size > 1) {
    const first = keys.values().next().value;
    return first === undefined ? new Set() : new Set([first]);
  }

  return new Set(keys);
}

function equalSets(left: Set<Key>, right: Set<Key>): boolean {
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

export function useMultipleSelectionState(
  options: UseMultipleSelectionStateOptions = {}
): UseMultipleSelectionStateResult {
  const isControlled = computed(() => options.selectedKeys !== undefined);
  const selectionMode = computed(() => resolveSelectionMode(options.selectionMode));
  const disallowEmptySelection = computed(() =>
    resolveBoolean(options.disallowEmptySelection)
  );
  const allowDuplicateSelectionEvents = computed(() =>
    resolveBoolean(options.allowDuplicateSelectionEvents)
  );
  const disabledKeys = computed(() => resolveSelectedKeys(options.disabledKeys));
  const disabledBehavior = computed(() =>
    resolveDisabledBehavior(options.disabledBehavior)
  );

  const uncontrolledSelectedKeys = ref<Set<Key>>(
    normalizeSelectedKeys(
      resolveSelectedKeys(options.defaultSelectedKeys),
      selectionMode.value
    )
  );
  const selectionBehaviorState = ref(
    resolveSelectionBehavior(options.selectionBehavior)
  );

  const isFocused = ref(false);
  const focusedKey = ref<Key | null>(null);
  const childFocusStrategy = ref<FocusStrategy>(null);

  const selectionBehavior = computed<SelectionBehavior>(() => {
    if (options.selectionBehavior !== undefined) {
      return resolveSelectionBehavior(options.selectionBehavior);
    }

    return selectionBehaviorState.value;
  });

  const selectedKeys = computed<Set<Key>>(() => {
    const resolvedKeys = isControlled.value
      ? resolveSelectedKeys(options.selectedKeys)
      : uncontrolledSelectedKeys.value;

    return normalizeSelectedKeys(resolvedKeys, selectionMode.value);
  });

  watchEffect(() => {
    if (options.selectionBehavior !== undefined) {
      selectionBehaviorState.value = resolveSelectionBehavior(options.selectionBehavior);
    }
  });

  watchEffect(() => {
    if (
      options.selectionBehavior !== undefined &&
      resolveSelectionBehavior(options.selectionBehavior) === "replace" &&
      selectionBehaviorState.value === "toggle" &&
      selectedKeys.value.size === 0
    ) {
      selectionBehaviorState.value = "replace";
    }
  });

  const setSelectionBehavior = (nextSelectionBehavior: SelectionBehavior): void => {
    selectionBehaviorState.value = nextSelectionBehavior;
  };

  const setFocused = (nextFocused: boolean): void => {
    isFocused.value = nextFocused;
  };

  const setFocusedKey = (
    key: Key | null,
    nextChildFocusStrategy: FocusStrategy = "first"
  ): void => {
    focusedKey.value = key;
    childFocusStrategy.value = key === null ? null : nextChildFocusStrategy;
  };

  const setSelectedKeys = (keys: Iterable<Key>): void => {
    const normalized = normalizeSelectedKeys(new Set(keys), selectionMode.value);

    if (
      disallowEmptySelection.value &&
      normalized.size === 0 &&
      selectedKeys.value.size > 0
    ) {
      return;
    }

    if (
      !allowDuplicateSelectionEvents.value &&
      equalSets(normalized, selectedKeys.value)
    ) {
      return;
    }

    if (!isControlled.value) {
      uncontrolledSelectedKeys.value = normalized;
    }

    options.onSelectionChange?.(normalized);
  };

  return {
    selectionMode,
    disallowEmptySelection,
    selectionBehavior,
    setSelectionBehavior,
    isFocused,
    setFocused,
    focusedKey,
    childFocusStrategy,
    setFocusedKey,
    selectedKeys,
    setSelectedKeys,
    disabledKeys,
    disabledBehavior,
  };
}
