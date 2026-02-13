import { computed, defineComponent, h, inject, provide, type PropType } from "vue";

export interface PortalProviderProps {
  getContainer?: (() => HTMLElement | null) | null;
}

export interface PortalProviderContextValue extends Omit<PortalProviderProps, "children"> {}

const PortalContext = Symbol("PortalContext");

export const UNSAFE_PortalProvider = defineComponent({
  name: "UNSAFE_PortalProvider",
  props: {
    getContainer: null as unknown as PropType<(() => HTMLElement | null) | null | undefined>,
  },
  setup(props, { slots }) {
    const context = useUNSAFE_PortalContext();
    const value = computed<PortalProviderContextValue>(() => ({
      getContainer:
        props.getContainer === null ? undefined : props.getContainer ?? context.getContainer,
    }));

    provide(PortalContext, value);
    return () => slots.default?.() ?? h("span");
  },
});

export function useUNSAFE_PortalContext(): PortalProviderContextValue {
  const context = inject<{ value: PortalProviderContextValue } | null>(PortalContext, null);
  return context?.value ?? {};
}
