import type { MaybeRefOrGetter, Ref } from "vue";

export type MaybeReactive<T> = MaybeRefOrGetter<T>;

export type Key = string | number;

export type PointerType = "mouse" | "touch" | "pen" | "keyboard" | "virtual";

export type ReadonlyRef<T> = Readonly<Ref<T>>;

export interface DOMRefValue<T extends HTMLElement = HTMLElement> {
  UNSAFE_getDOMNode(): T | null;
}

export type DOMRef<T extends HTMLElement = HTMLElement> = Ref<DOMRefValue<T> | null>;

export type FocusableElement =
  | HTMLElement
  | SVGElement
  | {
      focus: () => void;
    };

export interface FocusableRefValue<T extends HTMLElement = HTMLElement>
  extends DOMRefValue<T> {
  focus(): void;
}

export type FocusableRef<T extends HTMLElement = HTMLElement> = Ref<
  FocusableRefValue<T> | null
>;

export interface PressEvent {
  type: "press";
  pointerType: PointerType;
  target: EventTarget | null;
  shiftKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  x?: number;
  y?: number;
  originalEvent: Event;
}

export interface HoverEvent {
  type: "hoverstart" | "hoverend";
  pointerType: PointerType;
  target: EventTarget | null;
  originalEvent: Event;
}

export interface LongPressEvent {
  type: "longpressstart" | "longpressend" | "longpress";
  pointerType: PointerType;
  target: EventTarget | null;
  originalEvent: Event;
}

export interface MoveEvent {
  type: "movestart" | "move" | "moveend";
  pointerType: PointerType;
  deltaX?: number;
  deltaY?: number;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  originalEvent: Event;
}
