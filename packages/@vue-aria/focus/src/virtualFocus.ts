import { getActiveElement, getOwnerDocument } from "@vue-aria/utils";

export function moveVirtualFocus(to: Element | null): void {
  const from = getVirtuallyFocusedElement(getOwnerDocument(to));
  if (from !== to) {
    if (from) {
      dispatchVirtualBlur(from, to);
    }

    if (to) {
      dispatchVirtualFocus(to, from);
    }
  }
}

export function dispatchVirtualBlur(from: Element, to: Element | null): void {
  from.dispatchEvent(new FocusEvent("blur", { relatedTarget: to }));
  from.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: to }));
}

export function dispatchVirtualFocus(to: Element, from: Element | null): void {
  to.dispatchEvent(new FocusEvent("focus", { relatedTarget: from }));
  to.dispatchEvent(new FocusEvent("focusin", { bubbles: true, relatedTarget: from }));
}

export function getVirtuallyFocusedElement(doc: Document): Element | null {
  const activeElement = getActiveElement(doc);
  const activeDescendant = activeElement?.getAttribute("aria-activedescendant");
  if (activeDescendant) {
    return doc.getElementById(activeDescendant) || activeElement;
  }

  return activeElement;
}
