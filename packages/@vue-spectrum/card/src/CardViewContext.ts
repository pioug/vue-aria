import { inject, provide, type ComputedRef, type InjectionKey } from "vue";

export type CardSelectionMode = "none" | "single" | "multiple";

export interface CardViewContextValue {
  inCardView: boolean;
  layout: string | null;
  selectionMode: CardSelectionMode;
  isSelected: (key: unknown) => boolean;
  isDisabled: (key: unknown) => boolean;
  toggleSelection: (key: unknown) => void;
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
