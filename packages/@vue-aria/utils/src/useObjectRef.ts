import { shallowRef, type Ref } from "vue";

type CallbackRef<T> = (instance: T | null) => (() => void) | void;

export function useObjectRef<T>(ref?: CallbackRef<T> | Ref<T | null> | null): Ref<T | null> {
  const objRef = shallowRef<T | null>(null);
  let cleanupRef: (() => void) | void;

  const refEffect = (instance: T | null) => {
    if (typeof ref === "function") {
      const refCallback = ref;
      const refCleanup = refCallback(instance);
      return () => {
        if (typeof refCleanup === "function") {
          refCleanup();
        } else {
          refCallback(null);
        }
      };
    }

    if (ref) {
      ref.value = instance;
      return () => {
        ref.value = null;
      };
    }
  };

  return {
    get value() {
      return objRef.value;
    },
    set value(value: T | null) {
      objRef.value = value;

      if (cleanupRef) {
        cleanupRef();
        cleanupRef = undefined;
      }

      if (value != null) {
        cleanupRef = refEffect(value);
      }
    },
  } as Ref<T | null>;
}
