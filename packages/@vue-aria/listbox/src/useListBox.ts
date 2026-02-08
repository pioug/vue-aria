import { computed, toValue, watchEffect } from "vue";
import { useId } from "@vue-aria/ssr";
import { useLabel } from "@vue-aria/label";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import type { Key, MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type {
  ListBoxItem,
  SelectionBehavior,
  UseListBoxStateResult,
} from "./useListBoxState";
import { listData } from "./utils";

function findNextEnabledKey<T extends ListBoxItem>(
  state: UseListBoxStateResult<T>,
  startKey: Key
): Key | null {
  const total = state.collection.value.length;
  if (total === 0) {
    return null;
  }

  let key: Key = startKey;
  for (let index = 0; index < total; index += 1) {
    const next = state.getKeyAfter(key) ?? state.getFirstKey();
    if (next === null) {
      return null;
    }
    if (!state.isDisabledKey(next)) {
      return next;
    }
    key = next;
  }

  return null;
}

function findPreviousEnabledKey<T extends ListBoxItem>(
  state: UseListBoxStateResult<T>,
  startKey: Key
): Key | null {
  const total = state.collection.value.length;
  if (total === 0) {
    return null;
  }

  let key: Key = startKey;
  for (let index = 0; index < total; index += 1) {
    const previous = state.getKeyBefore(key) ?? state.getLastKey();
    if (previous === null) {
      return null;
    }
    if (!state.isDisabledKey(previous)) {
      return previous;
    }
    key = previous;
  }

  return null;
}

function findFirstEnabledKey<T extends ListBoxItem>(
  state: UseListBoxStateResult<T>
): Key | null {
  const first = state.getFirstKey();
  if (first === null) {
    return null;
  }

  if (!state.isDisabledKey(first)) {
    return first;
  }

  return findNextEnabledKey(state, first);
}

function findLastEnabledKey<T extends ListBoxItem>(
  state: UseListBoxStateResult<T>
): Key | null {
  const last = state.getLastKey();
  if (last === null) {
    return null;
  }

  if (!state.isDisabledKey(last)) {
    return last;
  }

  return findPreviousEnabledKey(state, last);
}

export interface UseListBoxOptions {
  id?: MaybeReactive<string | undefined>;
  label?: MaybeReactive<string | undefined>;
  "aria-label"?: MaybeReactive<string | undefined>;
  "aria-labelledby"?: MaybeReactive<string | undefined>;
  selectionBehavior?: MaybeReactive<SelectionBehavior | undefined>;
  shouldSelectOnPressUp?: MaybeReactive<boolean | undefined>;
  shouldFocusOnHover?: MaybeReactive<boolean | undefined>;
  shouldUseVirtualFocus?: MaybeReactive<boolean | undefined>;
  isVirtualized?: MaybeReactive<boolean | undefined>;
  onAction?: (key: Key) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onFocusChange?: (isFocused: boolean) => void;
  [key: string]: unknown;
}

export interface UseListBoxResult {
  listBoxProps: ReadonlyRef<Record<string, unknown>>;
  labelProps: ReadonlyRef<Record<string, unknown>>;
}

function resolveSelectionBehavior(
  value: MaybeReactive<SelectionBehavior | undefined> | undefined
): SelectionBehavior {
  if (value === undefined) {
    return "toggle";
  }

  return toValue(value) ?? "toggle";
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

export function useListBox<T extends ListBoxItem>(
  options: UseListBoxOptions,
  state: UseListBoxStateResult<T>,
  listRef: MaybeReactive<HTMLElement | null | undefined>
): UseListBoxResult {
  const selectionBehavior = computed(() =>
    resolveSelectionBehavior(options.selectionBehavior)
  );
  const id = useId(options.id, "v-aria-listbox");
  const domProps = filterDOMProps(options, { labelable: true });

  watchEffect(() => {
    listData.set(state as object, {
      id: id.value,
      shouldUseVirtualFocus: resolveBoolean(options.shouldUseVirtualFocus),
      shouldSelectOnPressUp: resolveBoolean(options.shouldSelectOnPressUp),
      shouldFocusOnHover: resolveBoolean(options.shouldFocusOnHover),
      isVirtualized: resolveBoolean(options.isVirtualized),
      onAction: options.onAction,
      selectionBehavior: selectionBehavior.value,
    });
  });

  const { labelProps, fieldProps } = useLabel({
    id,
    label: options.label,
    labelElementType: "span",
    "aria-label": options["aria-label"],
    "aria-labelledby": options["aria-labelledby"],
  });

  const focusKey = (key: Key | null) => {
    if (key === null) {
      return;
    }
    state.setFocusedKey(key);
    state.getOptionElement(key)?.focus();
  };

  const onKeydown = (event: KeyboardEvent) => {
    if (state.isDisabled.value) {
      return;
    }

    const currentKey = state.focusedKey.value ?? findFirstEnabledKey(state);
    if (currentKey === null) {
      return;
    }

    let nextKey: Key | null = null;
    switch (event.key) {
      case "ArrowDown":
        nextKey = findNextEnabledKey(state, currentKey);
        break;
      case "ArrowUp":
        nextKey = findPreviousEnabledKey(state, currentKey);
        break;
      case "Home":
        nextKey = findFirstEnabledKey(state);
        break;
      case "End":
        nextKey = findLastEnabledKey(state);
        break;
      case "Enter":
      case " ":
        if (state.focusedKey.value !== null) {
          event.preventDefault();
          state.selectKey(
            state.focusedKey.value,
            selectionBehavior.value
          );
        }
        return;
      default:
        return;
    }

    if (nextKey === null) {
      return;
    }

    event.preventDefault();
    focusKey(nextKey);
    if (state.selectionMode.value === "single") {
      state.selectKey(nextKey, "replace");
    }
  };

  const onFocus = (event: FocusEvent) => {
    state.setFocused(true);
    options.onFocusChange?.(true);
    options.onFocus?.(event);

    if (state.focusedKey.value === null) {
      focusKey(findFirstEnabledKey(state));
    }
  };

  const onBlur = (event: FocusEvent) => {
    state.setFocused(false);
    options.onFocusChange?.(false);
    options.onBlur?.(event);
  };

  const listBoxProps = computed<Record<string, unknown>>(() =>
    mergeProps(domProps, fieldProps.value, {
      id: id.value,
      role: "listbox",
      tabIndex: 0,
      onKeydown,
      onFocus,
      onBlur,
      "aria-multiselectable":
        state.selectionMode.value === "multiple" ? "true" : undefined,
    })
  );

  return {
    listBoxProps,
    labelProps,
  };
}
