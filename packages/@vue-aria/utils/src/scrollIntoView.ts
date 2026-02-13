import { getScrollParents } from "./getScrollParents";
import { nodeContains } from "./shadowdom/DOMFunctions";

interface ScrollIntoViewportOpts {
  containingElement?: Element | null;
}

export function scrollIntoView(scrollView: HTMLElement, element: HTMLElement): void {
  let offsetX = relativeOffset(scrollView, element, "left");
  let offsetY = relativeOffset(scrollView, element, "top");
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  let x = scrollView.scrollLeft;
  let y = scrollView.scrollTop;

  const {
    borderTopWidth,
    borderLeftWidth,
    scrollPaddingTop,
    scrollPaddingRight,
    scrollPaddingBottom,
    scrollPaddingLeft,
  } = getComputedStyle(scrollView);

  const borderAdjustedX = x + parseInt(borderLeftWidth, 10);
  const borderAdjustedY = y + parseInt(borderTopWidth, 10);
  const maxX = borderAdjustedX + scrollView.clientWidth;
  const maxY = borderAdjustedY + scrollView.clientHeight;

  const scrollPaddingTopNumber = parseInt(scrollPaddingTop, 10) || 0;
  const scrollPaddingBottomNumber = parseInt(scrollPaddingBottom, 10) || 0;
  const scrollPaddingRightNumber = parseInt(scrollPaddingRight, 10) || 0;
  const scrollPaddingLeftNumber = parseInt(scrollPaddingLeft, 10) || 0;

  if (offsetX <= x + scrollPaddingLeftNumber) {
    x = offsetX - parseInt(borderLeftWidth, 10) - scrollPaddingLeftNumber;
  } else if (offsetX + width > maxX - scrollPaddingRightNumber) {
    x += offsetX + width - maxX + scrollPaddingRightNumber;
  }

  if (offsetY <= borderAdjustedY + scrollPaddingTopNumber) {
    y = offsetY - parseInt(borderTopWidth, 10) - scrollPaddingTopNumber;
  } else if (offsetY + height > maxY - scrollPaddingBottomNumber) {
    y += offsetY + height - maxY + scrollPaddingBottomNumber;
  }

  scrollView.scrollLeft = x;
  scrollView.scrollTop = y;
}

function relativeOffset(ancestor: HTMLElement, child: HTMLElement, axis: "left" | "top") {
  const prop = axis === "left" ? "offsetLeft" : "offsetTop";
  let sum = 0;

  while (child.offsetParent) {
    sum += child[prop];
    if (child.offsetParent === ancestor) {
      break;
    } else if (nodeContains(child.offsetParent, ancestor)) {
      sum -= ancestor[prop];
      break;
    }
    child = child.offsetParent as HTMLElement;
  }

  return sum;
}

export function scrollIntoViewport(targetElement: Element | null, opts?: ScrollIntoViewportOpts): void {
  if (targetElement && nodeContains(document, targetElement)) {
    const root = document.scrollingElement || document.documentElement;
    const isScrollPrevented = window.getComputedStyle(root).overflow === "hidden";

    if (!isScrollPrevented) {
      const { left: originalLeft, top: originalTop } = targetElement.getBoundingClientRect();
      targetElement.scrollIntoView?.({ block: "nearest" });
      const { left: newLeft, top: newTop } = targetElement.getBoundingClientRect();

      if ((Math.abs(originalLeft - newLeft) > 1) || (Math.abs(originalTop - newTop) > 1)) {
        opts?.containingElement?.scrollIntoView?.({ block: "center", inline: "center" });
        targetElement.scrollIntoView?.({ block: "nearest" });
      }
    } else {
      const scrollParents = getScrollParents(targetElement);
      for (const scrollParent of scrollParents) {
        scrollIntoView(scrollParent as HTMLElement, targetElement as HTMLElement);
      }
    }
  }
}
