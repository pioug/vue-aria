import type { RadioGroupState } from "@vue-aria/radio-state";
import type { InjectionKey } from "vue";

export interface RadioGroupContextValue {
  isEmphasized?: boolean;
  state: RadioGroupState;
}

export const RadioGroupContextSymbol: InjectionKey<RadioGroupContextValue> = Symbol(
  "SpectrumRadioGroupContext"
);
