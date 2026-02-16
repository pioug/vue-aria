export type Key = string | number;

export interface Node<T> {
  type: string;
  key: Key;
  value: T | null;
  level: number;
  hasChildNodes: boolean;
  rendered: unknown;
  textValue: string;
  "aria-label"?: string;
  index: number;
  parentKey: Key | null;
  prevKey: Key | null;
  nextKey: Key | null;
  firstChildKey: Key | null;
  lastChildKey: Key | null;
  props: any;
  render?: (node: Node<any>) => unknown;
  colSpan: number | null;
  colIndex: number | null;
  childNodes: Iterable<Node<T>>;
}

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

type FilterFn<T> = (textValue: string, node: Node<T>) => boolean;

export class CollectionNode<T> implements Node<T> {
  static readonly type: string;
  readonly type: string;
  readonly key: Key;
  readonly value: T | null = null;
  readonly level = 0;
  readonly hasChildNodes = false;
  readonly rendered: unknown = null;
  readonly textValue = "";
  readonly "aria-label"?: string = undefined;
  readonly index = 0;
  readonly parentKey: Key | null = null;
  readonly prevKey: Key | null = null;
  readonly nextKey: Key | null = null;
  readonly firstChildKey: Key | null = null;
  readonly lastChildKey: Key | null = null;
  readonly props: any = {};
  readonly render?: (node: Node<any>) => unknown;
  readonly colSpan: number | null = null;
  readonly colIndex: number | null = null;

  constructor(key: Key) {
    this.type = (this.constructor as typeof CollectionNode).type;
    this.key = key;
  }

  get childNodes(): Iterable<Node<T>> {
    throw new Error("childNodes is not supported");
  }

  clone(): this {
    const node: Mutable<this> = new (this.constructor as any)(this.key);
    node.value = this.value;
    node.level = this.level;
    node.hasChildNodes = this.hasChildNodes;
    node.rendered = this.rendered;
    node.textValue = this.textValue;
    node["aria-label"] = this["aria-label"];
    node.index = this.index;
    node.parentKey = this.parentKey;
    node.prevKey = this.prevKey;
    node.nextKey = this.nextKey;
    node.firstChildKey = this.firstChildKey;
    node.lastChildKey = this.lastChildKey;
    node.props = this.props;
    node.render = this.render;
    node.colSpan = this.colSpan;
    node.colIndex = this.colIndex;
    return node;
  }

  filter(collection: BaseCollection<T>, newCollection: BaseCollection<T>, _filterFn: FilterFn<T>): CollectionNode<T> | null {
    const clone = this.clone();
    newCollection.addDescendants(clone, collection);
    return clone;
  }
}

export class FilterableNode<T> extends CollectionNode<T> {
  filter(collection: BaseCollection<T>, newCollection: BaseCollection<T>, filterFn: FilterFn<T>): CollectionNode<T> | null {
    const [firstKey, lastKey] = filterChildren(collection, newCollection, this.firstChildKey, filterFn);
    const newNode: Mutable<CollectionNode<T>> = this.clone();
    newNode.firstChildKey = firstKey;
    newNode.lastChildKey = lastKey;
    return newNode;
  }
}

export class HeaderNode extends CollectionNode<unknown> {
  static readonly type = "header";
}

export class LoaderNode extends CollectionNode<unknown> {
  static readonly type = "loader";
}

export class ItemNode<T> extends FilterableNode<T> {
  static readonly type = "item";

  filter(collection: BaseCollection<T>, newCollection: BaseCollection<T>, filterFn: FilterFn<T>): ItemNode<T> | null {
    if (filterFn(this.textValue, this)) {
      const clone = this.clone();
      newCollection.addDescendants(clone, collection);
      return clone;
    }

    return null;
  }
}

export class SectionNode<T> extends FilterableNode<T> {
  static readonly type = "section";

  filter(collection: BaseCollection<T>, newCollection: BaseCollection<T>, filterFn: FilterFn<T>): SectionNode<T> | null {
    const filteredSection = super.filter(collection, newCollection, filterFn);
    if (filteredSection && filteredSection.lastChildKey !== null) {
      const lastChild = collection.getItem(filteredSection.lastChildKey);
      if (lastChild && lastChild.type !== "header") {
        return filteredSection;
      }
    }

    return null;
  }
}

export class BaseCollection<T> {
  private keyMap: Map<Key, CollectionNode<T>> = new Map();
  private firstKey: Key | null = null;
  private lastKey: Key | null = null;
  private frozen = false;
  private itemCount = 0;

  get size(): number {
    return this.itemCount;
  }

  getKeys(): IterableIterator<Key> {
    return this.keyMap.keys();
  }

  *[Symbol.iterator](): IterableIterator<Node<T>> {
    let node: Node<T> | undefined = this.firstKey != null ? this.keyMap.get(this.firstKey) : undefined;
    while (node) {
      yield node;
      node = node.nextKey != null ? this.keyMap.get(node.nextKey) : undefined;
    }
  }

