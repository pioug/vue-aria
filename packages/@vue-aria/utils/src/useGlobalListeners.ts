import { onScopeDispose } from "vue";

interface GlobalListenerRecord {
  type: string;
  eventTarget: EventTarget;
  fn: EventListenerOrEventListenerObject;
  options?: boolean | AddEventListenerOptions;
}

interface GlobalListeners {
  addGlobalListener(el: EventTarget, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeGlobalListener(el: EventTarget, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  removeAllGlobalListeners(): void;
}

export function useGlobalListeners(): GlobalListeners {
  const globalListeners = new Map<EventListenerOrEventListenerObject, GlobalListenerRecord>();

  const addGlobalListener: GlobalListeners["addGlobalListener"] = (eventTarget, type, listener, options) => {
    const fn = (typeof options === "object" && options?.once)
      ? ((...args: any[]) => {
          globalListeners.delete(listener);
          (listener as EventListener)(args[0] as Event);
        })
      : listener;

    globalListeners.set(listener, { type, eventTarget, fn, options });
    eventTarget.addEventListener(type, fn, options);
  };

  const removeGlobalListener: GlobalListeners["removeGlobalListener"] = (eventTarget, type, listener, options) => {
    const fn = globalListeners.get(listener)?.fn || listener;
    eventTarget.removeEventListener(type, fn, options);
    globalListeners.delete(listener);
  };

  const removeAllGlobalListeners = () => {
    globalListeners.forEach((value, key) => {
      removeGlobalListener(value.eventTarget, value.type, key, value.options);
    });
  };

  onScopeDispose(removeAllGlobalListeners);

  return { addGlobalListener, removeGlobalListener, removeAllGlobalListeners };
}
