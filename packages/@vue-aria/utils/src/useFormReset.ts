import { watch, type Ref } from "vue";
import { useEffectEvent } from "./useEffectEvent";

export function useFormReset<T>(
  ref: Ref<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null | undefined> | undefined,
  initialValue: T,
  onReset: (value: T) => void
): void {
  const handleReset = useEffectEvent(() => {
    if (onReset) {
      onReset(initialValue);
    }
  });

  watch(
    () => ref?.value?.form,
    (form, _prevForm, onCleanup) => {
      form?.addEventListener("reset", handleReset as EventListener);
      onCleanup(() => {
        form?.removeEventListener("reset", handleReset as EventListener);
      });
    },
    { immediate: true, flush: "post" }
  );
}
