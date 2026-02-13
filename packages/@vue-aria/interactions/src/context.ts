import type { InjectionKey, Ref } from "vue";
import type { PressProps } from "./usePress";

export interface PressResponderContextValue extends PressProps {
  register: () => void;
  ref?: Ref<Element | null>;
}

export const PressResponderContext: InjectionKey<PressResponderContextValue> = Symbol("PressResponderContext");
