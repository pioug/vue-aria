import { computed, inject, provide } from "vue";

const HiddenSymbol = Symbol("vue-aria-hidden");

export function useIsHidden() {
  return inject<boolean>(HiddenSymbol, false);
}

export function createHideableComponent<T extends (...args: any[]) => any>(fn: T): T {
  return ((...args: any[]) => {
    const hidden = useIsHidden();
    if (hidden) {
      return null;
    }

    return fn(...args);
  }) as T;
}

export function useHiddenScope(value = true) {
  provide(HiddenSymbol, value);
  return computed(() => value);
}
