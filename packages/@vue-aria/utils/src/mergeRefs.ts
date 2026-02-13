import type { Ref } from "vue";

type MaybeRef<T> = Ref<T | null> | ((value: T | null) => void | (() => void)) | null | undefined;

function setRef<T>(ref: MaybeRef<T>, value: T | null) {
  if (typeof ref === "function") {
    return ref(value);
  }

  if (ref != null) {
    ref.value = value;
  }
}

export function mergeRefs<T>(...refs: MaybeRef<T>[]) {
  if (refs.length === 1 && refs[0]) {
    return refs[0];
  }

  return (value: T | null) => {
    let hasCleanup = false;

    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, value);
      hasCleanup ||= typeof cleanup === "function";
      return cleanup;
    });

    if (hasCleanup) {
      return () => {
        cleanups.forEach((cleanup, index) => {
          if (typeof cleanup === "function") {
            cleanup();
          } else {
            setRef(refs[index], null);
          }
        });
      };
    }
  };
}
