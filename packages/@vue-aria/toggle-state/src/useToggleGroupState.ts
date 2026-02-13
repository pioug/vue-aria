import { computed } from "vue";
import { useControlledState } from "./useControlledState";

export type Key = string | number;

export interface ToggleGroupProps {
  selectionMode?: "single" | "multiple";
  disallowEmptySelection?: boolean;
  selectedKeys?: Iterable<Key>;
  defaultSelectedKeys?: Iterable<Key>;
  onSelectionChange?: (keys: Set<Key>) => void;
  isDisabled?: boolean;
}

export interface ToggleGroupState {
  readonly selectionMode: "single" | "multiple";
  readonly isDisabled: boolean;
  readonly selectedKeys: Set<Key>;
  toggleKey(key: Key): void;
  setSelected(key: Key, isSelected: boolean): void;
  setSelectedKeys(keys: Set<Key>): void;
}

export function useToggleGroupState(props: ToggleGroupProps): ToggleGroupState {
  const { selectionMode = "single", disallowEmptySelection, isDisabled = false } = props;

  const [selectedKeysRef, setSelectedKeys] = useControlledState(
    computed(() => (props.selectedKeys ? new Set(props.selectedKeys) : undefined)),
    computed(() => (props.defaultSelectedKeys ? new Set(props.defaultSelectedKeys) : new Set<Key>())),
    props.onSelectionChange
  );

  return {
    selectionMode,
    isDisabled,
    get selectedKeys() {
      return selectedKeysRef.value;
    },
    setSelectedKeys,
    toggleKey(key) {
      let keys: Set<Key>;
      if (selectionMode === "multiple") {
        keys = new Set(selectedKeysRef.value);
        if (keys.has(key) && (!disallowEmptySelection || keys.size > 1)) {
          keys.delete(key);
        } else {
          keys.add(key);
        }
      } else {
        keys = new Set(selectedKeysRef.value.has(key) && !disallowEmptySelection ? [] : [key]);
      }

      setSelectedKeys(keys);
    },
    setSelected(key, isSelected) {
      if (isSelected !== selectedKeysRef.value.has(key)) {
        this.toggleKey(key);
      }
    },
  };
}
