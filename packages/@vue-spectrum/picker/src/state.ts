import { useOverlayTriggerState } from "@vue-aria/overlays-state";
import { useSingleSelectListState } from "@vue-aria/list-state";
import { ref } from "vue";
import type { Key } from "@vue-aria/collections";
import type { SpectrumPickerProps } from "./types";

export interface PickerState extends ReturnType<typeof useSingleSelectListState<object>> {
  readonly isOpen: boolean;
  readonly focusStrategy: "first" | "last" | null;
  open(focusStrategy?: "first" | "last" | null): void;
  close(): void;
  toggle(focusStrategy?: "first" | "last" | null): void;
  readonly isFocused: boolean;
  setFocused(isFocused: boolean): void;
  readonly displayValidation: {
    isInvalid: boolean;
    validationErrors: string[];
    validationDetails: ValidityState | null;
  };
  readonly realtimeValidation: {
    isInvalid: boolean;
    validationErrors: string[];
    validationDetails: ValidityState | null;
  };
  readonly value: string | null;
  readonly defaultValue: string | null;
  setValue(value: string | string[]): void;
  commitValidation(): void;
  resetValidation(): void;
  updateValidation(validation: {
    isInvalid: boolean;
    validationErrors: string[];
    validationDetails: ValidityState | null;
  }): void;
  setSelectedKey(key: Key | null): void;
}

function keyToString(key: Key | null | undefined): string | null {
  if (key == null) {
    return null;
  }

  return String(key);
}

function resolveCollectionKey(
  collection: ReturnType<typeof useSingleSelectListState<object>>["collection"],
  value: string
): Key {
  if (collection.getItem(value as Key)) {
    return value as Key;
  }

  const numberValue = Number(value);
  if (!Number.isNaN(numberValue) && collection.getItem(numberValue as Key)) {
    return numberValue as Key;
  }

  return value as Key;
}

export function usePickerState(
  props: SpectrumPickerProps,
  collection: ReturnType<typeof useSingleSelectListState<object>>["collection"],
  disabledKeys?: Iterable<Key>
): PickerState {
  const overlayState = useOverlayTriggerState({
    isOpen: props.isOpen,
    defaultOpen: props.defaultOpen,
    onOpenChange: props.onOpenChange,
  });

  const focusStrategyRef = ref<"first" | "last" | null>(null);
  const isFocusedRef = ref(false);
  const realtimeValidationRef = ref<{
    isInvalid: boolean;
    validationErrors: string[];
    validationDetails: ValidityState | null;
  } | null>(null);

  const defaultValue = keyToString(props.defaultSelectedKey);

  const singleState = useSingleSelectListState<object>({
    collection,
    disabledKeys,
    selectedKey: props.selectedKey,
    defaultSelectedKey: props.defaultSelectedKey,
    onSelectionChange: (key) => {
      props.onSelectionChange?.(key);
      overlayState.close();
    },
  });

  return {
    get collection() {
      return singleState.collection;
    },
    get disabledKeys() {
      return singleState.disabledKeys;
    },
    get selectionManager() {
      return singleState.selectionManager;
    },
    get selectedKey() {
      return singleState.selectedKey;
    },
    get selectedItem() {
      return singleState.selectedItem;
    },
    get isOpen() {
      return overlayState.isOpen;
    },
    get focusStrategy() {
      return focusStrategyRef.value;
    },
    open(focusStrategy = null) {
      focusStrategyRef.value = focusStrategy;
      overlayState.open();
    },
    close() {
      focusStrategyRef.value = null;
      overlayState.close();
    },
    toggle(focusStrategy = null) {
      focusStrategyRef.value = focusStrategy;
      overlayState.toggle();
    },
    get isFocused() {
      return isFocusedRef.value;
    },
    setFocused(isFocused: boolean) {
      isFocusedRef.value = isFocused;
    },
    get displayValidation() {
      if (realtimeValidationRef.value) {
        return realtimeValidationRef.value;
      }

      const isInvalid = Boolean(props.isInvalid || props.validationState === "invalid");
      return {
        isInvalid,
        validationErrors: isInvalid ? ["Invalid selection."] : [],
        validationDetails: null,
      };
    },
    get realtimeValidation() {
      return realtimeValidationRef.value ?? this.displayValidation;
    },
    get value() {
      return keyToString(singleState.selectedKey);
    },
    get defaultValue() {
      return defaultValue;
    },
    setValue(value: string | string[]) {
      const candidate = Array.isArray(value) ? value[0] : value;
      if (candidate == null) {
        singleState.setSelectedKey(null);
        return;
      }

      // Preserve falsy keys such as "" when they exist in the collection.
      if (candidate === "" && !singleState.collection.getItem("" as Key)) {
        singleState.setSelectedKey(null);
        return;
      }

      singleState.setSelectedKey(resolveCollectionKey(singleState.collection, candidate));
    },
    commitValidation() {},
    resetValidation() {
      realtimeValidationRef.value = null;
    },
    updateValidation(validation) {
      realtimeValidationRef.value = validation;
    },
    setSelectedKey(key: Key | null) {
      singleState.setSelectedKey(key);
    },
  };
}
