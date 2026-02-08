import { computed, getCurrentInstance, inject, provide, reactive, readonly, toValue } from "vue";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";

interface SSRContextValue {
  path: string;
  current: number;
  providerCurrent: number;
  isSSR: boolean;
}

const SSR_CONTEXT_SYMBOL: unique symbol = Symbol("vue-aria-ssr-context");

export interface ProvideSSROptions {
  isSSR?: MaybeReactive<boolean | undefined>;
}

function createContext(path: string, isSSR: boolean): SSRContextValue {
  return reactive({
    path,
    current: 0,
    providerCurrent: 0,
    isSSR,
  }) as SSRContextValue;
}

export function useSSRContext(): SSRContextValue | null {
  if (!getCurrentInstance()) {
    return null;
  }
  return inject<SSRContextValue | null>(SSR_CONTEXT_SYMBOL, null);
}

export function provideSSR(options: ProvideSSROptions = {}): Readonly<SSRContextValue> {
  const parent = useSSRContext();
  const isSSR =
    options.isSSR !== undefined
      ? Boolean(toValue(options.isSSR))
      : (parent?.isSSR ?? false);

  let path = "";
  if (parent) {
    parent.providerCurrent += 1;
    path = parent.path
      ? `${parent.path}-${parent.providerCurrent}`
      : String(parent.providerCurrent);
  }

  const context = createContext(path, isSSR);
  provide(SSR_CONTEXT_SYMBOL, context);
  return readonly(context) as Readonly<SSRContextValue>;
}

export function useIsSSR(): ReadonlyRef<boolean> {
  const context = useSSRContext();
  return computed(() => context?.isSSR ?? false);
}

export function formatScopedIdPrefix(basePrefix: string, context: SSRContextValue): string {
  return context.path ? `${basePrefix}-${context.path}` : basePrefix;
}
