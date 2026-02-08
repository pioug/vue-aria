import {
  computed,
  getCurrentInstance,
  inject,
  watch,
  provide,
  ref,
  toValue,
} from "vue";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";

interface ModalProviderContext {
  parent: ModalProviderContext | null;
  modalCount: ReadonlyRef<number>;
  addModal: () => void;
  removeModal: () => void;
}

const MODAL_PROVIDER_SYMBOL: unique symbol = Symbol("vue-aria-modal-provider");

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

function createModalProviderContext(parent: ModalProviderContext | null): ModalProviderContext {
  const modalCount = ref(0);

  const addModal = (): void => {
    modalCount.value += 1;
    parent?.addModal();
  };

  const removeModal = (): void => {
    modalCount.value = Math.max(0, modalCount.value - 1);
    parent?.removeModal();
  };

  return {
    parent,
    modalCount,
    addModal,
    removeModal,
  };
}

function useCurrentModalProviderContext(): ModalProviderContext | null {
  const instance = getCurrentInstance();
  if (instance) {
    const localContext = (
      instance as unknown as { provides?: Record<symbol, unknown> }
    ).provides?.[MODAL_PROVIDER_SYMBOL] as ModalProviderContext | undefined;
    if (localContext) {
      return localContext;
    }
  }

  return inject<ModalProviderContext | null>(MODAL_PROVIDER_SYMBOL, null);
}

export interface UseModalProviderResult {
  modalProviderProps: ReadonlyRef<Record<string, unknown>>;
}

export interface UseModalOptions {
  isDisabled?: MaybeReactive<boolean | undefined>;
}

export interface UseModalResult {
  modalProps: ReadonlyRef<Record<string, unknown>>;
}

export function provideModalProvider(): ModalProviderContext {
  const parent = inject<ModalProviderContext | null>(MODAL_PROVIDER_SYMBOL, null);
  const context = createModalProviderContext(parent);

  if (getCurrentInstance()) {
    provide(MODAL_PROVIDER_SYMBOL, context);
  }

  return context;
}

export function provideOverlayProvider(): ModalProviderContext {
  return provideModalProvider();
}

export function useModalProvider(): UseModalProviderResult {
  const context = useCurrentModalProviderContext();

  return {
    modalProviderProps: computed(() => ({
      "aria-hidden": context && context.modalCount.value > 0 ? true : undefined,
    })),
  };
}

export function useModal(options: UseModalOptions = {}): UseModalResult {
  const context = useCurrentModalProviderContext();

  if (!context) {
    throw new Error("Modal is not contained within a provider");
  }

  const isDisabled = computed(() => resolveBoolean(options.isDisabled));

  watch(
    isDisabled,
    (disabled, _previous, onCleanup) => {
      if (disabled || !context.parent) {
        return;
      }

      context.parent.addModal();
      onCleanup(() => {
        context.parent?.removeModal();
      });
    },
    { immediate: true }
  );

  return {
    modalProps: computed(() => ({
      "data-ismodal": !isDisabled.value,
    })),
  };
}
