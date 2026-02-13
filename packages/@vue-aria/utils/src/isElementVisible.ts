import { getOwnerWindow } from "./domHelpers";

const supportsCheckVisibility = typeof Element !== "undefined" && "checkVisibility" in Element.prototype;

function isStyleVisible(element: Element): boolean {
  const windowObject = getOwnerWindow(element);
  const isHtmlElement = element instanceof HTMLElement || element instanceof windowObject.HTMLElement;
  const isSvgElement = element instanceof SVGElement || element instanceof windowObject.SVGElement;
  if (!isHtmlElement && !isSvgElement) {
    return false;
  }

  const { display, visibility } = (element as HTMLElement).style;

  let isVisible = (
    display !== "none"
    && visibility !== "hidden"
    && visibility !== "collapse"
  );

  if (isVisible) {
    const { getComputedStyle } = element.ownerDocument.defaultView as Window;
    const { display: computedDisplay, visibility: computedVisibility } = getComputedStyle(element);

    isVisible = (
      computedDisplay !== "none"
      && computedVisibility !== "hidden"
      && computedVisibility !== "collapse"
    );
  }

  return isVisible;
}

function isAttributeVisible(element: Element, childElement?: Element): boolean {
  return (
    !element.hasAttribute("hidden")
    && !element.hasAttribute("data-react-aria-prevent-focus")
    && (element.nodeName === "DETAILS" && childElement && childElement.nodeName !== "SUMMARY"
      ? element.hasAttribute("open")
      : true)
  );
}

export function isElementVisible(element: Element, childElement?: Element): boolean {
  if (supportsCheckVisibility) {
    const isVisibleViaCheckVisibility = (
      (element as any).checkVisibility({ visibilityProperty: true })
      && !element.closest("[data-react-aria-prevent-focus]")
    );
    if (isVisibleViaCheckVisibility) {
      return true;
    }

    // jsdom can report iframe-owned elements as not visible via checkVisibility.
    if (typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent)) {
      return (
        element.nodeName !== "#comment"
        && isStyleVisible(element)
        && isAttributeVisible(element, childElement)
        && (!element.parentElement || isElementVisible(element.parentElement, element))
      );
    }

    return false;
  }

  return (
    element.nodeName !== "#comment"
    && isStyleVisible(element)
    && isAttributeVisible(element, childElement)
    && (!element.parentElement || isElementVisible(element.parentElement, element))
  );
}
