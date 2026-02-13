export type Orientation = "horizontal" | "vertical";

export function getOffset(
  element: HTMLElement,
  reverse?: boolean,
  orientation: Orientation = "horizontal"
): number {
  const rect = element.getBoundingClientRect();
  if (reverse) {
    return orientation === "horizontal" ? rect.right : rect.bottom;
  }

  return orientation === "horizontal" ? rect.left : rect.top;
}
