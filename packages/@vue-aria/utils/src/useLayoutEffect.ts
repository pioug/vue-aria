import { watch, watchEffect, type WatchSource } from "vue";

export function useLayoutEffect(
  effect: () => void | (() => void),
  deps?: ReadonlyArray<WatchSource<unknown> | unknown>
): void {
  if (!deps) {
    watchEffect((onCleanup) => {
      const cleanup = effect();
      if (typeof cleanup === "function") {
        onCleanup(cleanup);
      }
    }, { flush: "post" });
    return;
  }

  watch(
    deps as ReadonlyArray<WatchSource<unknown>>,
    (_value, _oldValue, onCleanup) => {
      const cleanup = effect();
      if (typeof cleanup === "function") {
        onCleanup(cleanup);
      }
    },
    { immediate: true, flush: "post" }
  );
}
