import { isElementInChildOfActiveScope } from "@vue-aria/focus";
import { useFocusWithin, useInteractOutside } from "@vue-aria/interactions";
import { mergeProps } from "@vue-aria/utils";
import { watchEffect } from "vue";

export interface AriaOverlayProps {
  isOpen?: boolean;
  onClose?: () => void;
  isDismissable?: boolean;
  shouldCloseOnBlur?: boolean;
  isKeyboardDismissDisabled?: boolean;
  shouldCloseOnInteractOutside?: (element: Element) => boolean;
}

export interface OverlayAria {
  overlayProps: Record<string, unknown>;
  underlayProps: Record<string, unknown>;
}

const visibleOverlays: Array<{ current: Element | null }> = [];

export function useOverlay(props: AriaOverlayProps, ref: { current: Element | null }): OverlayAria {
  const {
    onClose,
    shouldCloseOnBlur,
    isOpen,
    isDismissable = false,
    isKeyboardDismissDisabled = false,
    shouldCloseOnInteractOutside,
  } = props;

  const lastVisibleOverlay = { current: undefined as { current: Element | null } | undefined };

  watchEffect((onCleanup) => {
    if (isOpen && !visibleOverlays.includes(ref)) {
      visibleOverlays.push(ref);
      onCleanup(() => {
        const index = visibleOverlays.indexOf(ref);
        if (index >= 0) {
          visibleOverlays.splice(index, 1);
        }
      });
    }
  });

  const onHide = () => {
    if (visibleOverlays[visibleOverlays.length - 1] === ref && onClose) {
      onClose();
    }
  };

  const onInteractOutsideStart = (e: MouseEvent | PointerEvent | TouchEvent) => {
    const topMostOverlay = visibleOverlays[visibleOverlays.length - 1];
    lastVisibleOverlay.current = topMostOverlay;

    if (!shouldCloseOnInteractOutside || shouldCloseOnInteractOutside(e.target as Element)) {
      if (topMostOverlay === ref) {
        e.stopPropagation();
        e.preventDefault();
      }
    }
  };

  const onInteractOutside = (e: MouseEvent | PointerEvent | TouchEvent) => {
    if (!shouldCloseOnInteractOutside || shouldCloseOnInteractOutside(e.target as Element)) {
      if (visibleOverlays[visibleOverlays.length - 1] === ref) {
        e.stopPropagation();
        e.preventDefault();
      }

      if (lastVisibleOverlay.current === ref) {
        onHide();
      }
    }

    lastVisibleOverlay.current = undefined;
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && !isKeyboardDismissDisabled && !(e as any).isComposing) {
      e.stopPropagation();
      e.preventDefault();
      onHide();
    }
  };

  useInteractOutside({
    ref,
    onInteractOutside: isDismissable && isOpen ? onInteractOutside : undefined,
    onInteractOutsideStart,
  });

  const { focusWithinProps } = useFocusWithin({
    isDisabled: !shouldCloseOnBlur,
    onBlurWithin: (e) => {
      if (!isElementInChildOfActiveScope(e.relatedTarget as Element | null)) {
        onClose?.();
      }
    },
  });

  return {
    overlayProps: mergeProps(focusWithinProps, {
      onKeydown: onKeyDown,
    }),
    underlayProps: {
      onPointerdown: (e: PointerEvent) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      },
    },
  };
}
