import type { Key, Node } from "@vue-aria/collections";
import type { Collection } from "@vue-aria/selection-state";

export class ListCollection<T> implements Collection<Node<T>> {
  private keyMap: Map<Key, Node<T>> = new Map();
  private iterable: Iterable<Node<T>>;
  private firstKey: Key | null = null;
  private lastKey: Key | null = null;
  private _size: number;

  constructor(nodes: Iterable<Node<T>>) {
    this.iterable = nodes;

    const visit = (node: Node<T>) => {
      this.keyMap.set(node.key, node);

      if (node.childNodes && node.type === "section") {
        for (const child of node.childNodes) {
          visit(child as Node<T>);
        }
      }
    };

    for (const node of nodes) {
      visit(node);
    }

    let last: Node<T> | null = null;
    let index = 0;
    let size = 0;
    for (const [key, node] of this.keyMap) {
      if (last) {
        (last as any).nextKey = key;
        (node as any).prevKey = last.key;
      } else {
        this.firstKey = key;
        (node as any).prevKey = null;
      }

      if (node.type === "item") {
        (node as any).index = index++;
      }

      if (node.type === "section" || node.type === "item") {
        size += 1;
      }

      last = node;
      (last as any).nextKey = null;
    }

    this._size = size;
    this.lastKey = last?.key ?? null;
  }

  *[Symbol.iterator](): IterableIterator<Node<T>> {
    yield* this.iterable;
  }

  get size(): number {
    return this._size;
  }

  getKeys(): IterableIterator<Key> {
    return this.keyMap.keys();
  }

  getKeyBefore(key: Key): Key | null {
    const node = this.keyMap.get(key) as any;
    return node ? node.prevKey ?? null : null;
  }

  getKeyAfter(key: Key): Key | null {
    const node = this.keyMap.get(key) as any;
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

  at(index: number): Node<T> | null {
    const keys = [...this.getKeys()];
    return this.getItem(keys[index] as Key);
  }

  getChildren(key: Key): Iterable<Node<T>> {
    const node = this.keyMap.get(key);
    return (node?.childNodes as Iterable<Node<T>>) || [];
  }
}
