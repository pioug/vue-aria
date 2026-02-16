import type { Key, Node } from "@vue-aria/collections";
import { ListCollection, useSingleSelectListState } from "@vue-stately/list";
import { useOverlayTriggerState } from "@vue-stately/overlays";
import type { FocusStrategy } from "@vue-stately/selection";
import { useControlledState } from "@vue-stately/utils";
import {
  useFormValidationState,
  type FormValidationState,
} from "@vue-stately/form";
import { computed, ref, toValue, watch, watchEffect } from "vue";

type FilterFn = (textValue: string, inputValue: string) => boolean;

export type MenuTriggerAction = "focus" | "input" | "manual";

export interface ComboBoxState<T>
  extends Omit<FormValidationState, "displayValidation" | "realtimeValidation"> {
  readonly defaultSelectedKey: Key | null;
  readonly inputValue: string;
  readonly defaultInputValue: string;
  setInputValue(value: string): void;
  commit(): void;
  readonly focusStrategy: FocusStrategy | null;
  readonly isFocused: boolean;
  setFocused(isFocused: boolean): void;
  open(focusStrategy?: FocusStrategy | null, trigger?: MenuTriggerAction): void;
  toggle(
    focusStrategy?: FocusStrategy | null,
    trigger?: MenuTriggerAction
  ): void;
  close(): void;
  revert(): void;
  readonly isOpen: boolean;
  readonly collection: ListCollection<T>;
  readonly selectionManager: any;
  readonly selectedKey: Key | null;
  readonly selectedItem: Node<T> | null;
  readonly disabledKeys: Set<Key>;
  setSelectedKey(key: Key | null): void;
  readonly displayValidation: ReturnType<
    typeof useFormValidationState<{ inputValue: string; selectedKey: Key | null }>
  >["displayValidation"];
  readonly realtimeValidation: ReturnType<
    typeof useFormValidationState<{ inputValue: string; selectedKey: Key | null }>
  >["realtimeValidation"];
}

export interface ComboBoxStateOptions<T> {
  items?: Iterable<T | Node<T>> | null;
  defaultItems?: Iterable<T | Node<T>> | null;
  getKey?: (item: T) => Key;
  getTextValue?: (item: T) => string;
  selectedKey?: Key | null;
  defaultSelectedKey?: Key | null;
  onSelectionChange?: (key: Key | null) => void;
  inputValue?: string;
  defaultInputValue?: string;
  onInputChange?: (value: string) => void;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean, trigger?: MenuTriggerAction) => void;
  menuTrigger?: "focus" | "input" | "manual";
  allowsEmptyCollection?: boolean;
  allowsCustomValue?: boolean;
  shouldCloseOnBlur?: boolean;
  isReadOnly?: boolean;
  validationBehavior?: "aria" | "native";
  isInvalid?: boolean;
  validationState?: "valid" | "invalid";
  name?: string | string[];
  validate?: (
    value: { inputValue: string; selectedKey: Key | null }
  ) => boolean | string | string[] | null | undefined;
  defaultFilter?: FilterFn;
}

