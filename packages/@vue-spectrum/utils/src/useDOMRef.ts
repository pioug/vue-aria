import type { ReadonlyRef } from "@vue-aria/types";
import { computed, onScopeDispose, ref, type Ref } from "vue";

export interface DOMRefValue<T extends HTMLElement = HTMLElement> {
  UNSAFE_getDOMNode: () => T | null;
}

export interface FocusableRefValue<T extends HTMLElement = HTMLElement>
  extends DOMRefValue<T> {
  focus: () => void;
}

export type FocusableElement = HTMLElement;
export type DOMRef<T extends HTMLElement = HTMLElement> = Ref<DOMRefValue<T> | null> | undefined;
export type FocusableRef<T extends HTMLElement = HTMLElement> =
  | Ref<FocusableRefValue<T> | null>
  | undefined;

export function createDOMRef<T extends HTMLElement = HTMLElement>(
  targetRef: ReadonlyRef<T | null>
): DOMRefValue<T> {
  return {
    UNSAFE_getDOMNode() {
      return targetRef.value;
    },
  };
}

export function createFocusableRef<T extends HTMLElement = HTMLElement>(
  domRef: ReadonlyRef<T | null>,
  focusableRef: ReadonlyRef<FocusableElement | null> = domRef
): FocusableRefValue<T> {
  return {
    ...createDOMRef(domRef),
    focus() {
      focusableRef.value?.focus();
    },
  };
}

export function useDOMRef<T extends HTMLElement = HTMLElement>(
  forwardedRef?: DOMRef<T>
): Ref<T | null> {
  const domRef = ref<HTMLElement | null>(null) as Ref<T | null>;

  if (forwardedRef) {
    const wrappedRef = createDOMRef(domRef);
    forwardedRef.value = wrappedRef;
    onScopeDispose(() => {
      forwardedRef.value = null;
    });
  }

  return domRef;
}

export function useFocusableRef<T extends HTMLElement = HTMLElement>(
  forwardedRef?: FocusableRef<T>,
  focusableRef?: ReadonlyRef<FocusableElement | null>
): Ref<T | null> {
  const domRef = ref<HTMLElement | null>(null) as Ref<T | null>;

  if (forwardedRef) {
    const wrappedRef = createFocusableRef(domRef, focusableRef ?? domRef);
    forwardedRef.value = wrappedRef;
    onScopeDispose(() => {
      forwardedRef.value = null;
    });
  }

  return domRef;
}

export function unwrapDOMRef<T extends HTMLElement>(
  domRef: ReadonlyRef<DOMRefValue<T> | null>
): ReadonlyRef<T | null> {
  return computed(() => domRef.value?.UNSAFE_getDOMNode() ?? null);
}

export function useUnwrapDOMRef<T extends HTMLElement>(
  domRef: ReadonlyRef<DOMRefValue<T> | null>
): ReadonlyRef<T | null> {
  return unwrapDOMRef(domRef);
}
