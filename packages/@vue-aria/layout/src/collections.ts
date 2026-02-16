import type {Collection, Node, Key} from "./types";

export function getChildNodes<T>(
  node: Node<T>,
  collection: Collection<Node<T>>
): Iterable<Node<T>> {
  if (typeof collection.getChildren === "function") {
    return collection.getChildren(node.key);
  }

  return node.childNodes;
}

export function getLastItem<T>(iterable: Iterable<T>): T | undefined {
  let lastItem: T | undefined;
  for (const value of iterable) {
    lastItem = value;
  }

  return lastItem;
}

export function getFirstItem<T>(iterable: Iterable<T>): T | undefined {
  for (const value of iterable) {
    return value;
  }
  return undefined;
}

export function getNthItem<T>(iterable: Iterable<T>, index: number): T | undefined {
  if (index < 0) {
    return undefined;
  }

  let i = 0;
  for (const item of iterable) {
    if (i === index) {
      return item;
    }
    i++;
  }

  return undefined;
}

export function compareNodeOrder<T>(collection: Collection<Node<T>>, a: Node<T>, b: Node<T>): number {
  if (a.parentKey === b.parentKey) {
    return a.index - b.index;
  }

  const aAncestors = [...getAncestors(collection, a), a];
  const bAncestors = [...getAncestors(collection, b), b];
  const firstNonMatching = aAncestors.slice(0, bAncestors.length).findIndex((node, i) => node !== bAncestors[i]);
  if (firstNonMatching !== -1) {
    a = aAncestors[firstNonMatching];
    b = bAncestors[firstNonMatching];
    return a.index - b.index;
  }

  const aIsDescendant = aAncestors.findIndex((node) => node === b) >= 0;
  if (aIsDescendant) {
    return 1;
  }

  const bIsDescendant = bAncestors.findIndex((node) => node === a) >= 0;
  if (bIsDescendant) {
    return -1;
  }

  return -1;
}

function getAncestors<T>(collection: Collection<Node<T>>, node: Node<T>): Node<T>[] {
  const ancestors: Node<T>[] = [];
  let current: Node<T> | null = node;
  while (current?.parentKey != null) {
    const parent = collection.getItem(current.parentKey);
    if (parent == null) {
      break;
    }
    ancestors.unshift(parent);
    current = parent;
  }

  return ancestors;
}
