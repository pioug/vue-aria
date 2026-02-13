import { ariaHideOutside } from "./ariaHideOutside";
import type { OverlayTriggerState } from "@vue-aria/overlays-state";
import { mergeProps } from "@vue-aria/utils";
import { watchEffect } from "vue";
import { useOverlay } from "./useOverlay";
import { useOverlayFocusContain } from "./Overlay";
import { usePreventScroll } from "./usePreventScroll";

export interface AriaModalOverlayProps {
  isDismissable?: boolean;
  isKeyboardDismissDisabled?: boolean;
  shouldCloseOnInteractOutside?: (element: Element) => boolean;
}

export interface ModalOverlayAria {
  modalProps: Record<string, unknown>;
  underlayProps: Record<string, unknown>;
}

export function useModalOverlay(
  props: AriaModalOverlayProps,
  state: OverlayTriggerState,
  ref: { current: HTMLElement | null }
): ModalOverlayAria {
  const { overlayProps, underlayProps } = useOverlay(
    {
      ...props,
      isOpen: state.isOpen,
      onClose: state.close,
    },
    ref
  );

  usePreventScroll({
    isDisabled: !state.isOpen,
  });

  useOverlayFocusContain();

  watchEffect((onCleanup) => {
    if (state.isOpen && ref.current) {
      const restore = ariaHideOutside([ref.current], { shouldUseInert: true });
      onCleanup(() => {
        restore();
      });
    }
  });

  return {
    modalProps: mergeProps(overlayProps),
    underlayProps,
  };
}
