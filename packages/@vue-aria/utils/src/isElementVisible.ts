import { getOwnerWindow } from "./domHelpers";

const supportsCheckVisibility = typeof Element !== "undefined" && "checkVisibility" in Element.prototype;

function isStyleVisible(element: Element): boolean {
  const windowObject = getOwnerWindow(element);
  if (!(element instanceof windowObject.HTMLElement) && !(element instanceof windowObject.SVGElement)) {
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
    return (
      (element as any).checkVisibility({ visibilityProperty: true })
      && !element.closest("[data-react-aria-prevent-focus]")
    );
  }

  return (
    element.nodeName !== "#comment"
    && isStyleVisible(element)
    && isAttributeVisible(element, childElement)
    && (!element.parentElement || isElementVisible(element.parentElement, element))
  );
}
