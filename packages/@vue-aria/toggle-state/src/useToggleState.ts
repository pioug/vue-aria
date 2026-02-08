import { computed, ref, toValue } from "vue";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";

export interface UseToggleStateOptions {
  isSelected?: MaybeReactive<boolean | undefined>;
  defaultSelected?: MaybeReactive<boolean | undefined>;
  onChange?: (isSelected: boolean) => void;
  isReadOnly?: MaybeReactive<boolean | undefined>;
}

export interface UseToggleStateResult {
  isSelected: ReadonlyRef<boolean>;
  defaultSelected: ReadonlyRef<boolean>;
  setSelected: (isSelected: boolean) => void;
  toggle: () => void;
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

export function useToggleState(
  options: UseToggleStateOptions = {}
): UseToggleStateResult {
  const initialSelected = resolveBoolean(
    options.isSelected === undefined ? options.defaultSelected : options.isSelected
  );
  const uncontrolledSelected = ref(resolveBoolean(options.defaultSelected));
  const defaultSelected = ref(resolveBoolean(options.defaultSelected, initialSelected));

  const isControlled = computed(() => options.isSelected !== undefined);
  const isReadOnly = computed(() => resolveBoolean(options.isReadOnly));

  const isSelected = computed(() => {
    if (isControlled.value) {
      return resolveBoolean(options.isSelected);
    }

    return uncontrolledSelected.value;
  });

  const setSelected = (nextSelected: boolean): void => {
    if (isReadOnly.value || nextSelected === isSelected.value) {
      return;
    }

    if (!isControlled.value) {
      uncontrolledSelected.value = nextSelected;
    }

    options.onChange?.(nextSelected);
  };

  const toggle = (): void => {
    setSelected(!isSelected.value);
  };

  return {
    isSelected,
    defaultSelected,
    setSelected,
    toggle,
  };
}
