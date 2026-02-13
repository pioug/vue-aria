import { shallowRef } from "vue";

export function useDeepMemo<T>(value: T, isEqual: (a: T, b: T) => boolean): T {
  const lastValue = shallowRef<T | null>(null);

  if (value && lastValue.value && isEqual(value, lastValue.value)) {
    value = lastValue.value;
  }

  lastValue.value = value;
  return value;
}
