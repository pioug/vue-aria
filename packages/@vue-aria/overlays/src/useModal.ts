import { useIsSSR } from "@vue-aria/ssr";
import {
  Teleport,
  computed,
  defineComponent,
  h,
  inject,
  onMounted,
  onScopeDispose,
  provide,
  ref,
  type PropType,
} from "vue";
import { useUNSAFE_PortalContext } from "./PortalProvider";

export interface ModalProviderProps {
  [key: string]: unknown;
}

interface ModalContext {
  parent: ModalContext | null;
  modalCount: { value: number };
  addModal: () => void;
  removeModal: () => void;
}

const Context = Symbol("ModalContext");

function useModalContext(): ModalContext | null {
  return inject<ModalContext | null>(Context, null);
}

export const ModalProvider = defineComponent({
  name: "ModalProvider",
  setup(_, { slots }) {
    const parent = useModalContext();
    const modalCount = ref(0);
    const context: ModalContext = {
      parent,
      modalCount,
      addModal() {
        modalCount.value += 1;
        parent?.addModal();
      },
      removeModal() {
        modalCount.value -= 1;
        parent?.removeModal();
      },
    };

    provide(Context, context);
    return () => slots.default?.() ?? h("span");
  },
});

export interface ModalProviderAria {
  modalProviderProps: Record<string, unknown>;
}

export function useModalProvider(): ModalProviderAria {
  const context = useModalContext();
  return {
    modalProviderProps: {
      get "aria-hidden"() {
        return context && context.modalCount.value > 0 ? true : undefined;
      },
    },
  };
}

const OverlayContainerDOM = defineComponent({
  name: "OverlayContainerDOM",
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const { modalProviderProps } = useModalProvider();
    return () => h("div", { ...attrs, ...modalProviderProps, "data-overlay-container": "" }, slots.default?.());
  },
});

export const OverlayProvider = defineComponent({
  name: "OverlayProvider",
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    return () => h(ModalProvider, null, { default: () => [h(OverlayContainerDOM, attrs, slots)] });
  },
});

export interface OverlayContainerProps {
  portalContainer?: Element | null;
}

export const OverlayContainer = defineComponent({
  name: "OverlayContainer",
  props: {
    portalContainer: Object as PropType<Element | null | undefined>,
  },
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    const isSSR = useIsSSR();
    const portalContext = useUNSAFE_PortalContext();

    const container = computed(() => {
      if (props.portalContainer) {
        return props.portalContainer;
      }
      if (portalContext.getContainer) {
        return portalContext.getContainer();
      }
      return isSSR ? null : document.body;
    });

    onMounted(() => {
      if (container.value?.closest("[data-overlay-container]")) {
        throw new Error(
          "An OverlayContainer must not be inside another container. Please change the portalContainer prop."
        );
      }
    });

    return () => {
      if (!container.value) {
        return null;
      }
      return h(Teleport, { to: container.value }, h(OverlayProvider, attrs, slots));
    };
  },
});

export interface AriaModalOptions {
  isDisabled?: boolean;
}

export interface ModalAria {
  modalProps: Record<string, unknown>;
}

export function useModal(options?: AriaModalOptions): ModalAria {
  const context = useModalContext();
  if (!context) {
    throw new Error("Modal is not contained within a provider");
  }

  if (!options?.isDisabled && context.parent) {
    context.parent.addModal();
    onScopeDispose(() => {
      context.parent?.removeModal();
    });
  }

  return {
    modalProps: {
      "data-ismodal": !options?.isDisabled,
    },
  };
}
