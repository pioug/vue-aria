import { shallowRef, watchEffect } from "vue";

export function useEffectEvent<T extends (...args: any[]) => any>(fn?: T): T {
  const fnRef = shallowRef<T | undefined>(fn);

  watchEffect(() => {
    fnRef.value = fn;
  }, { flush: "post" });

  return (((...args: Parameters<T>) => fnRef.value?.(...args)) as T);
}
