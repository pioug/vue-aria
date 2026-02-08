import { hideOthers, inertOthers, supportsInert } from "aria-hidden";

export interface AriaHideOutsideOptions {
  shouldUseInert?: boolean;
}

const visibleNodeStack: Array<Set<Element>> = [];

export function ariaHideOutside(
  elements: ReadonlyArray<Element>,
  options: AriaHideOutsideOptions = {}
): () => void {
  if (typeof document === "undefined") {
    return () => {};
  }

  const targets = elements.filter(
    (element): element is Element => Boolean(element)
  );

  if (targets.length === 0) {
    return () => {};
  }

  const visibleNodes = new Set(targets);
  visibleNodeStack.push(visibleNodes);

  const restore = options.shouldUseInert && supportsInert()
    ? inertOthers(targets)
    : hideOthers(targets);

  return () => {
    restore();
    if (visibleNodeStack[visibleNodeStack.length - 1] === visibleNodes) {
      visibleNodeStack.pop();
    } else {
      const index = visibleNodeStack.indexOf(visibleNodes);
      if (index >= 0) {
        visibleNodeStack.splice(index, 1);
      }
    }
  };
}

export function keepVisible(element: Element): (() => void) | undefined {
  const visibleNodes = visibleNodeStack[visibleNodeStack.length - 1];
  if (!visibleNodes || visibleNodes.has(element)) {
    return undefined;
  }

  visibleNodes.add(element);
  return () => {
    visibleNodes.delete(element);
  };
}
