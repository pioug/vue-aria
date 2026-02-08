import { computed, toValue } from "vue";
import {
  useDateField,
  type UseDateFieldOptions,
  type UseDateFieldResult,
  type UseDateFieldState,
} from "@vue-aria/datefield";
import type { MaybeReactive } from "@vue-aria/types";

export interface UseTimeFieldState extends UseDateFieldState {
  timeValue?: MaybeReactive<{ toString: () => string } | null | undefined>;
}

function valueToString(value: unknown): string {
  if (value == null) {
    return "";
  }
  if (typeof value === "object" && "toString" in (value as object)) {
    return String((value as { toString: () => string }).toString());
  }
  return String(value);
}

export function useTimeField(
  options: UseDateFieldOptions,
  state: UseTimeFieldState,
  fieldRef: MaybeReactive<Element | null | undefined>
): UseDateFieldResult {
  const base = useDateField(options, state, fieldRef);

  const inputProps = computed<Record<string, unknown>>(() => {
    const value =
      state.timeValue === undefined
        ? state.value === undefined
          ? undefined
          : toValue(state.value)
        : toValue(state.timeValue);

    return {
      ...base.inputProps.value,
      value: valueToString(value),
    };
  });

  return {
    ...base,
    inputProps,
  };
}
