import type { Key } from "@vue-aria/types";
import type {
  BuiltCollection,
  CollectionInput,
  CollectionItem,
  CollectionItemInput,
  CollectionNode,
  CollectionSection,
  CollectionSectionInput,
} from "./types";

function normalizeTextValue<T>(item: CollectionItemInput<T>): string {
  if (item.textValue) {
    return item.textValue;
  }

  if (typeof item.value === "string") {
    return item.value;
  }

  return String(item.key);
}

function toCollectionArray<T>(collection: Iterable<CollectionInput<T>>): CollectionInput<T>[] {
  return Array.from(collection);
}

function isSectionInput<T>(value: CollectionInput<T>): value is CollectionSectionInput<T> {
  return "children" in value;
}

function createItemNode<T>(item: CollectionItemInput<T>): CollectionItem<T> {
  return {
    type: "item",
    key: item.key,
    textValue: normalizeTextValue(item),
    value: item.value,
    isDisabled: item.isDisabled,
  };
}

function createSectionNode<T>(
  section: CollectionSectionInput<T>,
  assertUniqueKey: (key: Key) => void
): CollectionSection<T> {
  const children = toCollectionArray(section.children).map((item) => {
    assertUniqueKey(item.key);
    return createItemNode(item);
  });

  return {
    type: "section",
    key: section.key,
    heading: section.heading,
    children,
  };
}

export function buildCollection<T = unknown>(
  collection: Iterable<CollectionInput<T>>
): BuiltCollection<T> {
  const itemMap = new Map<Key, CollectionItem<T>>();
  const sectionMap = new Map<Key, CollectionSection<T>>();
  const items: CollectionItem<T>[] = [];
  const nodes: CollectionNode<T>[] = [];
  const keyOrder: Key[] = [];

  const assertUniqueKey = (key: Key): void => {
    if (itemMap.has(key) || sectionMap.has(key)) {
      throw new Error(`Duplicate collection key: ${String(key)}`);
    }
  };

  for (const entry of toCollectionArray(collection)) {
    assertUniqueKey(entry.key);

    if (isSectionInput(entry)) {
      const section = createSectionNode(entry, assertUniqueKey);
      sectionMap.set(section.key, section);
      nodes.push(section);

      for (const item of section.children) {
        itemMap.set(item.key, item);
        items.push(item);
        keyOrder.push(item.key);
      }
      continue;
    }

    const item = createItemNode(entry);
    itemMap.set(item.key, item);
    items.push(item);
    nodes.push(item);
    keyOrder.push(item.key);
  }

  const getIndex = (key: Key): number => keyOrder.findIndex((value) => value === key);

  return {
    nodes,
    items,
    getItem: (key) => itemMap.get(key),
    getSection: (key) => sectionMap.get(key),
    getKeyAfter: (key) => {
      const index = getIndex(key);
      if (index < 0 || index + 1 >= keyOrder.length) {
        return null;
      }

      return keyOrder[index + 1] ?? null;
    },
    getKeyBefore: (key) => {
      const index = getIndex(key);
      if (index <= 0) {
        return null;
      }

      return keyOrder[index - 1] ?? null;
    },
    getFirstKey: () => keyOrder[0] ?? null,
    getLastKey: () => keyOrder[keyOrder.length - 1] ?? null,
  };
}
