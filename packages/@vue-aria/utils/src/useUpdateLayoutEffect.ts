import { watch, type WatchSource } from "vue";

export function useUpdateLayoutEffect(
  effect: () => void | (() => void),
  dependencies: ReadonlyArray<WatchSource<unknown> | unknown>
): void {
  let isInitial = true;

  watch(
    dependencies as ReadonlyArray<WatchSource<unknown>>,
    (_value, _oldValue, onCleanup) => {
      if (isInitial) {
        isInitial = false;
        return;
      }

      const cleanup = effect();
      if (typeof cleanup === "function") {
        onCleanup(cleanup);
      }
    },
    { immediate: true, flush: "post" }
  );
}
