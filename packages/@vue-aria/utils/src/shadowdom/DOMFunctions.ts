import { isShadowRoot } from "../domHelpers";
import { shadowDOM } from "@vue-aria/flags";

export function nodeContains(
  node: Node | null | undefined,
  otherNode: EventTarget | Node | null | undefined
): boolean {
  if (!shadowDOM()) {
    return node instanceof Node && otherNode instanceof Node ? node.contains(otherNode) : false;
  }

  if (!node || !otherNode) {
    return false;
  }

  let currentNode: HTMLElement | Node | null = otherNode instanceof Node ? otherNode : null;

  while (currentNode !== null) {
    if (currentNode === node) {
      return true;
    }

    if (
      (currentNode as HTMLSlotElement).tagName === "SLOT"
      && (currentNode as HTMLSlotElement).assignedSlot
    ) {
      currentNode = (currentNode as HTMLSlotElement).assignedSlot?.parentNode ?? null;
    } else if (isShadowRoot(currentNode)) {
      currentNode = currentNode.host;
    } else {
      currentNode = currentNode.parentNode;
    }
  }

  return false;
}

export const getActiveElement = (doc: Document = document): Element | null => {
  if (!shadowDOM()) {
    return doc.activeElement;
  }

  let activeElement: Element | null = doc.activeElement;

  while (
    activeElement
    && "shadowRoot" in activeElement
    && activeElement.shadowRoot?.activeElement
  ) {
    activeElement = activeElement.shadowRoot.activeElement;
  }

  return activeElement;
};

export function getEventTarget<T extends Event>(event: T): Element {
  if (shadowDOM() && (event.target as HTMLElement).shadowRoot) {
    if (event.composedPath) {
      return event.composedPath()[0] as Element;
    }
  }

  return event.target as Element;
}
