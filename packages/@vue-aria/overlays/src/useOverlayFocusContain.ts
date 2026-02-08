import { computed, toValue, watchEffect } from "vue";
import type { MaybeReactive } from "@vue-aria/types";
import { nodeContains } from "@vue-aria/utils";

export interface UseOverlayFocusContainOptions {
  isDisabled?: MaybeReactive<boolean | undefined>;
  shouldRestoreFocus?: MaybeReactive<boolean | undefined>;
}

function resolveBoolean(
  value: MaybeReactive<boolean | undefined> | undefined,
  fallback: boolean
): boolean {
  if (value === undefined) {
    return fallback;
  }

  return Boolean(toValue(value));
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusables = container.querySelectorAll<HTMLElement>(
    'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
  );

  return Array.from(focusables).filter(
    (element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true"
  );
}

function focusFirstInContainer(container: HTMLElement): void {
  const focusables = getFocusableElements(container);
  const first = focusables[0];

  if (first) {
    first.focus();
    return;
  }

  if (!container.hasAttribute("tabindex")) {
    container.tabIndex = -1;
  }
  container.focus();
}

export function useOverlayFocusContain(
  ref: MaybeReactive<HTMLElement | null | undefined>,
  options: UseOverlayFocusContainOptions = {}
): void {
  const isDisabled = computed(() => resolveBoolean(options.isDisabled, false));
  const shouldRestoreFocus = computed(() =>
    resolveBoolean(options.shouldRestoreFocus, true)
  );

  watchEffect((onCleanup) => {
    if (typeof document === "undefined" || isDisabled.value) {
      return;
    }

    const container = toValue(ref);
    if (!container) {
      return;
    }

    const previousFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    if (!nodeContains(container, document.activeElement)) {
      focusFirstInContainer(container);
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Tab") {
        return;
      }

      const focusables = getFocusableElements(container);
      if (focusables.length === 0) {
        event.preventDefault();
        focusFirstInContainer(container);
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey) {
        if (activeElement === first || !nodeContains(container, activeElement)) {
          event.preventDefault();
          last?.focus();
        }
        return;
      }

      if (activeElement === last || !nodeContains(container, activeElement)) {
        event.preventDefault();
        first?.focus();
      }
    };

    const onFocusIn = (event: FocusEvent): void => {
      if (nodeContains(container, event.target)) {
        return;
      }

      focusFirstInContainer(container);
    };

    container.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("focusin", onFocusIn, true);

    onCleanup(() => {
      container.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("focusin", onFocusIn, true);

      if (
        shouldRestoreFocus.value &&
        previousFocusedElement &&
        previousFocusedElement.isConnected
      ) {
        previousFocusedElement.focus();
      }
    });
  });
}
