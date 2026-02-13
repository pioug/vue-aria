import type { ComputedRef, MaybeRefOrGetter, Ref } from "vue";

export type MaybeReactive<T> = MaybeRefOrGetter<T>;

export type ReadonlyRef<T> =
  | Readonly<Ref<T>>
  | Readonly<ComputedRef<T>>;
