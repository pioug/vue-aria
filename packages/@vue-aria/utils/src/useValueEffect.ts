import { nextTick, readonly, ref, watch } from "vue";
import type { ReadonlyRef } from "@vue-types/shared";

export type ValueEffectGenerator<S> = Generator<S, void, unknown>;
export type SetValueEffectAction<S> = (prev: S) => ValueEffectGenerator<S>;

function resolveDefaultValue<S>(value: S | (() => S)): S {
  if (typeof value === "function") {
    return (value as () => S)();
  }

  return value;
}

export function useValueEffect<S>(
  defaultValue: S | (() => S)
): [ReadonlyRef<S>, (fn: SetValueEffectAction<S>) => void] {
  const value = ref<S>(resolveDefaultValue(defaultValue));
  const currentValue = ref<S>(value.value);
  let effect: ValueEffectGenerator<S> | null = null;

  const next = (): void => {
    if (!effect) {
      return;
    }

    const nextValue = effect.next();
    if (nextValue.done) {
      effect = null;
      return;
    }

    if (Object.is(currentValue.value, nextValue.value)) {
      next();
      return;
    }

    value.value = nextValue.value;
  };

  watch(
    () => value.value,
    async (newValue) => {
      currentValue.value = newValue;
      if (effect) {
        await nextTick();
        next();
      }
    },
    { flush: "post" }
  );

  const queue = (fn: SetValueEffectAction<S>): void => {
    effect = fn(currentValue.value);
    next();
  };

  return [readonly(value) as ReadonlyRef<S>, queue];
}
