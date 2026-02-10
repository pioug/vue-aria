import { inject, provide, type InjectionKey } from "vue";
import type { UseRadioGroupState } from "@vue-aria/radio";
import type { ReadonlyRef } from "@vue-aria/types";

export interface RadioGroupContextValue {
  state: UseRadioGroupState;
  isEmphasized: ReadonlyRef<boolean>;
}

const RADIO_GROUP_CONTEXT_SYMBOL: InjectionKey<RadioGroupContextValue> = Symbol(
  "VUE_SPECTRUM_RADIO_GROUP_CONTEXT"
);

export function provideRadioGroupContext(value: RadioGroupContextValue): void {
  provide(RADIO_GROUP_CONTEXT_SYMBOL, value);
}

export function useRadioGroupContext(): RadioGroupContextValue | null {
  return inject(RADIO_GROUP_CONTEXT_SYMBOL, null);
}
