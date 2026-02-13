import { ariaHideOutside, keepVisible } from "./ariaHideOutside";
import { useOverlayPosition, type AriaPositionProps } from "./useOverlayPosition";
import { mergeProps } from "@vue-aria/utils";
import type { OverlayTriggerState } from "@vue-aria/overlays-state";
import type { PlacementAxis } from "./types";
import { watchEffect } from "vue";
import { useOverlay } from "./useOverlay";
import { usePreventScroll } from "./usePreventScroll";

export interface AriaPopoverProps
  extends Omit<AriaPositionProps, "isOpen" | "onClose" | "targetRef" | "overlayRef"> {
  triggerRef: { current: Element | null };
  popoverRef: { current: Element | null };
  arrowRef?: { current: Element | null };
  groupRef?: { current: Element | null };
  isNonModal?: boolean;
  isKeyboardDismissDisabled?: boolean;
  shouldCloseOnInteractOutside?: (element: Element) => boolean;
  trigger?: string;
}

export interface PopoverAria {
  popoverProps: Record<string, unknown>;
  arrowProps: Record<string, unknown>;
  underlayProps: Record<string, unknown>;
  placement: PlacementAxis | null;
  triggerAnchorPoint: { x: number; y: number } | null;
}

export function usePopover(props: AriaPopoverProps, state: OverlayTriggerState): PopoverAria {
  const {
    triggerRef,
    popoverRef,
    groupRef,
    isNonModal,
    isKeyboardDismissDisabled,
    shouldCloseOnInteractOutside,
    ...otherProps
  } = props;

  const isSubmenu = otherProps.trigger === "SubmenuTrigger";

  const { overlayProps, underlayProps } = useOverlay(
    {
      isOpen: state.isOpen,
      onClose: state.close,
      shouldCloseOnBlur: true,
      isDismissable: !isNonModal || isSubmenu,
      isKeyboardDismissDisabled,
      shouldCloseOnInteractOutside,
    },
    groupRef ?? popoverRef
  );

  const {
    overlayProps: positionProps,
    arrowProps,
    placement,
    triggerAnchorPoint: origin,
  } = useOverlayPosition({
    ...otherProps,
    targetRef: triggerRef,
    overlayRef: popoverRef,
    isOpen: state.isOpen,
    onClose: isNonModal && !isSubmenu ? state.close : null,
  });

  usePreventScroll({
    isDisabled: isNonModal || !state.isOpen,
  });

  watchEffect((onCleanup) => {
    if (state.isOpen && popoverRef.current && !isNonModal) {
      if (groupRef?.current) {
        keepVisible(groupRef.current);
      }
      const restore = ariaHideOutside([groupRef?.current ?? popoverRef.current]);
      onCleanup(() => {
        restore();
      });
    }
  });

  return {
    popoverProps: mergeProps(overlayProps, positionProps),
    arrowProps,
    underlayProps,
    placement,
    triggerAnchorPoint: origin,
  };
}
