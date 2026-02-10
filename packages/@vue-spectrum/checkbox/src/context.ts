import { inject, provide, type InjectionKey } from "vue";
import type { UseCheckboxGroupState } from "@vue-aria/checkbox";
import type { ReadonlyRef } from "@vue-aria/types";

export interface CheckboxGroupContextValue {
  state: UseCheckboxGroupState;
  isEmphasized: ReadonlyRef<boolean>;
}

const CHECKBOX_GROUP_CONTEXT_SYMBOL: InjectionKey<CheckboxGroupContextValue> = Symbol(
  "VUE_SPECTRUM_CHECKBOX_GROUP_CONTEXT"
);

export function provideCheckboxGroupContext(
  value: CheckboxGroupContextValue
): void {
  provide(CHECKBOX_GROUP_CONTEXT_SYMBOL, value);
}

export function useCheckboxGroupContext(): CheckboxGroupContextValue | null {
  return inject(CHECKBOX_GROUP_CONTEXT_SYMBOL, null);
}