export function useComboBoxState<T extends object>(
  props: ComboBoxStateOptions<T>
): ComboBoxState<T> {
  const {
    defaultFilter,
    menuTrigger = "input",
    allowsEmptyCollection = false,
    allowsCustomValue,
    shouldCloseOnBlur = true,
  } = props;

  const showAllItems = ref(false);
  const isFocusedRef = ref(false);
  const focusStrategyRef = ref<FocusStrategy | null>(null);
  const menuOpenTriggerRef = ref<MenuTriggerAction | undefined>("focus");
  const previousSelectedKeyRef = ref<Key | null>(
    props.selectedKey ?? props.defaultSelectedKey ?? null
  );

  const listState = useSingleSelectListState<T>({
    ...props,
    get selectedKey() {
      return props.selectedKey;
    },
    get defaultSelectedKey() {
      return props.defaultSelectedKey;
    },
    onSelectionChange(key) {
      props.onSelectionChange?.(key);

      if (key === previousSelectedKeyRef.value) {
        resetInputValue();
        closeMenu();
      }
    },
    get items() {
      return (props.items ?? props.defaultItems ?? undefined) as
        | Iterable<T | Node<T>>
        | undefined;
    },
  });

  const [inputValueRef, setInputValue] = useControlledState<string, string>(
    () => props.inputValue,
    () =>
      getDefaultInputValue(
        props.defaultInputValue,
        listState.selectedKey,
        listState.collection
      ) ?? "",
    props.onInputChange
  );

  const initialSelectedKey = ref(listState.selectedKey);
  const initialValue = ref(inputValueRef.value);

  const originalCollection = computed<ListCollection<T>>(
    () => listState.collection as unknown as ListCollection<T>
  );
  const filteredCollection = computed<ListCollection<T>>(() => {
    if (props.items != null || !defaultFilter) {
      return originalCollection.value;
    }

    return filterCollection(
      originalCollection.value as any,
      inputValueRef.value,
      defaultFilter
    ) as ListCollection<T>;
  });

  const lastCollection = ref<ListCollection<T>>(
    filteredCollection.value as ListCollection<T>
  );

  const triggerState = useOverlayTriggerState({
    isOpen: props.isOpen,
    defaultOpen: props.defaultOpen,
  });

  const setOpen = (isOpen: boolean, trigger?: MenuTriggerAction) => {
    if (isOpen) {
      menuOpenTriggerRef.value = trigger;
      triggerState.open();
      props.onOpenChange?.(true, trigger);
    } else {
      triggerState.close();
      props.onOpenChange?.(false);
    }

    listState.selectionManager.setFocused(isOpen);
    if (!isOpen) {
      listState.selectionManager.setFocusedKey(null);
    }
  };

  const canOpenCollection = (displayAllItems: boolean) =>
    allowsEmptyCollection
    || filteredCollection.value.size > 0
    || (displayAllItems && originalCollection.value.size > 0)
    || props.items != null;

  const updateLastCollection = () => {
    lastCollection.value = showAllItems.value
      ? originalCollection.value
      : filteredCollection.value;
  };

  const open = (
    focusStrategy: FocusStrategy | null = null,
    trigger?: MenuTriggerAction
  ) => {
    const displayAllItems =
      trigger === "manual" || (trigger === "focus" && menuTrigger === "focus");

    if (!canOpenCollection(displayAllItems)) {
      return;
    }

    if (displayAllItems && !triggerState.isOpen && props.items === undefined) {
      showAllItems.value = true;
    }

    focusStrategyRef.value = focusStrategy;
    setOpen(true, trigger);
  };

  const toggleMenu = (focusStrategy: FocusStrategy | null = null) => {
    if (triggerState.isOpen) {
      updateLastCollection();
      focusStrategyRef.value = focusStrategy;
      setOpen(false);
      return;
    }

    focusStrategyRef.value = focusStrategy;
    setOpen(true, menuOpenTriggerRef.value);
  };

  const toggle = (
    focusStrategy: FocusStrategy | null = null,
    trigger?: MenuTriggerAction
  ) => {
    const displayAllItems =
      trigger === "manual" || (trigger === "focus" && menuTrigger === "focus");

    if (!triggerState.isOpen && !canOpenCollection(displayAllItems)) {
      return;
    }

    if (displayAllItems && !triggerState.isOpen && props.items === undefined) {
      showAllItems.value = true;
    }

    if (!triggerState.isOpen) {
      menuOpenTriggerRef.value = trigger;
    }

    toggleMenu(focusStrategy);
  };

  const closeMenu = () => {
    if (!triggerState.isOpen) {
      return;
    }

    updateLastCollection();
    setOpen(false);
  };

  const lastValue = ref(inputValueRef.value);

  const resetInputValue = () => {
    const itemText =
      listState.selectedKey != null
        ? listState.collection.getItem(listState.selectedKey)?.textValue ?? ""
        : "";
    lastValue.value = itemText;
    setInputValue(itemText);
  };

  const lastSelectedKey = ref<Key | null>(
    props.selectedKey ?? props.defaultSelectedKey ?? null
  );
  const lastSelectedKeyText = ref(
    listState.selectedKey != null
      ? listState.collection.getItem(listState.selectedKey)?.textValue ?? ""
      : ""
  );

  watch(
    () => props.defaultSelectedKey,
    (nextDefaultSelectedKey, previousDefaultSelectedKey) => {
      if (props.selectedKey !== undefined) {
        return;
      }

      if (Object.is(nextDefaultSelectedKey, previousDefaultSelectedKey)) {
        return;
      }

      if (nextDefaultSelectedKey == null) {
        listState.setSelectedKey(null);
        return;
      }

      if (nextDefaultSelectedKey !== listState.selectedKey) {
        listState.setSelectedKey(nextDefaultSelectedKey);
      }
    }
  );

  watch(
    () => props.defaultInputValue,
    (nextDefaultInputValue, previousDefaultInputValue) => {
      if (props.inputValue !== undefined) {
        return;
      }

      if (Object.is(nextDefaultInputValue, previousDefaultInputValue)) {
        return;
      }

      const nextInputValue =
        getDefaultInputValue(
          nextDefaultInputValue,
          listState.selectedKey,
          listState.collection
        ) ?? "";
      if (nextInputValue === inputValueRef.value) {
        return;
      }

      lastValue.value = nextInputValue;
      setInputValue(nextInputValue);
    }
  );

  watchEffect(() => {
    if (
      isFocusedRef.value
      && (filteredCollection.value.size > 0 || allowsEmptyCollection)
      && !triggerState.isOpen
      && inputValueRef.value !== lastValue.value
      && menuTrigger !== "manual"
    ) {
      open(null, "input");
    }

    if (
      !showAllItems.value
      && !allowsEmptyCollection
      && triggerState.isOpen
      && filteredCollection.value.size === 0
    ) {
      closeMenu();
    }

    if (
      listState.selectedKey != null
      && listState.selectedKey !== lastSelectedKey.value
    ) {
      closeMenu();
    }

    if (inputValueRef.value !== lastValue.value) {
      listState.selectionManager.setFocusedKey(null);
      showAllItems.value = false;

      if (
        inputValueRef.value === ""
        && (props.inputValue === undefined || props.selectedKey === undefined)
      ) {
        listState.setSelectedKey(null);
      }
    }

    if (
      listState.selectedKey !== lastSelectedKey.value
      && (props.inputValue === undefined || props.selectedKey === undefined)
    ) {
      resetInputValue();
    } else if (lastValue.value !== inputValueRef.value) {
      lastValue.value = inputValueRef.value;
    }

    const selectedItemText =
      listState.selectedKey != null
        ? listState.collection.getItem(listState.selectedKey)?.textValue ?? ""
        : "";
    if (
      !isFocusedRef.value
      && listState.selectedKey != null
      && props.inputValue === undefined
      && listState.selectedKey === lastSelectedKey.value
      && lastSelectedKeyText.value !== selectedItemText
    ) {
      lastValue.value = selectedItemText;
      setInputValue(selectedItemText);
    }

    lastSelectedKey.value = listState.selectedKey;
    lastSelectedKeyText.value = selectedItemText;
    previousSelectedKeyRef.value = listState.selectedKey;
  });

  const validation = useFormValidationState<{
    inputValue: string;
    selectedKey: Key | null;
  }>({
    ...props,
    value: computed(() => ({
      inputValue: inputValueRef.value,
      selectedKey: listState.selectedKey,
    })),
  });

  const commitCustomValue = () => {
    lastSelectedKey.value = null;
    listState.setSelectedKey(null);
    closeMenu();
  };

  const commitSelection = () => {
    if (props.selectedKey !== undefined && props.inputValue !== undefined) {
      props.onSelectionChange?.(listState.selectedKey);

      const itemText =
        listState.selectedKey != null
          ? listState.collection.getItem(listState.selectedKey)?.textValue ?? ""
          : "";
      lastValue.value = itemText;
      closeMenu();
    } else {
      closeMenu();
      resetInputValue();
    }
  };

  const commitValue = () => {
    if (allowsCustomValue) {
      const itemText =
        listState.selectedKey != null
          ? listState.collection.getItem(listState.selectedKey)?.textValue ?? ""
          : "";
      if (inputValueRef.value === itemText) {
        commitSelection();
      } else {
        commitCustomValue();
      }
    } else {
      commitSelection();
    }
  };

  const commit = () => {
    if (triggerState.isOpen && listState.selectionManager.focusedKey != null) {
      if (listState.selectedKey === listState.selectionManager.focusedKey) {
        commitSelection();
      } else {
        listState.setSelectedKey(listState.selectionManager.focusedKey);
      }
      return;
    }

    commitValue();
  };

  const valueOnFocus = ref(inputValueRef.value);
  const setFocused = (isFocused: boolean) => {
    if (isFocused) {
      valueOnFocus.value = inputValueRef.value;
      if (menuTrigger === "focus" && !props.isReadOnly) {
        open(null, "focus");
      }
    } else {
      if (shouldCloseOnBlur) {
        commitValue();
      }

      if (inputValueRef.value !== valueOnFocus.value) {
        validation.commitValidation();
      }
    }

    isFocusedRef.value = isFocused;
  };

  const displayedCollection = computed<ListCollection<T>>(() => {
    if (triggerState.isOpen) {
      return (showAllItems.value
        ? originalCollection.value
        : filteredCollection.value) as unknown as ListCollection<T>;
    }

    return lastCollection.value as unknown as ListCollection<T>;
  });

  const defaultSelectedKey = computed(
    () => props.defaultSelectedKey ?? initialSelectedKey.value
  );

  return {
    get isOpen() {
      return triggerState.isOpen;
    },
    get focusStrategy() {
      return focusStrategyRef.value;
    },
    open,
    toggle,
    close: commitValue,
    commit,
    revert: () => {
      if (allowsCustomValue && listState.selectedKey == null) {
        commitCustomValue();
      } else {
        commitSelection();
      }
    },
    get isFocused() {
      return isFocusedRef.value;
    },
    setFocused,
    get selectedKey() {
      return listState.selectedKey;
    },
    get defaultSelectedKey() {
      return defaultSelectedKey.value;
    },
    setSelectedKey: listState.setSelectedKey,
    get selectedItem() {
      return listState.selectedItem;
    },
    get collection() {
      return displayedCollection.value;
    },
    get selectionManager() {
      return listState.selectionManager;
    },
    get disabledKeys() {
      return listState.disabledKeys;
    },
    get inputValue() {
      return inputValueRef.value;
    },
    get defaultInputValue() {
      const value = getDefaultInputValue(
        props.defaultInputValue,
        defaultSelectedKey.value,
        listState.collection
      );
      return value ?? initialValue.value;
    },
    setInputValue,
    get displayValidation() {
      return validation.displayValidation;
    },
    get realtimeValidation() {
      return validation.realtimeValidation;
    },
    updateValidation: validation.updateValidation,
    resetValidation: validation.resetValidation,
    commitValidation: validation.commitValidation,
  };
}

