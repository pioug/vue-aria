import type { RadioGroupState } from "@vue-stately/radio";
import type { InjectionKey } from "vue";

export interface RadioGroupContextValue {
  isEmphasized?: boolean;
  state: RadioGroupState;
}

export const RadioGroupContextSymbol: InjectionKey<RadioGroupContextValue> = Symbol(
  "SpectrumRadioGroupContext"
);
