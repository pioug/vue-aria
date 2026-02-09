import {
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  ref,
  type Ref,
} from "vue";
import type {
  DOMRef,
  DOMRefValue,
  FocusableElement,
  FocusableRef,
  FocusableRefValue,
} from "@vue-aria/types";

export function createDOMRef<T extends HTMLElement = HTMLElement>(
  domRef: Ref<T | null>
): DOMRefValue<T> {
  return {
    UNSAFE_getDOMNode() {
      return domRef.value;
    },
  };
}

export function createFocusableRef<T extends HTMLElement = HTMLElement>(
  domRef: Ref<T | null>,
  focusableRef: Ref<FocusableElement | null> = domRef as unknown as Ref<FocusableElement | null>
): FocusableRefValue<T> {
  return {
    ...createDOMRef(domRef),
    focus() {
      focusableRef.value?.focus();
    },
  };
}

function attachForwardedRef<T>(
  forwardedRef: Ref<T | null> | null | undefined,
  valueFactory: () => T
): void {
  if (!forwardedRef) {
    return;
  }

  forwardedRef.value = valueFactory();
}

export function useDOMRef<T extends HTMLElement = HTMLElement>(
  forwardedRef: DOMRef<T> | null | undefined
): Ref<T | null> {
  const domRef = ref<HTMLElement | null>(null) as Ref<T | null>;

  if (getCurrentInstance()) {
    attachForwardedRef(forwardedRef, () => createDOMRef(domRef));
    onBeforeUnmount(() => {
      if (forwardedRef) {
        forwardedRef.value = null;
      }
    });
  }

  return domRef;
}

export function useFocusableRef<T extends HTMLElement = HTMLElement>(
  forwardedRef: FocusableRef<T> | null | undefined,
  focusableRef?: Ref<FocusableElement | null>
): Ref<T | null> {
  const domRef = ref<HTMLElement | null>(null) as Ref<T | null>;

  if (getCurrentInstance()) {
    attachForwardedRef(
      forwardedRef,
      () =>
        createFocusableRef(
          domRef,
          focusableRef ?? (domRef as unknown as Ref<FocusableElement | null>)
        )
    );

    onBeforeUnmount(() => {
      if (forwardedRef) {
        forwardedRef.value = null;
      }
    });
  }

  return domRef;
}

export function unwrapDOMRef<T extends HTMLElement = HTMLElement>(
  forwardedRef: Ref<DOMRefValue<T> | null>
): Ref<T | null> {
  return computed<T | null>(() => forwardedRef.value?.UNSAFE_getDOMNode() ?? null);
}

export function useUnwrapDOMRef<T extends HTMLElement = HTMLElement>(
  forwardedRef: Ref<DOMRefValue<T> | null>
): Ref<T | null> {
  return unwrapDOMRef(forwardedRef);
}
