import { computed, toValue, watchEffect } from "vue";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { UseOverlayTriggerStateResult } from "@vue-aria/overlays-state";
import { mergeProps } from "@vue-aria/utils";
import {
  useOverlayPosition,
  type UseOverlayPositionOptions,
} from "./useOverlayPosition";
import { useOverlay } from "./useOverlay";
import { usePreventScroll } from "./usePreventScroll";
import { ariaHideOutside, keepVisible } from "./ariaHideOutside";
import type { PlacementAxis } from "./calculatePosition";

export interface UsePopoverOptions
  extends Omit<
    UseOverlayPositionOptions,
    "isOpen" | "onClose" | "targetRef" | "overlayRef"
  > {
  triggerRef: MaybeReactive<Element | null | undefined>;
  popoverRef: MaybeReactive<HTMLElement | null | undefined>;
  arrowRef?: MaybeReactive<HTMLElement | null | undefined>;
  groupRef?: MaybeReactive<HTMLElement | null | undefined>;
  isNonModal?: MaybeReactive<boolean | undefined>;
  isKeyboardDismissDisabled?: MaybeReactive<boolean | undefined>;
  shouldCloseOnInteractOutside?: (element: Element) => boolean;
  trigger?: MaybeReactive<string | undefined>;
}

export interface UsePopoverResult {
  popoverProps: ReadonlyRef<Record<string, unknown>>;
  arrowProps: ReadonlyRef<Record<string, unknown>>;
  underlayProps: ReadonlyRef<Record<string, unknown>>;
  placement: ReadonlyRef<PlacementAxis | null>;
  triggerAnchorPoint: ReadonlyRef<{ x: number; y: number } | null>;
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

export function usePopover(
  options: UsePopoverOptions,
  state: UseOverlayTriggerStateResult
): UsePopoverResult {
  const isNonModal = computed(() => resolveBoolean(options.isNonModal));
  const isSubmenu = computed(() => toValue(options.trigger) === "SubmenuTrigger");
  const interactionTarget = computed(
    () => toValue(options.groupRef) ?? toValue(options.popoverRef)
  );

  const { overlayProps, underlayProps } = useOverlay(
    {
      isOpen: state.isOpen,
      onClose: state.close,
      shouldCloseOnBlur: true,
      isDismissable: computed(() => !isNonModal.value || isSubmenu.value),
      isKeyboardDismissDisabled: options.isKeyboardDismissDisabled,
      shouldCloseOnInteractOutside: options.shouldCloseOnInteractOutside,
    },
    interactionTarget
  );

  const {
    overlayProps: positionProps,
    arrowProps,
    placement,
    triggerAnchorPoint,
  } = useOverlayPosition({
    ...options,
    targetRef: options.triggerRef,
    overlayRef: options.popoverRef,
    isOpen: state.isOpen,
    onClose:
      isNonModal.value && !isSubmenu.value
        ? state.close
        : null,
  });

  usePreventScroll({
    isDisabled: computed(() => isNonModal.value || !state.isOpen.value),
  });

  watchEffect((onCleanup) => {
    if (!state.isOpen.value) {
      return;
    }

    const target = toValue(options.groupRef) ?? toValue(options.popoverRef);
    if (!target) {
      return;
    }

    if (isNonModal.value) {
      const restore = keepVisible(target);
      if (restore) {
        onCleanup(() => {
          restore();
        });
      }
      return;
    }

    const restore = ariaHideOutside([target], { shouldUseInert: true });
    onCleanup(() => {
      restore();
    });
  });

  return {
    popoverProps: computed(() =>
      mergeProps(overlayProps.value, positionProps.value)
    ),
    arrowProps,
    underlayProps,
    placement,
    triggerAnchorPoint,
  };
}
