import { computed, ref, watch } from "vue";
import { Selection } from "./Selection";
import type {
  DisabledBehavior,
  FocusStrategy,
  Key,
  MultipleSelectionState,
  Selection as SelectionType,
  SelectionBehavior,
  SelectionMode,
} from "./types";
import { useControlledState } from "@vue-aria/utils-state";

function equalSets(setA: SelectionType, setB: SelectionType) {
  if (setA === "all" || setB === "all") {
    return setA === setB;
  }

  if (setA.size !== setB.size) {
    return false;
  }

  for (const item of setA) {
    if (!setB.has(item)) {
      return false;
    }
  }

  return true;
}

export interface MultipleSelectionStateProps {
  selectionMode?: SelectionMode;
  disallowEmptySelection?: boolean;
  allowDuplicateSelectionEvents?: boolean;
  selectionBehavior?: SelectionBehavior;
  disabledBehavior?: DisabledBehavior;
  selectedKeys?: SelectionType;
  defaultSelectedKeys?: SelectionType;
  onSelectionChange?: (keys: SelectionType) => void;
  disabledKeys?: Iterable<Key>;
}

function convertSelection(selection: SelectionType | null | undefined, defaultValue?: SelectionType): SelectionType | undefined {
  if (!selection) {
    return defaultValue;
  }

  return selection === "all" ? "all" : new Selection(selection);
}

export function useMultipleSelectionState(props: MultipleSelectionStateProps): MultipleSelectionState {
  const {
    selectionMode = "none" as SelectionMode,
    disallowEmptySelection = false,
    allowDuplicateSelectionEvents,
    selectionBehavior: selectionBehaviorProp = "toggle",
    disabledBehavior = "all",
  } = props;

  const isFocusedRef = ref(false);
  const focusedKeyRef = ref<Key | null>(null);
  const childFocusStrategyRef = ref<FocusStrategy | null>(null);

  const selectedKeysProp = computed(() => convertSelection(props.selectedKeys));
  const defaultSelectedKeys = computed<SelectionType>(() => convertSelection(props.defaultSelectedKeys, new Selection()) as SelectionType);

  const [selectedKeysRef, setSelectedKeysRaw] = useControlledState<SelectionType>(
    selectedKeysProp,
    defaultSelectedKeys,
    props.onSelectionChange
  );

  const disabledKeysProp = computed(() => (props.disabledKeys ? new Set(props.disabledKeys) : new Set<Key>()));
  const selectionBehavior = ref(selectionBehaviorProp);

  watch(
    () => selectionBehaviorProp,
    (next) => {
      selectionBehavior.value = next;
    }
  );

  return {
    selectionMode,
    disallowEmptySelection,
    get selectionBehavior() {
      return selectionBehavior.value;
    },
    setSelectionBehavior(v) {
      selectionBehavior.value = v;
    },
    get isFocused() {
      return isFocusedRef.value;
    },
    setFocused(f) {
      isFocusedRef.value = f;
    },
    get focusedKey() {
      return focusedKeyRef.value;
    },
    get childFocusStrategy() {
      return childFocusStrategyRef.value;
    },
    setFocusedKey(k, childFocusStrategy = "first") {
      focusedKeyRef.value = k;
      childFocusStrategyRef.value = childFocusStrategy;
    },
    get selectedKeys() {
      return selectedKeysRef.value;
    },
    setSelectedKeys(keys) {
      if (allowDuplicateSelectionEvents || !equalSets(keys, selectedKeysRef.value)) {
        setSelectedKeysRaw(keys);
      }
    },
    get disabledKeys() {
      return disabledKeysProp.value;
    },
    disabledBehavior,
  };
}
