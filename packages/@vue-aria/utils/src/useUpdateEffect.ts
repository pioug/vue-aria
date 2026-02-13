import { watch, type WatchSource } from "vue";
import { useEffectEvent } from "./useEffectEvent";

export function useUpdateEffect(
  cb: () => void | (() => void),
  dependencies: ReadonlyArray<WatchSource<unknown> | unknown>
): void {
  const cbEvent = useEffectEvent(cb);
  let isInitial = true;

  watch(
    dependencies as ReadonlyArray<WatchSource<unknown>>,
    (_value, _oldValue, onCleanup) => {
      if (isInitial) {
        isInitial = false;
        return;
      }

      const cleanup = cbEvent();
      if (typeof cleanup === "function") {
        onCleanup(cleanup);
      }
    },
    { immediate: true }
  );
}
