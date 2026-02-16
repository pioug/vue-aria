import type { ReadonlyRef } from "@vue-types/shared";
import type { InjectionKey } from "vue";
import type { ProviderContext } from "./types";

// Kept in a separate module so provider context identity is stable across HMR updates.
export const ProviderContextSymbol = Symbol("vue-spectrum-provider-context") as InjectionKey<
  ReadonlyRef<ProviderContext>
>;
