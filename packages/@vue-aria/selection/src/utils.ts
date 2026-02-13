import type { Key } from "@vue-aria/collections";

export function getItemElement(
  collectionRef: { current: HTMLElement | null },
  key: Key
): Element | null | undefined {
  let selector = `[data-key="${CSS.escape(String(key))}"]`;
  const collection = collectionRef.current?.dataset.collection;
  if (collection) {
    selector = `[data-collection="${CSS.escape(collection)}"]${selector}`;
  }

  return collectionRef.current?.querySelector(selector);
}
