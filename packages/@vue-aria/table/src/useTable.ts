import { computed, toValue, watchEffect } from "vue";
import {
  useListKeyboardDelegate,
  useTypeSelect,
  type KeyboardDelegate,
} from "@vue-aria/selection";
import type { SelectionBehavior } from "@vue-aria/selection-state";
import { useId } from "@vue-aria/ssr";
import type { Key, MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { UseTableStateResult } from "@vue-aria/table-state";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { getRowElementMap, getRowId, tableData } from "./utils";

export interface UseTableOptions {
  id?: MaybeReactive<string | undefined>;
  "aria-label"?: MaybeReactive<string | undefined>;
  "aria-labelledby"?: MaybeReactive<string | undefined>;
  "aria-describedby"?: MaybeReactive<string | undefined>;
  selectionBehavior?: MaybeReactive<SelectionBehavior | undefined>;
  shouldUseVirtualFocus?: MaybeReactive<boolean | undefined>;
  isVirtualized?: MaybeReactive<boolean | undefined>;
  keyboardDelegate?: MaybeReactive<KeyboardDelegate | undefined>;
  onAction?: (key: Key) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onFocusChange?: (isFocused: boolean) => void;
  onKeydown?: (event: KeyboardEvent) => void;
  onKeyup?: (event: KeyboardEvent) => void;
  [key: string]: unknown;
}

export interface UseTableResult {
  gridProps: ReadonlyRef<Record<string, unknown>>;
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

function resolveSelectionBehavior(
  value: MaybeReactive<SelectionBehavior | undefined> | undefined
): SelectionBehavior {
  if (value === undefined) {
    return "toggle";
  }

  return toValue(value) ?? "toggle";
}

export function useTable<T>(
  options: UseTableOptions,
  state: UseTableStateResult<T>,
  tableRef: MaybeReactive<HTMLElement | null | undefined>
): UseTableResult {
  const id = useId(options.id, "v-aria-table");
  const shouldUseVirtualFocus = computed(() => resolveBoolean(options.shouldUseVirtualFocus));
  const selectionBehavior = computed(() =>
    resolveSelectionBehavior(options.selectionBehavior)
  );
  const domProps = filterDOMProps(options, { labelable: true });

  const listKeyboardDelegate = useListKeyboardDelegate({
    collection: computed(() =>
      state.collection.value.rows.map((row) => ({
        key: row.key,
        textValue: state.collection.value.getTextValue(row.key),
        isDisabled: state.selectionManager.isDisabled(row.key),
      }))
    ),
  });

  const customKeyboardDelegate = computed<KeyboardDelegate | undefined>(() => {
    if (options.keyboardDelegate === undefined) {
      return undefined;
    }

    return toValue(options.keyboardDelegate);
  });

  const mergedKeyboardDelegate: KeyboardDelegate = {
    getKeyAbove: (key) =>
      customKeyboardDelegate.value?.getKeyAbove?.(key) ??
      listKeyboardDelegate.getKeyAbove?.(key) ??
      null,
    getKeyBelow: (key) =>
      customKeyboardDelegate.value?.getKeyBelow?.(key) ??
      listKeyboardDelegate.getKeyBelow?.(key) ??
      null,
    getKeyLeftOf: (key) =>
      customKeyboardDelegate.value?.getKeyLeftOf?.(key) ??
      listKeyboardDelegate.getKeyLeftOf?.(key) ??
      null,
    getKeyRightOf: (key) =>
      customKeyboardDelegate.value?.getKeyRightOf?.(key) ??
      listKeyboardDelegate.getKeyRightOf?.(key) ??
      null,
    getFirstKey: () =>
      customKeyboardDelegate.value?.getFirstKey?.() ??
      listKeyboardDelegate.getFirstKey?.() ??
      null,
    getLastKey: () =>
      customKeyboardDelegate.value?.getLastKey?.() ??
      listKeyboardDelegate.getLastKey?.() ??
      null,
    getKeyForSearch: (search, fromKey) =>
      customKeyboardDelegate.value?.getKeyForSearch?.(search, fromKey) ??
      listKeyboardDelegate.getKeyForSearch?.(search, fromKey) ??
      null,
  };

  const focusKey = (key: Key | null): void => {
    if (key === null) {
      return;
    }

    state.selectionManager.setFocusedKey(key);

    if (shouldUseVirtualFocus.value) {
      return;
    }

    getRowElementMap(state).get(key)?.focus();
  };

  const selectKey = (key: Key | null): void => {
    if (key === null || state.selectionManager.isDisabled(key)) {
      return;
    }

    state.selectionManager.setFocused(true);
    state.selectionManager.setFocusedKey(key);

    if (state.selectionManager.selectionMode.value !== "none") {
      const behavior =
        state.selectionManager.selectionMode.value === "multiple"
          ? selectionBehavior.value
          : "replace";
      state.selectionManager.select(key, behavior);
    }
  };

  const onFocus = (event: FocusEvent): void => {
    state.selectionManager.setFocused(true);
    options.onFocusChange?.(true);
    options.onFocus?.(event);

    if (state.selectionManager.focusedKey.value === null) {
      focusKey(mergedKeyboardDelegate.getFirstKey?.() ?? null);
      return;
    }

    focusKey(state.selectionManager.focusedKey.value);
  };

  const onBlur = (event: FocusEvent): void => {
    state.selectionManager.setFocused(false);
    options.onFocusChange?.(false);
    options.onBlur?.(event);
  };

  const onKeydown = (event: KeyboardEvent): void => {
    options.onKeydown?.(event);

    const currentKey =
      state.selectionManager.focusedKey.value ?? mergedKeyboardDelegate.getFirstKey?.() ?? null;

    let nextKey: Key | null = null;
    switch (event.key) {
      case "ArrowDown":
        nextKey =
          currentKey === null
            ? mergedKeyboardDelegate.getFirstKey?.() ?? null
            : mergedKeyboardDelegate.getKeyBelow?.(currentKey) ?? null;
        break;
      case "ArrowUp":
        nextKey =
          currentKey === null
            ? mergedKeyboardDelegate.getLastKey?.() ?? null
            : mergedKeyboardDelegate.getKeyAbove?.(currentKey) ?? null;
        break;
      case "Home":
        nextKey = mergedKeyboardDelegate.getFirstKey?.() ?? null;
        break;
      case "End":
        nextKey = mergedKeyboardDelegate.getLastKey?.() ?? null;
        break;
      case " ":
        event.preventDefault();
        selectKey(currentKey);
        return;
      case "Enter":
        if (currentKey !== null && !state.selectionManager.isDisabled(currentKey)) {
          event.preventDefault();
          state.selectionManager.setFocused(true);
          state.selectionManager.setFocusedKey(currentKey);
          options.onAction?.(currentKey);
        }
        return;
      default:
        return;
    }

    if (nextKey !== null) {
      event.preventDefault();
      focusKey(nextKey);
    }
  };

  const { typeSelectProps } = useTypeSelect({
    keyboardDelegate: mergedKeyboardDelegate,
    focusedKey: state.selectionManager.focusedKey,
    setFocusedKey: (key) => {
      focusKey(key);
    },
  });

  watchEffect(() => {
    const previousData = tableData.get(state as object);
    tableData.set(state as object, {
      id: id.value,
      selectionBehavior: selectionBehavior.value,
      shouldUseVirtualFocus: shouldUseVirtualFocus.value,
      isVirtualized: resolveBoolean(options.isVirtualized),
      onAction: options.onAction,
      rowElements: previousData?.rowElements ?? new Map<Key, HTMLElement>(),
    });
  });

  watchEffect(() => {
    if (shouldUseVirtualFocus.value || !state.selectionManager.isFocused.value) {
      return;
    }

    const focusedKey = state.selectionManager.focusedKey.value;
    if (focusedKey === null) {
      return;
    }

    getRowElementMap(state).get(focusedKey)?.focus();
  });

  const activeDescendant = computed(() => {
    if (!shouldUseVirtualFocus.value) {
      return undefined;
    }

    const focusedKey = state.selectionManager.focusedKey.value;
    if (focusedKey === null) {
      return undefined;
    }

    try {
      return getRowId(state, focusedKey);
    } catch {
      return undefined;
    }
  });

  const gridProps = computed<Record<string, unknown>>(() =>
    mergeProps(domProps, typeSelectProps, {
      id: id.value,
      role: "grid",
      tabIndex: 0,
      onFocus,
      onBlur,
      onKeydown,
      onKeyup: options.onKeyup,
      "aria-colcount":
        state.collection.value.columns.length > 0
          ? state.collection.value.columns.length
          : undefined,
      "aria-rowcount":
        state.collection.value.size > 0
          ? state.collection.value.size + 1
          : undefined,
      "aria-multiselectable":
        state.selectionManager.selectionMode.value === "multiple" ? "true" : undefined,
      "aria-activedescendant": activeDescendant.value,
    })
  );

  watchEffect(() => {
    const element = toValue(tableRef);
    if (!element) {
      return;
    }

    if (!shouldUseVirtualFocus.value && state.selectionManager.isFocused.value) {
      const focusedKey = state.selectionManager.focusedKey.value;
      if (focusedKey !== null) {
        getRowElementMap(state).get(focusedKey)?.focus();
      }
    }
  });

  return {
    gridProps,
  };
}
