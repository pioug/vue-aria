import { toValue } from "vue";
import type { FocusManager } from "./types";
import type { MaybeReactive } from "@vue-aria/types";

const FOCUSABLE_SELECTOR = [
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  "input:not([disabled])",
  "button:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "a[href]",
].join(",");

function isFocusable(element: HTMLElement): boolean {
  if (element.hidden) {
    return false;
  }
  if (element.getAttribute("aria-hidden") === "true") {
    return false;
  }
  return true;
}

function getFocusableElements(root: Element): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    isFocusable
  );
}

export function createFocusManager(
  rootRef: MaybeReactive<Element | null | undefined>
): FocusManager {
  const focusAt = (index: number): boolean => {
    const root = toValue(rootRef);
    if (!root) {
      return false;
    }

    const elements = getFocusableElements(root);
    if (elements.length === 0) {
      return false;
    }

    const safeIndex = Math.max(0, Math.min(index, elements.length - 1));
    elements[safeIndex]?.focus();
    return document.activeElement === elements[safeIndex];
  };

  const focusRelative = (step: 1 | -1): boolean => {
    const root = toValue(rootRef);
    if (!root) {
      return false;
    }

    const elements = getFocusableElements(root);
    if (elements.length === 0) {
      return false;
    }

    const active = document.activeElement as HTMLElement | null;
    const currentIndex = active ? elements.findIndex((item) => item === active) : -1;
    const nextIndex =
      currentIndex < 0
        ? step > 0
          ? 0
          : elements.length - 1
        : currentIndex + step;

    if (nextIndex < 0 || nextIndex >= elements.length) {
      return false;
    }

    elements[nextIndex]?.focus();
    return document.activeElement === elements[nextIndex];
  };

  return {
    focusFirst: () => focusAt(0),
    focusNext: () => focusRelative(1),
    focusPrevious: () => focusRelative(-1),
  };
}
