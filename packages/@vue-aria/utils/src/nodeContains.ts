export function nodeContains(
  parent: Node | null | undefined,
  target: EventTarget | null
): boolean {
  return target instanceof Node ? Boolean(parent?.contains(target)) : false;
}