function filterCollection<T extends object>(
  collection: ListCollection<T>,
  inputValue: string,
  filter: FilterFn
): ListCollection<T> {
  return new ListCollection(filterNodes(collection, collection as any, inputValue, filter) as Iterable<any>);
}

function filterNodes<T>(
  collection: ListCollection<T>,
  nodes: Iterable<Node<T>>,
  inputValue: string,
  filter: FilterFn
): Iterable<Node<T>> {
  const filteredNodes: Node<T>[] = [];
  for (const node of nodes) {
    if (node.type === "section" && node.hasChildNodes) {
      const children = filterNodes(
        collection,
        collection.getChildren(node.key) as Iterable<Node<T>>,
        inputValue,
        filter
      );
      if ([...children].some((child) => child.type === "item")) {
        filteredNodes.push({ ...(node as any), childNodes: children });
      }
    } else if (node.type === "item" && filter(node.textValue, inputValue)) {
      filteredNodes.push({ ...(node as any) });
    } else if (node.type !== "item") {
      filteredNodes.push({ ...(node as any) });
    }
  }

  return filteredNodes;
}

function getDefaultInputValue(
  defaultInputValue: string | null | undefined,
  selectedKey: Key | null,
  collection: { getItem(key: Key): { textValue?: string } | null }
) {
  if (toValue(defaultInputValue) == null) {
    if (selectedKey != null) {
      return collection.getItem(selectedKey)?.textValue ?? "";
    }
  }

  return toValue(defaultInputValue);
}
