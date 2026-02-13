import { computed, ref, toValue, watch, type MaybeRefOrGetter } from "vue";

export function useControlledState<T>(
  value: MaybeRefOrGetter<T | undefined>,
  defaultValue: MaybeRefOrGetter<T>,
  onChange?: (value: T) => void
) {
  const state = ref<T>(toValue(defaultValue));
  const isControlled = computed(() => toValue(value) !== undefined);

  watch(
    () => toValue(value),
    (next) => {
      if (next !== undefined) {
        state.value = next;
      }
    },
    { immediate: true }
  );

  const setValue = (next: T) => {
    if (!isControlled.value) {
      state.value = next;
    }
    onChange?.(next);
  };

  return [computed(() => state.value), setValue] as const;
}
