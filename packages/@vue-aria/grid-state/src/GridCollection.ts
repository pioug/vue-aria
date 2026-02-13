import type { Key } from "@vue-aria/collections";

export interface GridNode<T> {
  type: string;
  key: Key;
  value: T | null;
  level: number;
  hasChildNodes: boolean;
  childNodes: Iterable<GridNode<T>>;
  rendered: unknown;
  textValue: string;
  index: number;
  indexOfType?: number;
  parentKey: Key | null;
  prevKey: Key | null;
  nextKey: Key | null;
  firstChildKey: Key | null;
  lastChildKey: Key | null;
  props?: Record<string, unknown>;
  column?: GridNode<T>;
  colspan?: number;
  colSpan?: number | null;
  colIndex?: number | null;
}

export interface GridCollectionType<T> {
  columnCount: number;
  rows: GridNode<T>[];
  getKeys(): IterableIterator<Key>;
  getKeyBefore(key: Key): Key | null;
  getKeyAfter(key: Key): Key | null;
  getFirstKey(): Key | null;
  getLastKey(): Key | null;
  getItem(key: Key): GridNode<T> | null;
  at(idx: number): GridNode<T> | null;
  getChildren(key: Key): Iterable<GridNode<T>>;
  [Symbol.iterator](): IterableIterator<GridNode<T>>;
  readonly size: number;
}

export interface GridRow<T> extends Partial<GridNode<T>> {
  key?: Key;
  type: string;
  childNodes: Iterable<GridNode<T>>;
}

interface GridCollectionOptions<T> {
  columnCount: number;
  items: GridRow<T>[];
  visitNode?: (cell: GridNode<T>) => GridNode<T>;
}

export class GridCollection<T> implements GridCollectionType<T> {
  keyMap: Map<Key, GridNode<T>> = new Map();
  columnCount: number;
  rows: GridNode<T>[];

  constructor(opts: GridCollectionOptions<T>) {
    this.keyMap = new Map();
    this.columnCount = opts?.columnCount;
    this.rows = [];

    const remove = (node: GridNode<T>) => {
      this.keyMap.delete(node.key);
      for (const child of node.childNodes) {
        if (this.keyMap.get(child.key) === child) {
          remove(child);
        }
      }
    };

    const visit = (node: GridNode<T>) => {
      const prevNode = this.keyMap.get(node.key);
      if (opts.visitNode) {
        node = opts.visitNode(node);
      }

      this.keyMap.set(node.key, node);

      const childKeys = new Set<Key>();
      let last: GridNode<T> | null = null;
      let rowHasCellWithColSpan = false;

      if (node.type === "item") {
        for (const child of node.childNodes) {
          if (child.props?.colSpan !== undefined) {
            rowHasCellWithColSpan = true;
            break;
          }
        }
      }

      for (const child of node.childNodes as Iterable<GridNode<T>>) {
        if (child.type === "cell" && rowHasCellWithColSpan) {
          child.colspan = child.props?.colSpan as number | undefined;
          child.colSpan = child.props?.colSpan as number | undefined;
          child.colIndex = !last
            ? child.index
            : (last.colIndex ?? last.index) + (last.colSpan ?? 1);
        }

        if (child.type === "cell" && child.parentKey == null) {
          child.parentKey = node.key;
        }
        childKeys.add(child.key);

        if (last) {
          last.nextKey = child.key;
          child.prevKey = last.key;
        } else {
          child.prevKey = null;
        }

        visit(child);
        last = child;
      }

      if (last) {
        last.nextKey = null;
      }

      if (prevNode) {
        for (const child of prevNode.childNodes) {
          if (!childKeys.has(child.key)) {
            remove(child);
          }
        }
      }
    };

    let last: GridNode<T> | null = null;
    for (const [i, node] of opts.items.entries()) {
      const rowNode: GridNode<T> = {
        ...node,
        level: node.level ?? 0,
        key: node.key ?? `row-${i}`,
        type: node.type ?? "row",
        value: (node.value ?? null) as T | null,
        hasChildNodes: true,
        childNodes: [...node.childNodes],
        rendered: node.rendered,
        textValue: node.textValue ?? "",
        index: node.index ?? i,
        parentKey: node.parentKey ?? null,
        firstChildKey: node.firstChildKey ?? null,
        lastChildKey: node.lastChildKey ?? null,
        prevKey: node.prevKey ?? null,
        nextKey: node.nextKey ?? null,
        props: node.props,
      };

      if (last) {
        last.nextKey = rowNode.key;
        rowNode.prevKey = last.key;
      } else {
        rowNode.prevKey = null;
      }

      this.rows.push(rowNode);
      visit(rowNode);
      last = rowNode;
    }

    if (last) {
      last.nextKey = null;
    }
  }

  *[Symbol.iterator](): IterableIterator<GridNode<T>> {
    yield* [...this.rows];
  }

  get size(): number {
    return [...this.rows].length;
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
    return [...this.rows][0]?.key ?? null;
  }

  getLastKey(): Key | null {
    const rows = [...this.rows];
    return rows[rows.length - 1]?.key ?? null;
  }

  getItem(key: Key): GridNode<T> | null {
    return this.keyMap.get(key) ?? null;
  }

  at(idx: number): GridNode<T> | null {
    const keys = [...this.getKeys()];
    return this.getItem(keys[idx]);
  }

  getChildren(key: Key): Iterable<GridNode<T>> {
    const node = this.keyMap.get(key);
    return node?.childNodes || [];
  }
}
