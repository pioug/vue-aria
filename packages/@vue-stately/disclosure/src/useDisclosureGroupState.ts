import { computed, watch } from "vue";
import { useControlledState } from "@vue-stately/utils";
import type { Key } from "@vue-types/shared";

export interface DisclosureGroupProps {
  /** Whether multiple items are allowed to be expanded at the same time. */
  allowsMultipleExpanded?: boolean;

  /** Whether all disclosure items are disabled. */
  isDisabled?: boolean;

  /** Keys of currently expanded disclosure items (controlled). */
  expandedKeys?: Iterable<Key>;

  /** Keys of initially expanded disclosure items (uncontrolled). */
  defaultExpandedKeys?: Iterable<Key>;

  /** Change handler for expanded keys. */
  onExpandedChange?: (keys: Set<Key>) => void;
}

export interface DisclosureGroupState {
  /** Whether multiple items are allowed to be expanded at the same time. */
  readonly allowsMultipleExpanded: boolean;

  /** Whether all disclosure items are disabled. */
  readonly isDisabled: boolean;

  /** Set of keys that are currently expanded. */
  readonly expandedKeys: Set<Key>;

  /** Replaces the expanded keys. */
  setExpandedKeys(keys: Set<Key>): void;

  /** Toggles whether a key is expanded. */
  toggleKey(key: Key): void;
}

export function useDisclosureGroupState(props: DisclosureGroupProps = {}): DisclosureGroupState {
  const [expandedKeys, setExpandedKeys] = useControlledState<Set<Key>, Set<Key>>(
    () => (props.expandedKeys ? new Set(props.expandedKeys) : undefined),
    () => (props.defaultExpandedKeys ? new Set(props.defaultExpandedKeys) : new Set()),
    props.onExpandedChange
  );

  const allowsMultipleExpanded = computed(() => Boolean(props.allowsMultipleExpanded));
  const isDisabled = computed(() => Boolean(props.isDisabled));

  watch(
    expandedKeys,
    (value) => {
      if (!allowsMultipleExpanded.value && value.size > 1) {
        const firstKey = value.values().next().value;
        if (firstKey != null) {
          setExpandedKeys(new Set([firstKey]));
        }
      }
    },
    { deep: true, immediate: true }
  );

  return {
    get allowsMultipleExpanded() {
      return allowsMultipleExpanded.value;
    },
    get isDisabled() {
      return isDisabled.value;
    },
    get expandedKeys() {
      return expandedKeys.value;
    },
    setExpandedKeys: (keys: Set<Key>) => {
      setExpandedKeys(keys);
    },
    toggleKey(key: Key) {
      const keys = new Set(expandedKeys.value);
      if (allowsMultipleExpanded.value) {
        if (keys.has(key)) {
          keys.delete(key);
        } else {
          keys.add(key);
        }
      } else {
        if (keys.has(key)) {
          keys.clear();
        } else {
          keys.clear();
          keys.add(key);
        }
      }
      setExpandedKeys(keys);
    },
  };
}
