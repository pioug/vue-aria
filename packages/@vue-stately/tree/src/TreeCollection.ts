import type { Key, Node } from "@vue-aria/collections";

export interface TreeCollectionType<T> extends Iterable<Node<T>> {
  readonly size: number;
  getKeys(): IterableIterator<Key>;
  getKeyBefore(key: Key): Key | null;
  getKeyAfter(key: Key): Key | null;
  getFirstKey(): Key | null;
  getLastKey(): Key | null;
  getItem(key: Key): Node<T> | null;
  getChildren(key: Key): Iterable<Node<T>>;
  at(idx: number): Node<T> | null;
}

interface TreeCollectionOptions {
  expandedKeys?: Set<Key>;
}

export class TreeCollection<T> implements TreeCollectionType<T> {
  private keyMap: Map<Key, Node<T>> = new Map();
  private iterable: Iterable<Node<T>>;
  private firstKey: Key | null = null;
  private lastKey: Key | null = null;

  constructor(
    nodes: Iterable<Node<T>>,
    { expandedKeys = new Set<Key>() }: TreeCollectionOptions = {}
  ) {
    this.iterable = nodes;

    const visit = (node: Node<T>) => {
      this.keyMap.set(node.key, node);

      if (node.childNodes && (node.type === "section" || expandedKeys.has(node.key))) {
        for (const child of node.childNodes) {
          visit(child as Node<T>);
        }
      }
    };

    for (const node of nodes) {
      visit(node as Node<T>);
    }

    let last: Node<T> | null = null;
    let index = 0;
    for (const [key, node] of this.keyMap) {
      const mutableNode = node as Node<T> & {
        prevKey?: Key | null;
        nextKey?: Key | null;
        index?: number;
      };
      if (last) {
        (last as Node<T> & { nextKey?: Key | null }).nextKey = key;
        mutableNode.prevKey = last.key;
      } else {
        this.firstKey = key;
        mutableNode.prevKey = null;
      }

      if (node.type === "item") {
        mutableNode.index = index++;
      }

      last = node;
      (last as Node<T> & { nextKey?: Key | null }).nextKey = null;
    }

    this.lastKey = last?.key ?? null;
  }

  *[Symbol.iterator](): IterableIterator<Node<T>> {
    yield* this.iterable;
  }

  get size(): number {
    return this.keyMap.size;
  }

  getKeys(): IterableIterator<Key> {
    return this.keyMap.keys();
  }

  getKeyBefore(key: Key): Key | null {
    const node = this.keyMap.get(key);
    return node ? node.prevKey ?? null : null;
  }

  getKeyAfter(key: Key): Key | null {
    const node = this.keyMap.get(key);
    return node ? node.nextKey ?? null : null;
  }

  getFirstKey(): Key | null {
    return this.firstKey;
  }

  getLastKey(): Key | null {
    return this.lastKey;
  }

  getItem(key: Key): Node<T> | null {
    return this.keyMap.get(key) ?? null;
  }

  getChildren(key: Key): Iterable<Node<T>> {
    return (this.keyMap.get(key)?.childNodes ?? []) as Iterable<Node<T>>;
  }

  at(idx: number): Node<T> | null {
    const keys = [...this.getKeys()];
    const key = keys[idx];
    if (key == null) {
      return null;
    }

    return this.getItem(key);
  }
}
