export type Direction = "ltr" | "rtl";

export type RTLOffsetType =
  | "negative"
  | "positive-descending"
  | "positive-ascending";

let cachedRTLResult: RTLOffsetType | null = null;

export function getRTLOffsetType(recalculate = false): RTLOffsetType {
  if (cachedRTLResult === null || recalculate) {
    const outerDiv = document.createElement("div");
    const outerStyle = outerDiv.style;
    outerStyle.width = "50px";
    outerStyle.height = "50px";
    outerStyle.overflow = "scroll";
    outerStyle.direction = "rtl";

    const innerDiv = document.createElement("div");
    const innerStyle = innerDiv.style;
    innerStyle.width = "100px";
    innerStyle.height = "100px";

    outerDiv.appendChild(innerDiv);
    document.body.appendChild(outerDiv);

    if (outerDiv.scrollLeft > 0) {
      cachedRTLResult = "positive-descending";
    } else {
      outerDiv.scrollLeft = 1;
      if (outerDiv.scrollLeft === 0) {
        cachedRTLResult = "negative";
      } else {
        cachedRTLResult = "positive-ascending";
      }
    }

    document.body.removeChild(outerDiv);
    return cachedRTLResult;
  }

  return cachedRTLResult;
}

export function getScrollLeft(node: Element, direction: Direction): number {
  const element = node as HTMLElement;
  let { scrollLeft } = element;

  if (direction === "rtl") {
    const { scrollWidth, clientWidth } = element;
    switch (getRTLOffsetType()) {
      case "negative":
        scrollLeft = -scrollLeft;
        break;
      case "positive-descending":
        scrollLeft = scrollWidth - clientWidth - scrollLeft;
        break;
      default:
        break;
    }
  }

  return scrollLeft;
}

export function setScrollLeft(
  node: Element,
  direction: Direction,
  scrollLeft: number
): void {
  if (direction === "rtl") {
    switch (getRTLOffsetType()) {
      case "negative":
        scrollLeft = -scrollLeft;
        break;
      case "positive-ascending":
        break;
      default: {
        const element = node as HTMLElement;
        const { clientWidth, scrollWidth } = element;
        scrollLeft = scrollWidth - clientWidth - scrollLeft;
        break;
      }
    }
  }

  (node as HTMLElement).scrollLeft = scrollLeft;
}
