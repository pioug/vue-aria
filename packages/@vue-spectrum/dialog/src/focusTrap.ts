const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "[contenteditable=\"true\"]",
  "[tabindex]",
].join(", ");

function isVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden";
}

export function getFocusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      element.tabIndex >= 0 &&
      !element.hasAttribute("disabled") &&
      !element.getAttribute("aria-hidden") &&
      isVisible(element)
  );
}

export function trapFocusWithinOverlay(
  event: KeyboardEvent,
  root: HTMLElement,
  fallbackTarget?: HTMLElement | null
): void {
  if (event.key !== "Tab") {
    return;
  }

  const focusables = getFocusableElements(root);
  const activeElement =
    typeof document !== "undefined" && document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

  if (focusables.length === 0) {
    event.preventDefault();
    (fallbackTarget ?? root).focus();
    return;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const currentIndex =
    activeElement && root.contains(activeElement)
      ? focusables.indexOf(activeElement)
      : -1;

  event.preventDefault();

  if (event.shiftKey) {
    if (currentIndex <= 0) {
      last.focus();
      return;
    }

    focusables[currentIndex - 1]?.focus();
    return;
  }

  if (currentIndex < 0 || currentIndex >= focusables.length - 1) {
    first.focus();
    return;
  }

  focusables[currentIndex + 1]?.focus();
}
