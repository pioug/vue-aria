import { computed, toValue } from "vue";
import {
  useListBox,
  type ListBoxItem,
  type UseListBoxOptions,
  type UseListBoxStateResult,
} from "@vue-aria/listbox";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";

export interface UseGridListOptions extends UseListBoxOptions {
  isVirtualized?: MaybeReactive<boolean | undefined>;
}

export interface UseGridListResult {
  gridProps: ReadonlyRef<Record<string, unknown>>;
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

export function useGridList<T extends ListBoxItem>(
  options: UseGridListOptions,
  state: UseListBoxStateResult<T>,
  gridListRef: MaybeReactive<HTMLElement | null | undefined>
): UseGridListResult {
  const { listBoxProps } = useListBox(options, state, gridListRef);

  const gridProps = computed<Record<string, unknown>>(() => ({
    ...listBoxProps.value,
    role: "grid",
    "aria-colcount": 1,
    "aria-rowcount":
      resolveBoolean(options.isVirtualized) && state.collection.value.length > 0
        ? state.collection.value.length
        : undefined,
  }));

  return {
    gridProps,
  };
}
