import type { ReadonlyRef } from "@vue-types/shared";
import { computed, nextTick, onMounted, ref, watch } from "vue";

export function useHasChild(
  query: string,
  elementRef: ReadonlyRef<HTMLElement | null>
): ReadonlyRef<boolean> {
  const hasChild = ref(true);
  const update = () => {
    hasChild.value = Boolean(elementRef.value && elementRef.value.querySelector(query));
  };

  onMounted(async () => {
    await nextTick();
    update();
  });

  watch(
    () => [query, elementRef.value] as const,
    () => {
      update();
    }
  );

  return computed(() => hasChild.value);
}
