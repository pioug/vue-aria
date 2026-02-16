import { computed, watchEffect } from "vue";
import type {
  Collection as SharedCollection,
  CollectionBase,
  Key as SharedKey,
  Node as SharedNode,
  SingleSelection,
} from "@vue-types/shared";
import { useControlledState } from "@vue-stately/utils";
import { useSingleSelectListState, type SingleSelectListState } from "@vue-stately/list";

export interface StepListProps<T>
  extends CollectionBase<T>,
    Omit<SingleSelection, "onSelectionChange"> {
  /** The key of the last completed step (controlled). */
  lastCompletedStep?: SharedKey;
  /** The key of the initially last completed step (uncontrolled). */
  defaultLastCompletedStep?: SharedKey;
  /** Callback for when the last completed step changes. */
  onLastCompletedStepChange?: (key: SharedKey | null) => void;
  /** Whether the step list is disabled. Steps will not be focusable or interactive. */
  isDisabled?: boolean;
  /** Whether the step list is read only. Steps will be focusable but non-interactive. */
  isReadOnly?: boolean;
  /** Handler that is called when the selection changes. */
  onSelectionChange?: (key: SharedKey) => void;
}

export interface StepListState<T> extends SingleSelectListState<T> {
  readonly lastCompletedStep?: SharedKey | null;
  setLastCompletedStep(key: SharedKey | null): void;
  isCompleted(key: SharedKey): boolean;
  isSelectable(key: SharedKey): boolean;
}

interface MappedKeys {
  indexMap: Map<SharedKey, number>;
  keysLinkedList: Map<SharedKey, SharedKey | undefined>;
}

function buildKeysMaps<T>(collection: SharedCollection<SharedNode<T>>) {
  const indexMap = new Map<SharedKey, number>();
  const keysLinkedList = new Map<SharedKey, SharedKey | undefined>();
  let i = 0;
  let prev: SharedNode<T> | undefined = undefined;
  for (const item of collection) {
    indexMap.set(item.key, i);
    keysLinkedList.set(item.key, prev?.key);
    prev = item;
    i++;
  }
  return {indexMap, keysLinkedList};
}

function isCompletedStep(
  step: SharedKey | null | undefined,
  indexMap: Map<SharedKey, number>,
  lastCompletedStep: SharedKey | null | undefined
) {
  if (step === undefined) {
    return false;
  }

  return (
    step !== null &&
    lastCompletedStep !== null &&
    indexMap.has(step) &&
    indexMap.has(lastCompletedStep) &&
    (indexMap.get(step) ?? -1) <= (indexMap.get(lastCompletedStep) ?? -1)
  );
}

function findDefaultSelectedKey<T>(collection: SharedCollection<SharedNode<T>>, disabledKeys: Set<SharedKey>, isCompleted: (key: SharedKey) => boolean) {
  let selectedKey: SharedKey | null = null;
  if (collection && collection.size > 0) {
    selectedKey = collection.getFirstKey();
    while (
      selectedKey !== collection.getLastKey() &&
      selectedKey != null &&
      (disabledKeys.has(selectedKey) || isCompleted(selectedKey))
    ) {
      selectedKey = collection.getKeyAfter(selectedKey);
    }
  }
  return selectedKey;
}

/**
 * Provides state management for a step list.
 */
export function useStepListState<T extends object>(props: StepListProps<T>): StepListState<T> {
  const state = useSingleSelectListState<T>({
    ...(props as Omit<StepListProps<T>, "onSelectionChange"> & { onSelectionChange?: ((key: SharedKey | null) => void) }),
    onSelectionChange: props.onSelectionChange
      ? (key: SharedKey | null) => {
          if (key != null) {
            props.onSelectionChange?.(key);
          }
        }
      : undefined,
  });

  const [lastCompletedStep, setLastCompletedStep] = useControlledState<SharedKey | null>(
    () => props.lastCompletedStep,
    () => props.defaultLastCompletedStep ?? null,
    props.onLastCompletedStepChange
  );

  const indexData = computed<MappedKeys>(() => buildKeysMaps(state.collection));
  const selectedIdx = computed(() =>
    state.selectedKey != null ? indexData.value.indexMap.get(state.selectedKey) : 0
  );

  const isCompleted = (step: SharedKey | null | undefined): boolean => {
    return isCompletedStep(step, indexData.value.indexMap, lastCompletedStep.value);
  };

  const isSelectable = (step: SharedKey): boolean => {
    if (props.isDisabled || state.disabledKeys.has(step) || props.isReadOnly) {
      return false;
    }

    if (isCompleted(step)) {
      return true;
    }

    const prevStep = indexData.value.keysLinkedList.get(step);
    return isCompleted(prevStep) || step === state.collection.getFirstKey();
  };

  const setSelectedKey = (key: SharedKey) => {
    const prevKey = indexData.value.keysLinkedList.get(key);
    if (prevKey && !isCompleted(prevKey)) {
      setLastCompletedStep(prevKey);
    }
    state.setSelectedKey(key);
  };

  watchEffect(() => {
    let nextSelectedKey = state.selectedKey;

    if (state.selectionManager.isEmpty || nextSelectedKey == null || !state.collection.getItem(nextSelectedKey)) {
      nextSelectedKey = findDefaultSelectedKey(state.collection, state.disabledKeys, isCompleted);
      if (nextSelectedKey !== null) {
        state.selectionManager.replaceSelection(nextSelectedKey);
      }
    }

    if (state.selectionManager.focusedKey == null) {
      state.selectionManager.setFocusedKey(nextSelectedKey);
    }

    const lcs =
      lastCompletedStep.value != null
        ? (indexData.value.indexMap.get(lastCompletedStep.value) ?? -1)
        : -1;
    if (
      selectedIdx.value != null &&
      selectedIdx.value > 0 &&
      selectedIdx.value > lcs + 1 &&
      nextSelectedKey != null &&
      indexData.value.keysLinkedList.has(nextSelectedKey)
    ) {
      setLastCompletedStep(indexData.value.keysLinkedList.get(nextSelectedKey) ?? null);
    }
  });

  return {
    ...state,
    setSelectedKey,
    setLastCompletedStep,
    isCompleted: (key: SharedKey) => isCompleted(key),
    isSelectable: (key: SharedKey) => isSelectable(key),
    get lastCompletedStep() {
      return lastCompletedStep.value;
    },
  };
}
