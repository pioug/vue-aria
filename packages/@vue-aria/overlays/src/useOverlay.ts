import { computed, toValue, watchEffect } from "vue";
import { useFocusWithin, useInteractOutside } from "@vue-aria/interactions";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";

export interface UseOverlayOptions {
  isOpen?: MaybeReactive<boolean | undefined>;
  onClose?: () => void;
  isDismissable?: MaybeReactive<boolean | undefined>;
  shouldCloseOnBlur?: MaybeReactive<boolean | undefined>;
  isKeyboardDismissDisabled?: MaybeReactive<boolean | undefined>;
  shouldCloseOnInteractOutside?: (element: Element) => boolean;
}

export interface UseOverlayResult {
  overlayProps: ReadonlyRef<Record<string, unknown>>;
  underlayProps: ReadonlyRef<Record<string, unknown>>;
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

const visibleOverlays: Element[] = [];

export function useOverlay(
  options: UseOverlayOptions,
  ref: MaybeReactive<Element | null | undefined>
): UseOverlayResult {
  const isOpen = computed(() => resolveBoolean(options.isOpen));
  const isDismissable = computed(() => resolveBoolean(options.isDismissable));
  const shouldCloseOnBlur = computed(() => resolveBoolean(options.shouldCloseOnBlur));
  const isKeyboardDismissDisabled = computed(() =>
    resolveBoolean(options.isKeyboardDismissDisabled)
  );

  let lastVisibleOverlay: Element | null = null;

  const hideTopmost = (): void => {
    const overlay = toValue(ref);
    if (!overlay) {
      return;
    }

    if (visibleOverlays[visibleOverlays.length - 1] === overlay) {
      options.onClose?.();
    }
  };

  watchEffect((onCleanup) => {
    const overlay = toValue(ref);
    if (!overlay || !isOpen.value) {
      return;
    }

    if (!visibleOverlays.includes(overlay)) {
      visibleOverlays.push(overlay);
    }

    onCleanup(() => {
      const index = visibleOverlays.indexOf(overlay);
      if (index >= 0) {
        visibleOverlays.splice(index, 1);
      }
    });
  });

  const shouldCloseForTarget = (target: EventTarget | null): boolean => {
    if (!(target instanceof Element)) {
      return false;
    }

    if (!options.shouldCloseOnInteractOutside) {
      return true;
    }

    return options.shouldCloseOnInteractOutside(target);
  };

  useInteractOutside({
    ref,
    isDisabled: computed(() => !isDismissable.value || !isOpen.value),
    onInteractOutsideStart: (event) => {
      const overlay = toValue(ref);
      if (!overlay) {
        return;
      }

      lastVisibleOverlay = visibleOverlays[visibleOverlays.length - 1] ?? null;
      if (shouldCloseForTarget(event.target) && lastVisibleOverlay === overlay) {
        event.stopPropagation();
        event.preventDefault();
      }
    },
    onInteractOutside: (event) => {
      const overlay = toValue(ref);
      if (!overlay) {
        return;
      }

      if (shouldCloseForTarget(event.target)) {
        if (visibleOverlays[visibleOverlays.length - 1] === overlay) {
          event.stopPropagation();
          event.preventDefault();
        }

        if (lastVisibleOverlay === overlay) {
          hideTopmost();
        }
      }

      lastVisibleOverlay = null;
    },
  });

  const { focusWithinProps } = useFocusWithin({
    isDisabled: computed(() => !shouldCloseOnBlur.value),
    onBlurWithin: (event) => {
      const relatedTarget = event.relatedTarget;
      if (!relatedTarget) {
        return;
      }

      if (shouldCloseForTarget(relatedTarget)) {
        options.onClose?.();
      }
    },
  });

  const overlayProps = computed<Record<string, unknown>>(() => ({
    ...focusWithinProps,
    onKeydown: (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        !isKeyboardDismissDisabled.value &&
        !(event as KeyboardEvent & { isComposing?: boolean }).isComposing
      ) {
        event.stopPropagation();
        event.preventDefault();
        hideTopmost();
      }
    },
  }));

  const underlayProps = computed<Record<string, unknown>>(() => ({
    onPointerdown: (event: PointerEvent) => {
      if (event.target === event.currentTarget) {
        event.preventDefault();
      }
    },
  }));

  return {
    overlayProps,
    underlayProps,
  };
}
