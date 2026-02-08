import { hideOthers, inertOthers, supportsInert } from "aria-hidden";

export interface AriaHideOutsideOptions {
  shouldUseInert?: boolean;
}

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

  if (options.shouldUseInert && supportsInert()) {
    return inertOthers(targets);
  }

  return hideOthers(targets);
}
