import type { Collection, Key, Node } from "./types";

export function getChildNodes<T>(item: Node<T>, collection: Collection<Node<T>>): Iterable<Node<T>> {
  return collection.getChildren(item.key);
}

export function getFirstItem<T>(iterable: Iterable<Node<T>>): Node<T> | null {
  for (const item of iterable) {
    return item;
  }

  return null;
}

export function compareNodeOrder<T>(collection: Collection<Node<T>>, a: Node<T>, b: Node<T>): number {
  const order = new Map<Key, number>();
  let i = 0;
  let key = collection.getFirstKey();
  while (key != null) {
    order.set(key, i++);
    key = collection.getKeyAfter(key);
  }

  const aIndex = order.get(a.key) ?? -1;
  const bIndex = order.get(b.key) ?? -1;
  return aIndex - bIndex;
}
