import { computed, ref, toValue, watch } from "vue";
import { useListBoxState, type ListBoxItem, type UseListBoxStateResult } from "@vue-aria/listbox";
import { useOverlayTriggerState } from "@vue-aria/overlays-state";
import type { Key, MaybeReactive, ReadonlyRef } from "@vue-aria/types";

export type FocusStrategy = "first" | "last" | null;
export type MenuTrigger = "input" | "focus" | "manual";
export type MenuTriggerAction = "input" | "focus" | "manual";
export type FilterFn = (textValue: string, inputValue: string) => boolean;
export type CompletionMode = "none" | "list";

export interface UseComboBoxStateOptions<T extends ListBoxItem = ListBoxItem> {
  collection?: MaybeReactive<Iterable<T> | undefined>;
  disabledKeys?: MaybeReactive<Iterable<Key> | undefined>;
  selectedKey?: MaybeReactive<Key | null | undefined>;
  defaultSelectedKey?: MaybeReactive<Key | null | undefined>;
  onSelectionChange?: (key: Key | null) => void;
  inputValue?: MaybeReactive<string | undefined>;
  defaultInputValue?: MaybeReactive<string | undefined>;
  onInputChange?: (value: string) => void;
  isOpen?: MaybeReactive<boolean | undefined>;
  defaultOpen?: MaybeReactive<boolean | undefined>;
  onOpenChange?: (isOpen: boolean, trigger?: MenuTriggerAction) => void;
  defaultFilter?: FilterFn;
  completionMode?: MaybeReactive<CompletionMode | undefined>;
  menuTrigger?: MaybeReactive<MenuTrigger | undefined>;
  allowsEmptyCollection?: MaybeReactive<boolean | undefined>;
  allowsCustomValue?: MaybeReactive<boolean | undefined>;
  shouldCloseOnBlur?: MaybeReactive<boolean | undefined>;
  isReadOnly?: MaybeReactive<boolean | undefined>;
}

export interface UseComboBoxStateResult<T extends ListBoxItem = ListBoxItem>
  extends UseListBoxStateResult<T> {
  isOpen: ReadonlyRef<boolean>;
  focusStrategy: ReadonlyRef<FocusStrategy>;
  selectedKey: ReadonlyRef<Key | null>;
  selectedItem: ReadonlyRef<T | null>;
  inputValue: ReadonlyRef<string>;
  defaultInputValue: ReadonlyRef<string>;
  isFocused: ReadonlyRef<boolean>;
  setFocused: (isFocused: boolean) => void;
  setInputValue: (value: string) => void;
  setSelectedKey: (key: Key | null) => void;
  open: (focusStrategy?: FocusStrategy, trigger?: MenuTriggerAction) => void;
  close: () => void;
  toggle: (focusStrategy?: FocusStrategy, trigger?: MenuTriggerAction) => void;
  commit: () => void;
  revert: () => void;
}

function resolveBoolean(
  value: MaybeReactive<boolean | undefined> | undefined,
  fallback = false
): boolean {
  if (value === undefined) {
    return fallback;
  }

  return Boolean(toValue(value));
}

function resolveString(
  value: MaybeReactive<string | undefined> | undefined
): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return toValue(value);
}

function resolveKey(
  value: MaybeReactive<Key | null | undefined> | undefined
): Key | null {
  if (value === undefined) {
    return null;
  }

  return toValue(value) ?? null;
}

function resolveMenuTrigger(
  value: MaybeReactive<MenuTrigger | undefined> | undefined
): MenuTrigger {
  if (value === undefined) {
    return "input";
  }

  return toValue(value) ?? "input";
}

function resolveCompletionMode(
  value: MaybeReactive<CompletionMode | undefined> | undefined
): CompletionMode {
  if (value === undefined) {
    return "none";
  }

  return toValue(value) ?? "none";
}

function toCollectionArray<T extends ListBoxItem>(
  collection: Iterable<T> | undefined
): T[] {
  if (!collection) {
    return [];
  }

  return Array.from(collection);
}

function getItemText<T extends ListBoxItem>(
  collection: T[],
  key: Key | null
): string {
  if (key === null) {
    return "";
  }

  const item = collection.find((entry) => entry.key === key);
  return item?.textValue ?? "";
}

function isItemDisabled<T extends ListBoxItem>(
  collection: T[],
  key: Key
): boolean {
  const item = collection.find((entry) => entry.key === key);
  return Boolean(item?.isDisabled);
}