  getChildren(key: Key): Iterable<Node<T>> {
    const keyMap = this.keyMap;
    return {
      *[Symbol.iterator]() {
        const parent = keyMap.get(key);
        let node = parent?.firstChildKey != null ? keyMap.get(parent.firstChildKey) : null;
        while (node) {
          yield node as Node<T>;
          node = node.nextKey != null ? keyMap.get(node.nextKey) : undefined;
        }
      },
    };
  }

  getKeyBefore(key: Key): Key | null {
    let node = this.keyMap.get(key);
    if (!node) {
      return null;
    }

    if (node.prevKey != null) {
      node = this.keyMap.get(node.prevKey);

      while (node && node.type !== "item" && node.lastChildKey != null) {
        node = this.keyMap.get(node.lastChildKey);
      }

      return node?.key ?? null;
    }

    return node.parentKey;
  }

  getKeyAfter(key: Key): Key | null {
    let node = this.keyMap.get(key);
    if (!node) {
      return null;
    }

    if (node.type !== "item" && node.firstChildKey != null) {
      return node.firstChildKey;
    }

    while (node) {
      if (node.nextKey != null) {
        return node.nextKey;
      }

      if (node.parentKey != null) {
        node = this.keyMap.get(node.parentKey);
      } else {
        return null;
      }
    }

    return null;
  }

  getFirstKey(): Key | null {
    return this.firstKey;
  }

  getLastKey(): Key | null {
    let node = this.lastKey != null ? this.keyMap.get(this.lastKey) : null;
    while (node?.lastChildKey != null) {
      node = this.keyMap.get(node.lastChildKey);
    }

    return node?.key ?? null;
  }

  getItem(key: Key): Node<T> | null {
    return this.keyMap.get(key) ?? null;
  }

  at(): Node<T> {
    throw new Error("Not implemented");
  }

  clone(): this {
    const Constructor: any = this.constructor;
    const collection: this = new Constructor();
    (collection as any).keyMap = new Map(this.keyMap);
    (collection as any).firstKey = this.firstKey;
    (collection as any).lastKey = this.lastKey;
    (collection as any).itemCount = this.itemCount;
    return collection;
  }

  addNode(node: CollectionNode<T>): void {
    if (this.frozen) {
      throw new Error("Cannot add a node to a frozen collection");
    }

    if (node.type === "item" && this.keyMap.get(node.key) == null) {
      this.itemCount += 1;
    }

    this.keyMap.set(node.key, node);
  }

  addDescendants(node: CollectionNode<T>, oldCollection: BaseCollection<T>): void {
    this.addNode(node);
    const children = oldCollection.getChildren(node.key);
    for (const child of children) {
      this.addDescendants(child as CollectionNode<T>, oldCollection);
    }
  }

  removeNode(key: Key): void {
    if (this.frozen) {
      throw new Error("Cannot remove a node to a frozen collection");
    }

    const node = this.keyMap.get(key);
    if (node != null && node.type === "item") {
      this.itemCount -= 1;
    }

    this.keyMap.delete(key);
  }

  commit(firstKey: Key | null, lastKey: Key | null, isSSR = false): void {
    if (this.frozen) {
      throw new Error("Cannot commit a frozen collection");
    }

    this.firstKey = firstKey;
    this.lastKey = lastKey;
    this.frozen = !isSSR;
  }

  filter(filterFn: FilterFn<T>): this {
    const NewCtor: any = this.constructor;
    const newCollection = new NewCtor();
    const [firstKey, lastKey] = filterChildren(this, newCollection, this.firstKey, filterFn);
    newCollection.commit(firstKey, lastKey);
    return newCollection;
  }
}

function filterChildren<T>(
  collection: BaseCollection<T>,
  newCollection: BaseCollection<T>,
  firstChildKey: Key | null,
  filterFn: FilterFn<T>
): [Key | null, Key | null] {
  if (firstChildKey == null) {
    return [null, null];
  }

  let firstNode: Node<T> | null = null;
  let lastNode: Node<T> | null = null;
  let currentNode = collection.getItem(firstChildKey);

  while (currentNode != null) {
    const newNode: Mutable<CollectionNode<T>> | null = (currentNode as CollectionNode<T>).filter(
      collection,
      newCollection,
      filterFn
    );

    if (newNode != null) {
      newNode.nextKey = null;
      if (lastNode) {
        newNode.prevKey = lastNode.key;
        (lastNode as Mutable<Node<T>>).nextKey = newNode.key;
      }

      if (firstNode == null) {
        firstNode = newNode;
      }

      newCollection.addNode(newNode);
      lastNode = newNode;
    }

    currentNode = currentNode.nextKey ? collection.getItem(currentNode.nextKey) : null;
  }

  if (lastNode && lastNode.type === "separator") {
    const prevKey = lastNode.prevKey;
    newCollection.removeNode(lastNode.key);

    if (prevKey) {
      lastNode = newCollection.getItem(prevKey) as Mutable<CollectionNode<T>>;
      lastNode.nextKey = null;
    } else {
      lastNode = null;
    }
  }

  return [firstNode?.key ?? null, lastNode?.key ?? null];
}
