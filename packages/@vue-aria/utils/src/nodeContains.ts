export function nodeContains(
  parent: Element | null | undefined,
  target: EventTarget | null
): boolean {
  return target instanceof Node ? Boolean(parent?.contains(target)) : false;
}
