import type { MaybeRefOrGetter, Ref } from "vue";

export type MaybeReactive<T> = MaybeRefOrGetter<T>;

export type PointerType = "mouse" | "touch" | "keyboard" | "virtual";

export type ReadonlyRef<T> = Readonly<Ref<T>>;

export interface PressEvent {
  type: "press";
  pointerType: PointerType;
  target: EventTarget | null;
  originalEvent: Event;
}
