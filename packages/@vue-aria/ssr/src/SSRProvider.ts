import {
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  inject,
  onMounted,
  provide,
  readonly,
  ref,
  toValue,
  type MaybeRefOrGetter,
  type Ref,
} from "vue";

interface SSRContextValue {
  prefix: string;
  current: number;
}

export interface SSRProviderProps {
  children?: unknown;
}

const defaultContext: SSRContextValue = {
  prefix: String(Math.round(Math.random() * 10000000000)),
  current: 0,
};

const SSR_CONTEXT = Symbol("vue-aria-ssr-context");
const IS_SSR_CONTEXT = Symbol("vue-aria-is-ssr-context");

function nextId(ctx: SSRContextValue, defaultId?: string): string {
  if (defaultId) {
    return defaultId;
  }

  ctx.current += 1;
  const prefix = ctx.prefix ? `react-aria${ctx.prefix}` : "react-aria";
  return `${prefix}-${ctx.current}`;
}

export const SSRProvider = defineComponent({
  name: "SSRProvider",
  setup(_props, { slots }) {
    const parent = inject<SSRContextValue>(SSR_CONTEXT, defaultContext);
    const providerIndex = parent.current + 1;

    if (parent !== defaultContext) {
      parent.current = providerIndex;
    }

    const value: SSRContextValue = {
      prefix: parent === defaultContext ? "" : `${parent.prefix}-${providerIndex}`,
      current: 0,
    };

    const isSSR = ref(true);
    onMounted(() => {
      isSSR.value = false;
    });

    provide(SSR_CONTEXT, value);
    provide(IS_SSR_CONTEXT, isSSR);

    return () => slots.default?.() ?? h("span");
  },
});

export function useIsSSR(): boolean {
  if (!getCurrentInstance()) {
    return typeof window === "undefined";
  }

  const provided = inject<Ref<boolean> | null>(IS_SSR_CONTEXT, null);
  if (provided) {
    return provided.value;
  }

  return typeof window === "undefined";
}

export function useSSRSafeId(defaultId?: string): string {
  const ctx = getCurrentInstance()
    ? inject<SSRContextValue>(SSR_CONTEXT, defaultContext)
    : defaultContext;

  return nextId(ctx, defaultId);
}

export function useId(defaultId?: MaybeRefOrGetter<string | undefined>, prefix = "react-aria") {
  const resolvedDefaultId = toValue(defaultId);
  const value = ref<string>(
    resolvedDefaultId ?? useSSRSafeId(undefined).replace(/^react-aria/, prefix)
  );

  return readonly(value);
}

export const useIdString = (defaultId?: string) => computed(() => useSSRSafeId(defaultId));
