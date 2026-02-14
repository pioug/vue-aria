import { inject, provide, type InjectionKey } from "vue";
import type { ListBoxContextValue } from "./types";

const ListBoxContextSymbol: InjectionKey<ListBoxContextValue> = Symbol("SpectrumListBoxContext");

export function provideListBoxContext(value: ListBoxContextValue): void {
  provide(ListBoxContextSymbol, value);
}

export function useListBoxContext(): ListBoxContextValue | null {
  return inject(ListBoxContextSymbol, null);
}
