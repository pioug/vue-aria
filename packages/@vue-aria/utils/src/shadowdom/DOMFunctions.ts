/* eslint-disable rsp-rules/no-non-shadow-contains, rsp-rules/safe-event-target */

import {getOwnerWindow, isShadowRoot} from '../domHelpers';
import {shadowDOM} from '../../../../@vue-stately/flags/src/index';

export function nodeContains(
  node: Node | Element | null | undefined,
  otherNode: Node | Element | null | undefined
): boolean {
  if (!shadowDOM()) {
    return otherNode && node ? node.contains(otherNode) : false;
  }

  if (!node || !otherNode) {
    return false;
  }

  let currentNode: HTMLElement | Node | null | undefined = otherNode;

  while (currentNode !== null) {
    if (currentNode === node) {
      return true;
    }

    if ((currentNode as HTMLSlotElement).tagName === 'SLOT' &&
      (currentNode as HTMLSlotElement).assignedSlot) {
      currentNode = (currentNode as HTMLSlotElement).assignedSlot!.parentNode;
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

  while (activeElement && 'shadowRoot' in activeElement &&
  activeElement.shadowRoot?.activeElement) {
    activeElement = activeElement.shadowRoot.activeElement;
  }

  return activeElement;
};

type EventLike = Event & {
  nativeEvent?: Event & {composedPath?: () => EventTarget[]};
};

export function getEventTarget<T extends EventLike>(event: T): EventTarget | null {
  if (shadowDOM() && (event.target instanceof Element) && event.target.shadowRoot) {
    if ('composedPath' in event && typeof event.composedPath === 'function') {
      return event.composedPath()[0] ?? null;
    } else if (event.nativeEvent && typeof event.nativeEvent.composedPath === 'function') {
      return event.nativeEvent.composedPath()[0] ?? null;
    }
  }
  return event.target as EventTarget | null;
}

export function isFocusWithin(node: Element | null | undefined): boolean {
  if (!node) {
    return false;
  }
  const root = node.getRootNode();
  const ownerWindow = getOwnerWindow(node);
  if (!(root instanceof ownerWindow.Document || root instanceof ownerWindow.ShadowRoot)) {
    return false;
  }
  const activeElement = root.activeElement;
  return activeElement != null && node.contains(activeElement);
}
