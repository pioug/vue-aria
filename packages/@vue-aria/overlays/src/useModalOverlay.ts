import { computed, toValue, watchEffect } from "vue";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { UseOverlayTriggerStateResult } from "@vue-aria/overlays-state";
import { mergeProps } from "@vue-aria/utils";
import { useOverlay } from "./useOverlay";
import { usePreventScroll } from "./usePreventScroll";
import { ariaHideOutside } from "./ariaHideOutside";
import { useOverlayFocusContain } from "./useOverlayFocusContain";

export interface UseModalOverlayOptions {
  isDismissable?: MaybeReactive<boolean | undefined>;
  isKeyboardDismissDisabled?: MaybeReactive<boolean | undefined>;
  shouldCloseOnBlur?: MaybeReactive<boolean | undefined>;
  shouldCloseOnInteractOutside?: (element: Element) => boolean;
}

export interface UseModalOverlayResult {
  modalProps: ReadonlyRef<Record<string, unknown>>;
  underlayProps: ReadonlyRef<Record<string, unknown>>;
}

export function useModalOverlay(
  options: UseModalOverlayOptions,
  state: UseOverlayTriggerStateResult,
  ref: MaybeReactive<HTMLElement | null | undefined>
): UseModalOverlayResult {
  const { overlayProps, underlayProps } = useOverlay(
    {
      ...options,
      isOpen: state.isOpen,
      onClose: state.close,
    },
    ref
  );

  usePreventScroll({
    isDisabled: computed(() => !state.isOpen.value),
  });

  useOverlayFocusContain(ref, {
    isDisabled: computed(() => !state.isOpen.value),
  });

  watchEffect((onCleanup) => {
    if (!state.isOpen.value) {
      return;
    }

    const element = toValue(ref);
    if (!element) {
      return;
    }

    const restore = ariaHideOutside([element], { shouldUseInert: true });
    onCleanup(() => {
      restore();
    });
  });

  return {
    modalProps: computed(() => mergeProps(overlayProps.value)),
    underlayProps,
  };
}
