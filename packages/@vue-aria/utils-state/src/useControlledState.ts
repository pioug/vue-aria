import { computed, ref, toValue, watch, type MaybeRefOrGetter } from "vue";

export type SetStateAction<T> = T | ((prev: T) => T);

export function useControlledState<T, C = T>(
  value: MaybeRefOrGetter<T | undefined>,
  defaultValue: MaybeRefOrGetter<T>,
  onChange?: (v: C, ...args: any[]) => void
): [
  { readonly value: T },
  (value: SetStateAction<T>, ...args: any[]) => void
] {
  const stateValue = ref<T>(toValue(value) ?? toValue(defaultValue));
  const valueRef = ref(stateValue.value);

  const isControlledRef = ref(toValue(value) !== undefined);
  const isControlled = computed(() => toValue(value) !== undefined);

  watch(isControlled, (next) => {
    const wasControlled = isControlledRef.value;
    if (wasControlled !== next && process.env.NODE_ENV !== "production") {
      console.warn(`WARN: A component changed from ${wasControlled ? "controlled" : "uncontrolled"} to ${next ? "controlled" : "uncontrolled"}.`);
    }
    isControlledRef.value = next;
  }, { immediate: true });

  watch(
    () => toValue(value),
    (next) => {
      if (next !== undefined) {
        stateValue.value = next;
        valueRef.value = next;
      }
    },
    { immediate: true }
  );

  const currentValue = computed(() => (isControlled.value ? toValue(value)! : stateValue.value));

  const setValue = (next: SetStateAction<T>, ...args: any[]) => {
    const newValue = typeof next === "function"
      ? (next as (prev: T) => T)(valueRef.value)
      : next;

    if (!Object.is(valueRef.value, newValue)) {
      valueRef.value = newValue;

      if (!isControlled.value) {
        stateValue.value = newValue;
      }

      onChange?.(newValue as unknown as C, ...args);
    }
  };

  return [currentValue, setValue];
}
