import { computed, ref, toValue } from "vue";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";

export interface UseDisclosureStateOptions {
  isExpanded?: MaybeReactive<boolean | undefined>;
  defaultExpanded?: MaybeReactive<boolean | undefined>;
  onExpandedChange?: (isExpanded: boolean) => void;
}

export interface UseDisclosureStateResult {
  isExpanded: ReadonlyRef<boolean>;
  setExpanded: (isExpanded: boolean) => void;
  toggle: () => void;
}

export function useDisclosureState(
  options: UseDisclosureStateOptions = {}
): UseDisclosureStateResult {
  const uncontrolledExpanded = ref(
    options.defaultExpanded === undefined
      ? false
      : Boolean(toValue(options.defaultExpanded))
  );

  const isControlled = computed(() => options.isExpanded !== undefined);
  const isExpanded = computed(() => {
    if (isControlled.value) {
      return Boolean(toValue(options.isExpanded));
    }

    return uncontrolledExpanded.value;
  });

  const setExpanded = (next: boolean) => {
    if (!isControlled.value) {
      uncontrolledExpanded.value = next;
    }

    options.onExpandedChange?.(next);
  };

  const toggle = () => {
    setExpanded(!isExpanded.value);
  };

  return {
    isExpanded,
    setExpanded,
    toggle,
  };
}
