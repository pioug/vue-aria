import type { CheckboxGroupState } from "@vue-aria/checkbox-state";
import type { InjectionKey } from "vue";

export interface CheckboxGroupContextValue {
  state: CheckboxGroupState;
  isEmphasized?: boolean;
}

export const CheckboxGroupContextSymbol: InjectionKey<CheckboxGroupContextValue> = Symbol(
  "SpectrumCheckboxGroupContext"
);
