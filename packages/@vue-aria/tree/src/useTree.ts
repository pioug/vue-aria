import { computed, toValue, watchEffect } from "vue";
import {
  useListKeyboardDelegate,
  useTypeSelect,
  type KeyboardDelegate,
} from "@vue-aria/selection";
import type { SelectionBehavior } from "@vue-aria/selection-state";
import { useId } from "@vue-aria/ssr";
import type { Key, MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import type { UseTreeStateResult } from "@vue-aria/tree-state";
import { getRowElementMap, getTreeRowId, treeData } from "./utils";

export interface UseTreeOptions {
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

export interface UseTreeResult {
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

function findFirstVisibleChildKey<T>(state: UseTreeStateResult<T>, parentKey: Key): Key | null {
  const children = state.collection.value.getChildren(parentKey);
  for (const childNode of children) {
    if (!state.collection.value.getItem(childNode.key)) {
      continue;
    }

    if (!state.selectionManager.isDisabled(childNode.key)) {
      return childNode.key;
    }
  }

  return null;
}

export function useTree<T>(
  options: UseTreeOptions,
  state: UseTreeStateResult<T>,
  treeRef: MaybeReactive<HTMLElement | null | undefined>
): UseTreeResult {
  const id = useId(options.id, "v-aria-tree");
  const shouldUseVirtualFocus = computed(() => resolveBoolean(options.shouldUseVirtualFocus));
  const selectionBehavior = computed(() =>
    resolveSelectionBehavior(options.selectionBehavior)
  );
  const domProps = filterDOMProps(options, { labelable: true });

  const listKeyboardDelegate = useListKeyboardDelegate({
    collection: computed(() => state.collection.value.visibleNodes),
    disabledKeys: state.disabledKeys,
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

  const activateKey = (key: Key | null): void => {
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

    options.onAction?.(key);
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
      case "ArrowRight": {
        if (currentKey === null) {
          nextKey = mergedKeyboardDelegate.getFirstKey?.() ?? null;
          break;
        }

        const node = state.collection.value.getNode(currentKey);
        if (!node) {
          break;
        }

        const isExpanded =
          node.type === "section" ||
          (node.hasChildNodes && state.expandedKeys.value.has(node.key));
        if (node.hasChildNodes && node.type !== "section" && !isExpanded) {
          event.preventDefault();
          state.toggleKey(node.key);
          return;
        }

        if (node.hasChildNodes) {
          nextKey = findFirstVisibleChildKey(state, node.key);
        }

        if (nextKey === null) {
          nextKey = mergedKeyboardDelegate.getKeyRightOf?.(currentKey) ?? null;
        }
        break;
      }
      case "ArrowLeft": {
        if (currentKey === null) {
          break;
        }

        const node = state.collection.value.getNode(currentKey);
        if (!node) {
          break;
        }

        const isExpanded =
          node.type === "section" ||
          (node.hasChildNodes && state.expandedKeys.value.has(node.key));
        if (node.hasChildNodes && node.type !== "section" && isExpanded) {
          event.preventDefault();
          state.toggleKey(node.key);
          return;
        }

        if (node.parentKey !== null && !state.selectionManager.isDisabled(node.parentKey)) {
          nextKey = node.parentKey;
        }

        if (nextKey === null) {
          nextKey = mergedKeyboardDelegate.getKeyLeftOf?.(currentKey) ?? null;
        }
        break;
      }
      case "Home":
        nextKey = mergedKeyboardDelegate.getFirstKey?.() ?? null;
        break;
      case "End":
        nextKey = mergedKeyboardDelegate.getLastKey?.() ?? null;
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        activateKey(currentKey);
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
    const previousData = treeData.get(state as object);
    treeData.set(state as object, {
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
      return getTreeRowId(state, focusedKey);
    } catch {
      return undefined;
    }
  });

  const gridProps = computed<Record<string, unknown>>(() =>
    mergeProps(domProps, typeSelectProps, {
      id: id.value,
      role: "treegrid",
      tabIndex: 0,
      onFocus,
      onBlur,
      onKeydown,
      onKeyup: options.onKeyup,
      "aria-multiselectable":
        state.selectionManager.selectionMode.value === "multiple" ? "true" : undefined,
      "aria-activedescendant": activeDescendant.value,
    })
  );

  watchEffect(() => {
    const element = toValue(treeRef);
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
