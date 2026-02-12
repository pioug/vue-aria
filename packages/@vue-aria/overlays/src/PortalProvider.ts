import { computed, defineComponent, inject, provide, type PropType } from "vue";

interface PortalProviderContext {
  getContainer: () => (() => HTMLElement | null) | undefined;
}

const PORTAL_PROVIDER_SYMBOL: unique symbol = Symbol("vue-aria-portal-provider");

function useCurrentPortalProviderContext(): PortalProviderContext | null {
  return inject<PortalProviderContext | null>(PORTAL_PROVIDER_SYMBOL, null);
}

export interface PortalProviderProps {
  getContainer?: (() => HTMLElement | null) | null;
}

export interface PortalProviderContextValue extends Omit<PortalProviderProps, "children"> {}

export function providePortalProvider(
  getContainer: () => (() => HTMLElement | null) | null | undefined
): PortalProviderContext {
  const parent = useCurrentPortalProviderContext();
  const resolvedGetContainer = computed(() => {
    const containerGetter = getContainer();
    if (containerGetter === null) {
      return undefined;
    }

    return containerGetter ?? parent?.getContainer();
  });

  const context: PortalProviderContext = {
    getContainer: () => resolvedGetContainer.value,
  };

  provide(PORTAL_PROVIDER_SYMBOL, context);

  return context;
}

export const UNSAFE_PortalProvider = defineComponent({
  name: "UNSAFE_PortalProvider",
  props: {
    getContainer: {
      type: null as unknown as PropType<(() => HTMLElement | null) | null | undefined>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    providePortalProvider(() => props.getContainer);

    return () => slots.default?.() ?? null;
  },
});

export function useUNSAFE_PortalContext(): PortalProviderContextValue {
  return {
    getContainer: useCurrentPortalProviderContext()?.getContainer(),
  };
}
