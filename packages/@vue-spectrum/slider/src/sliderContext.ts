import type { SliderState } from "@vue-stately/slider";
import type { InjectionKey, Ref } from "vue";

export interface SliderContext {
  state: SliderState;
  trackRef: { current: Element | null };
  inputRef: Ref<HTMLInputElement | null>;
}

export const sliderContextKey: InjectionKey<SliderContext> = Symbol("spectrumSliderContext");
