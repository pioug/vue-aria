export function isScrollable(
  node: Element | null,
  checkForOverflow?: boolean
): boolean {
  if (!node) {
    return false;
  }

  const style = window.getComputedStyle(node);
  let scrollable = /(auto|scroll)/.test(
    style.overflow + style.overflowX + style.overflowY
  );
  if (scrollable && checkForOverflow) {
    scrollable =
      node.scrollHeight !== node.clientHeight ||
      node.scrollWidth !== node.clientWidth;
  }

  return scrollable;
}
