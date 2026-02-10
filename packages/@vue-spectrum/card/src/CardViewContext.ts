import { inject, provide, type ComputedRef, type InjectionKey } from "vue";

export interface CardViewContextValue {
  inCardView: boolean;
  layout: string | null;
}

const CARD_VIEW_CONTEXT_SYMBOL: InjectionKey<ComputedRef<CardViewContextValue>> =
  Symbol("VUE_SPECTRUM_CARD_VIEW_CONTEXT");

export function provideCardViewContext(
  value: ComputedRef<CardViewContextValue>
): void {
  provide(CARD_VIEW_CONTEXT_SYMBOL, value);
}

export function useCardViewContext(): CardViewContextValue | null {
  const value = inject(CARD_VIEW_CONTEXT_SYMBOL, null);
  return value?.value ?? null;
}