export function useComboBoxState<T extends ListBoxItem>(
  options: UseComboBoxStateOptions<T> = {}
): UseComboBoxStateResult<T> {
  const isSelectedControlled = computed(() => options.selectedKey !== undefined);
  const isInputControlled = computed(() => options.inputValue !== undefined);

  const originalCollection = computed<T[]>(() => {
    if (options.collection === undefined) {
      return [];
    }

    return toCollectionArray(toValue(options.collection));
  });

  const uncontrolledSelectedKey = ref<Key | null>(resolveKey(options.defaultSelectedKey));
  const selectedKey = computed<Key | null>(() => {
    if (isSelectedControlled.value) {
      return resolveKey(options.selectedKey);
    }

    return uncontrolledSelectedKey.value;
  });

  const initialDefaultInputValue =
    resolveString(options.defaultInputValue) ??
    getItemText(originalCollection.value, selectedKey.value);
  const defaultInputValue = ref(initialDefaultInputValue);
  const uncontrolledInputValue = ref(initialDefaultInputValue);

  const inputValue = computed<string>(() => {
    if (isInputControlled.value) {
      return resolveString(options.inputValue) ?? "";
    }

    return uncontrolledInputValue.value;
  });

  const isFocused = ref(false);
  const focusStrategy = ref<FocusStrategy>(null);
  const showAllItems = ref(false);
  const menuOpenTrigger = ref<MenuTriggerAction | undefined>(undefined);
  const menuTrigger = computed(() => resolveMenuTrigger(options.menuTrigger));
  const completionMode = computed(() => resolveCompletionMode(options.completionMode));
  const allowsEmptyCollection = computed(() =>
    resolveBoolean(options.allowsEmptyCollection)
  );
  const allowsCustomValue = computed(() => resolveBoolean(options.allowsCustomValue));
  const shouldCloseOnBlur = computed(() =>
    resolveBoolean(options.shouldCloseOnBlur, true)
  );
  const isReadOnly = computed(() => resolveBoolean(options.isReadOnly));

  const overlayState = useOverlayTriggerState({
    isOpen: options.isOpen,
    defaultOpen: options.defaultOpen,
    onOpenChange: (nextOpen) => {
      options.onOpenChange?.(
        nextOpen,
        nextOpen ? menuOpenTrigger.value : undefined
      );
    },
  });

  const filterCollectionByInputValue = (nextInputValue: string): T[] => {
    const allItems = originalCollection.value;
    const filter = options.defaultFilter;
    if (!filter || showAllItems.value || nextInputValue === "") {
      return allItems;
    }

    return allItems.filter((item) => filter(item.textValue ?? "", nextInputValue));
  };

  const filteredCollection = computed<T[]>(() =>
    filterCollectionByInputValue(inputValue.value)
  );

  const canOpen = (displayAllItems: boolean): boolean => {
    if (allowsEmptyCollection.value) {
      return true;
    }

    if (filteredCollection.value.length > 0) {
      return true;
    }

    if (displayAllItems && originalCollection.value.length > 0) {
      return true;
    }

    return false;
  };

  const displayedCollection = computed<T[]>(() => {
    if (showAllItems.value) {
      return originalCollection.value;
    }

    return filteredCollection.value;
  });

  const listState = useListBoxState<T>({
    collection: displayedCollection,
    disabledKeys: options.disabledKeys,
    selectionMode: "single",
    selectedKeys: computed(() => {
      if (selectedKey.value === null) {
        return [];
      }

      return [selectedKey.value];
    }),
    onSelectionChange: (keys) => {
      const nextKey = keys.values().next().value ?? null;
      if (nextKey === selectedKey.value) {
        resetInputValue();
        close();
        return;
      }

      setSelectedKey(nextKey);
    },
  });

  const selectedItem = computed<T | null>(() => {
    if (selectedKey.value === null) {
      return null;
    }

    return (
      originalCollection.value.find((item) => item.key === selectedKey.value) ?? null
    );
  });

  const setSelectedKey = (key: Key | null): void => {
    if (!isSelectedControlled.value) {
      uncontrolledSelectedKey.value = key;
    }

    options.onSelectionChange?.(key);
  };

  const setInputValueInternal = (value: string, shouldNotify: boolean): void => {
    if (!isInputControlled.value) {
      uncontrolledInputValue.value = value;
    }

    if (shouldNotify) {
      options.onInputChange?.(value);
    }
  };

  const open = (
    nextFocusStrategy: FocusStrategy = null,
    trigger: MenuTriggerAction = "manual"
  ): void => {
    const displayAllItems =
      trigger === "manual" || (trigger === "focus" && menuTrigger.value === "focus");
    if (!canOpen(displayAllItems)) {
      return;
    }

    if (displayAllItems && !overlayState.isOpen.value) {
      showAllItems.value = true;
    }

    menuOpenTrigger.value = trigger;
    focusStrategy.value = nextFocusStrategy;
    overlayState.open();

    if (completionMode.value === "list" && filteredCollection.value.length > 0) {
      listState.setFocusedKey(filteredCollection.value[0]?.key ?? null);
    }
  };

  const close = (): void => {
    focusStrategy.value = null;
    showAllItems.value = false;
    overlayState.close();
  };

  const toggle = (
    nextFocusStrategy: FocusStrategy = null,
    trigger: MenuTriggerAction = "manual"
  ): void => {
    if (overlayState.isOpen.value) {
      close();
      return;
    }

    open(nextFocusStrategy, trigger);
  };

  const resetInputValue = (): void => {
    setInputValueInternal(getItemText(originalCollection.value, selectedKey.value), true);
  };

  const commitSelection = (): void => {
    resetInputValue();
    close();
  };

  const commitCustomValue = (): void => {
    setSelectedKey(null);
    close();
  };

  const commitValue = (): void => {
    if (allowsCustomValue.value) {
      const selectedText = getItemText(originalCollection.value, selectedKey.value);
      if (inputValue.value === selectedText) {
        commitSelection();
      } else {
        commitCustomValue();
      }
      return;
    }

    commitSelection();
  };

  const commit = (): void => {
    if (overlayState.isOpen.value && listState.focusedKey.value !== null) {
      if (selectedKey.value === listState.focusedKey.value) {
        commitSelection();
      } else {
        const nextKey = listState.focusedKey.value;
        setSelectedKey(nextKey);
        if (!isInputControlled.value) {
          setInputValueInternal(getItemText(originalCollection.value, nextKey), true);
        }
        close();
      }
      return;
    }

    commitValue();
  };

  const revert = (): void => {
    if (allowsCustomValue.value && selectedKey.value === null) {
      commitCustomValue();
      return;
    }

    commitSelection();
  };

  const setInputValue = (value: string): void => {
    setInputValueInternal(value, true);
    showAllItems.value = false;
    listState.setFocusedKey(null);

    if (value === "" && !isSelectedControlled.value) {
      setSelectedKey(null);
    }

    if (
      isFocused.value &&
      !isReadOnly.value &&
      menuTrigger.value !== "manual" &&
      !overlayState.isOpen.value
    ) {
      const nextFilteredCollection = filterCollectionByInputValue(value);
      if (allowsEmptyCollection.value || nextFilteredCollection.length > 0) {
        open(null, "input");
      }
    }

    const nextFilteredCollection = filterCollectionByInputValue(value);
    if (completionMode.value === "list") {
      listState.setFocusedKey(nextFilteredCollection[0]?.key ?? null);
    }

    if (
      overlayState.isOpen.value &&
      !allowsEmptyCollection.value &&
      nextFilteredCollection.length === 0
    ) {
      close();
    }
  };

  const setFocused = (nextFocused: boolean): void => {
    isFocused.value = nextFocused;
    listState.setFocused(nextFocused);

    if (nextFocused) {
      if (menuTrigger.value === "focus" && !isReadOnly.value) {
        open(null, "focus");
      }
      return;
    }

    if (shouldCloseOnBlur.value) {
      commitValue();
    }
  };

  watch(selectedKey, (nextKey, previousKey) => {
    if (nextKey === previousKey) {
      return;
    }

    if (!isInputControlled.value && !isFocused.value) {
      setInputValueInternal(getItemText(originalCollection.value, nextKey), true);
    }

    if (nextKey !== null) {
      close();
    }
  });

  watch(
    () => listState.focusedKey.value,
    (nextFocusedKey) => {
      if (
        nextFocusedKey !== null &&
        (listState.disabledKeys.value.has(nextFocusedKey) ||
          isItemDisabled(filteredCollection.value, nextFocusedKey) ||
          isItemDisabled(originalCollection.value, nextFocusedKey))
      ) {
        listState.setFocusedKey(null);
      }
    },
    { immediate: true }
  );

  return {
    ...listState,
    isOpen: overlayState.isOpen,
    focusStrategy,
    selectedKey,
    selectedItem,
    inputValue,
    defaultInputValue,
    isFocused,
    setFocused,
    setInputValue,
    setSelectedKey,
    open,
    close,
    toggle,
    commit,
    revert,
  };
}
