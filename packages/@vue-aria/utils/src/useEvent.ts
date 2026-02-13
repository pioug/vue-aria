import { watch, type Ref } from "vue";
import { useEffectEvent } from "./useEffectEvent";

export function useEvent<K extends keyof GlobalEventHandlersEventMap>(
  ref: Ref<EventTarget | null | undefined>,
  event: K | (string & {}),
  handler?: (this: Document, ev: GlobalEventHandlersEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): void {
  const handleEvent = useEffectEvent(handler as any);

  watch(
    [() => ref.value, () => handler, () => options],
    (_v, _o, onCleanup) => {
      if (handler == null || !ref.value) {
        return;
      }

      const element = ref.value;
      element.addEventListener(event, handleEvent as EventListener, options);

      onCleanup(() => {
        element.removeEventListener(event, handleEvent as EventListener, options);
      });
    },
    { immediate: true, flush: "post" }
  );
}
