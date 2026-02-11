import {
  computed,
  inject,
  provide,
  readonly,
  type ComputedRef,
  type InjectionKey,
} from "vue";

export type StepKey = string | number;

export interface SpectrumStepListItemData {
  key: StepKey;
  label: string;
  isDisabled?: boolean | undefined;
}

export interface StepListContextValue {
  selectedKey: ComputedRef<StepKey | null>;
  isCompleted: (key: StepKey) => boolean;
  isSelectable: (key: StepKey) => boolean;
  isDisabled: ComputedRef<boolean>;
  isReadOnly: ComputedRef<boolean>;
  selectStep: (key: StepKey) => void;
  getItemIndex: (key: StepKey) => number;
}

const STEP_LIST_CONTEXT_SYMBOL: InjectionKey<StepListContextValue> =
  Symbol("vue-spectrum-step-list-context");

export function provideStepListContext(context: StepListContextValue): void {
  provide(STEP_LIST_CONTEXT_SYMBOL, context);
}

export function useStepListContext(): StepListContextValue {
  const context = inject(STEP_LIST_CONTEXT_SYMBOL, null);
  if (!context) {
    throw new Error("StepListItem must be used within a StepList.");
  }

  return context;
}

export function createReadonlySelectedKey(
  key: ComputedRef<StepKey | null>
): ComputedRef<StepKey | null> {
  return computed(() => readonly(key).value);
}
