import {
  getCurrentInstance,
  onMounted,
  readonly,
  ref,
  watch,
  type Ref,
} from "vue";
import type { ReadonlyRef } from "@vue-aria/types";

export function useHasChild(
  query: string,
  elementRef: Ref<HTMLElement | null | undefined>
): ReadonlyRef<boolean> {
  const hasChild = ref(true);

  const update = (): void => {
    hasChild.value = Boolean(elementRef.value?.querySelector(query));
  };

  if (getCurrentInstance()) {
    onMounted(update);
    watch([() => query, elementRef], update);
  } else {
    update();
  }

  return readonly(hasChild);
}
