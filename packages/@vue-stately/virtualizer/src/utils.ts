export type RTLOffsetType = "negative" | "positive-descending" | "positive-ascending";
export type Direction = "ltr" | "rtl";

let cachedRTLResult: RTLOffsetType | null = null;

export function getRTLOffsetType(recalculate: boolean = false): RTLOffsetType {
  if (cachedRTLResult === null || recalculate) {
    if (typeof document === "undefined") {
      cachedRTLResult = "positive-ascending";
      return cachedRTLResult;
    }

    const outer = document.createElement("div");
    outer.style.width = "50px";
    outer.style.height = "50px";
    outer.style.overflow = "scroll";
    outer.style.direction = "rtl";

    const inner = document.createElement("div");
    inner.style.width = "100px";
    inner.style.height = "100px";
    outer.append(inner);
    document.body.append(outer);

    if (outer.scrollLeft > 0) {
      cachedRTLResult = "positive-descending";
    } else {
      outer.scrollLeft = 1;
      cachedRTLResult = outer.scrollLeft === 0 ? "negative" : "positive-ascending";
    }

    outer.remove();
  }

  return cachedRTLResult;
}

export function getScrollLeft(node: Element, direction: Direction): number {
  let { scrollLeft } = node as Element & { scrollLeft: number; scrollWidth: number; clientWidth: number };
  if (direction === "rtl") {
    switch (getRTLOffsetType()) {
      case "negative":
        scrollLeft = -scrollLeft;
        break;
      case "positive-descending":
        scrollLeft = (node as Element & { scrollWidth: number; clientWidth: number }).scrollWidth
          - (node as Element & { clientWidth: number }).clientWidth - scrollLeft;
        break;
      case "positive-ascending":
        break;
    }
  }
  return scrollLeft;
}

export function setScrollLeft(node: Element, direction: Direction, scrollLeft: number): void {
  const el = node as Element & {
    scrollLeft: number;
    scrollWidth: number;
    clientWidth: number;
  };
  let target = scrollLeft;
  if (direction === "rtl") {
    switch (getRTLOffsetType()) {
      case "negative":
        target = -scrollLeft;
        break;
      case "positive-ascending":
        break;
      case "positive-descending":
        target = el.scrollWidth - el.clientWidth - scrollLeft;
        break;
    }
  }
  el.scrollLeft = target;
}

export function isSetEqual<T>(a: Set<T>, b: Set<T>): boolean {
  if (a === b) {
    return true;
  }

  if (a.size !== b.size) {
    return false;
  }

  for (const key of a) {
    if (!b.has(key)) {
      return false;
    }
  }

  return true;
}
