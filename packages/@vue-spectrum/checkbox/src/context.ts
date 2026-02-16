import type { CheckboxGroupState } from "@vue-stately/checkbox";
import type { InjectionKey } from "vue";

export interface CheckboxGroupContextValue {
  state: CheckboxGroupState;
  isEmphasized?: boolean;
  isInvalidFromGroupProps?: boolean;
}

export const CheckboxGroupContextSymbol: InjectionKey<CheckboxGroupContextValue> = Symbol(
  "SpectrumCheckboxGroupContext"
);
