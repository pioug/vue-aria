import type { Key } from "@vue-aria/collections";
import { isAppleDevice, useId } from "@vue-aria/utils";

interface ModifierEvent {
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
}

export function isNonContiguousSelectionModifier(e: ModifierEvent): boolean {
  return isAppleDevice() ? e.altKey : e.ctrlKey;
}

export function getItemElement(
  collectionRef: { current: HTMLElement | null },
  key: Key
): Element | null | undefined {
  let selector = `[data-key="${escapeSelector(String(key))}"]`;
  const collection = collectionRef.current?.dataset.collection;
  if (collection) {
    selector = `[data-collection="${escapeSelector(collection)}"]${selector}`;
  }

  return collectionRef.current?.querySelector(selector);
}

const collectionMap = new WeakMap<object, string>();

export function useCollectionId(collection: object): string {
  const id = useId();
  collectionMap.set(collection, id);
  return id;
}

export function getCollectionId(collection: object): string {
  return collectionMap.get(collection) as string;
}

function escapeSelector(value: string): string {
  const cssCtor = (globalThis as { CSS?: { escape?: (input: string) => string } }).CSS;
  if (cssCtor?.escape) {
    return cssCtor.escape(value);
  }

  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
