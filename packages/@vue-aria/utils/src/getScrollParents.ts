import { isScrollable } from "./isScrollable";

export function getScrollParents(node: Element, checkForOverflow?: boolean): Element[] {
  const scrollParents: Element[] = [];

  while (node && node !== document.documentElement) {
    if (isScrollable(node, checkForOverflow)) {
      scrollParents.push(node);
    }
    node = node.parentElement as Element;
  }

  return scrollParents;
}
