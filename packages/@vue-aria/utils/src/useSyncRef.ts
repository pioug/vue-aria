import { watchEffect, type Ref } from "vue";

interface ContextValue<T> {
  ref?: Ref<T | null>;
}

export function useSyncRef<T>(context?: ContextValue<T> | null, ref?: Ref<T | null>): void {
  watchEffect((onCleanup) => {
    if (context?.ref && ref) {
      context.ref.value = ref.value;
      onCleanup(() => {
        if (context.ref) {
          context.ref.value = null;
        }
      });
    }
  }, { flush: "post" });
}
