import { GridKeyboardDelegate } from "@vue-aria/grid";
import type { Key } from "@vue-aria/collections";
import type { GridCollectionType, GridNode } from "@vue-stately/grid";

interface TableCollectionLike<T> extends GridCollectionType<T> {
  headerRows: GridNode<T>[];
  columns: GridNode<T>[];
  rowHeaderColumnKeys: Set<Key>;
}

function getChildNodes<T>(
  item: GridNode<T>,
  collection: TableCollectionLike<T>
): Iterable<GridNode<T>> {
  return collection.getChildren(item.key);
}

function getFirstItem<T>(iterable: Iterable<GridNode<T>>): GridNode<T> | null {
  for (const item of iterable) {
    return item;
  }

  return null;
}

export class TableKeyboardDelegate<T> extends GridKeyboardDelegate<
  T,
  TableCollectionLike<T>
> {
  protected isCell(node: GridNode<T>): boolean {
    return (
      node.type === "cell" || node.type === "rowheader" || node.type === "column"
    );
  }

  getKeyBelow(key: Key): Key | null {
    const startItem = this.collection.getItem(key);
    if (!startItem) {
      return null;
    }

    if (startItem.type === "column") {
      const child = getFirstItem(getChildNodes(startItem, this.collection));
      if (child) {
        return child.key;
      }

      const firstKey = this.getFirstKey();
      if (firstKey == null) {
        return null;
      }

      const firstItem = this.collection.getItem(firstKey);
      if (!firstItem) {
        return null;
      }

      return this.getKeyForItemInRowByIndex(firstKey, startItem.index);
    }

    return super.getKeyBelow(key);
  }

  getKeyAbove(key: Key): Key | null {
    const startItem = this.collection.getItem(key);
    if (!startItem) {
      return null;
    }

    if (startItem.type === "column") {
      const parent =
        startItem.parentKey != null
          ? this.collection.getItem(startItem.parentKey)
          : null;
      if (parent && parent.type === "column") {
        return parent.key;
      }

      return null;
    }

    const superKey = super.getKeyAbove(key);
    const superItem =
      superKey != null ? this.collection.getItem(superKey) : null;
    if (superItem && superItem.type !== "headerrow") {
      return superKey;
    }

    if (this.isCell(startItem)) {
      return this.collection.columns[startItem.index].key;
    }

    return this.collection.columns[0].key;
  }

  private findNextColumnKey(column: GridNode<T>): Key | null {
    const key = this.findNextKey(column.key, (item) => item.type === "column");
    if (key != null) {
      return key;
    }

    const row = this.collection.headerRows[column.level];
    for (const item of getChildNodes(row, this.collection)) {
      if (item.type === "column") {
        return item.key;
      }
    }

    return null;
  }

  private findPreviousColumnKey(column: GridNode<T>): Key | null {
    const key = this.findPreviousKey(column.key, (item) => item.type === "column");
    if (key != null) {
      return key;
    }

    const row = this.collection.headerRows[column.level];
    const childNodes = [...getChildNodes(row, this.collection)];
    for (let index = childNodes.length - 1; index >= 0; index -= 1) {
      const item = childNodes[index];
      if (item.type === "column") {
        return item.key;
      }
    }

    return null;
  }

  getKeyRightOf(key: Key): Key | null {
    const item = this.collection.getItem(key);
    if (!item) {
      return null;
    }

    if (item.type === "column") {
      return this.direction === "rtl"
        ? this.findPreviousColumnKey(item)
        : this.findNextColumnKey(item);
    }

    return super.getKeyRightOf(key);
  }

  getKeyLeftOf(key: Key): Key | null {
    const item = this.collection.getItem(key);
    if (!item) {
      return null;
    }

    if (item.type === "column") {
      return this.direction === "rtl"
        ? this.findNextColumnKey(item)
        : this.findPreviousColumnKey(item);
    }

    return super.getKeyLeftOf(key);
  }

  getKeyForSearch(search: string, fromKey?: Key): Key | null {
    if (!this.collator) {
      return null;
    }

    const collection = this.collection;
    let key = fromKey ?? this.getFirstKey();
    if (key == null) {
      return null;
    }

    const startItem = collection.getItem(key);
    if (startItem?.type === "cell") {
      key = startItem.parentKey ?? null;
    }

    let hasWrapped = false;
    while (key != null) {
      const item = collection.getItem(key);
      if (!item) {
        return null;
      }

      if (item.textValue) {
        const substring = item.textValue.slice(0, search.length);
        if (this.collator.compare(substring, search) === 0) {
          return item.key;
        }
      }

      for (const cell of getChildNodes(item, this.collection)) {
        const column = collection.columns[cell.index];
        if (collection.rowHeaderColumnKeys.has(column.key) && cell.textValue) {
          const substring = cell.textValue.slice(0, search.length);
          if (this.collator.compare(substring, search) === 0) {
            const fromItem =
              fromKey != null ? collection.getItem(fromKey) : startItem;
            return fromItem?.type === "cell" ? cell.key : item.key;
          }
        }
      }

      key = this.getKeyBelow(key);

      if (key == null && !hasWrapped) {
        key = this.getFirstKey();
        hasWrapped = true;
      }
    }

    return null;
  }
}
