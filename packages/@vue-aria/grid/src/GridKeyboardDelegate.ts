import { DOMLayoutDelegate } from "@vue-aria/selection";
import type { Direction, Key, KeyboardDelegate, LayoutDelegate, Rect, Size } from "@vue-aria/selection";
import type { DisabledBehavior } from "@vue-aria/selection-state";
import type { GridCollectionType, GridNode } from "@vue-aria/grid-state";

export interface GridKeyboardDelegateOptions<C> {
  collection: C;
  disabledKeys: Set<Key>;
  disabledBehavior?: DisabledBehavior;
  ref?: { current: HTMLElement | null };
  direction: Direction;
  collator?: Intl.Collator;
  layoutDelegate?: LayoutDelegate;
  layout?: DeprecatedLayout;
  focusMode?: "row" | "cell";
}

function getChildNodes<T>(
  item: GridNode<T>,
  collection: GridCollectionType<T>
): Iterable<GridNode<T>> {
  return collection.getChildren(item.key);
}

function getFirstItem<T>(iterable: Iterable<GridNode<T>>): GridNode<T> | null {
  for (const item of iterable) {
    return item;
  }

  return null;
}

function getLastItem<T>(iterable: Iterable<GridNode<T>>): GridNode<T> | null {
  let last: GridNode<T> | null = null;
  for (const item of iterable) {
    last = item;
  }

  return last;
}

function getNthItem<T>(iterable: Iterable<GridNode<T>>, index: number): GridNode<T> | null {
  if (index < 0) {
    return null;
  }

  let i = 0;
  for (const item of iterable) {
    if (i === index) {
      return item;
    }
    i += 1;
  }

  return null;
}

export class GridKeyboardDelegate<T, C extends GridCollectionType<T>>
  implements KeyboardDelegate {
  collection: C;
  protected disabledKeys: Set<Key>;
  protected disabledBehavior: DisabledBehavior;
  protected direction: Direction;
  protected collator: Intl.Collator | undefined;
  protected layoutDelegate: LayoutDelegate;
  protected focusMode: "row" | "cell";

  constructor(options: GridKeyboardDelegateOptions<C>) {
    this.collection = options.collection;
    this.disabledKeys = options.disabledKeys;
    this.disabledBehavior = options.disabledBehavior || "all";
    this.direction = options.direction;
    this.collator = options.collator;
    if (!options.layout && !options.ref) {
      throw new Error("Either a layout or a ref must be specified.");
    }
    this.layoutDelegate = options.layoutDelegate
      || (options.layout
        ? new DeprecatedLayoutDelegate(options.layout)
        : new DOMLayoutDelegate(options.ref!));
    this.focusMode = options.focusMode ?? "row";
  }

  protected isCell(node: { type: string }): boolean {
    return node.type === "cell";
  }

  protected isRow(node: { type: string }): boolean {
    return node.type === "row" || node.type === "item";
  }

  private isDisabled(item: { key: Key; props?: { isDisabled?: boolean } }) {
    return this.disabledBehavior === "all"
      && (item.props?.isDisabled || this.disabledKeys.has(item.key));
  }

  protected findPreviousKey(
    fromKey?: Key,
    pred?: (item: GridNode<T>) => boolean
  ): Key | null {
    let key =
      fromKey != null
        ? this.collection.getKeyBefore(fromKey)
        : this.collection.getLastKey();

    while (key != null) {
      const item = this.collection.getItem(key);
      if (!item) {
        return null;
      }
      if (!this.isDisabled(item) && (!pred || pred(item))) {
        return key;
      }

      key = this.collection.getKeyBefore(key);
    }
    return null;
  }

  protected findNextKey(
    fromKey?: Key,
    pred?: (item: GridNode<T>) => boolean
  ): Key | null {
    let key =
      fromKey != null
        ? this.collection.getKeyAfter(fromKey)
        : this.collection.getFirstKey();

    while (key != null) {
      const item = this.collection.getItem(key);
      if (!item) {
        return null;
      }
      if (!this.isDisabled(item) && (!pred || pred(item))) {
        return key;
      }

      key = this.collection.getKeyAfter(key);
      if (key == null) {
        return null;
      }
    }
    return null;
  }

  protected getKeyForItemInRowByIndex(key: Key, index = 0): Key | null {
    if (index < 0) {
      return null;
    }

    const item = this.collection.getItem(key);
    if (!item) {
      return null;
    }

    let i = 0;
    for (const child of getChildNodes(item, this.collection)) {
      if (child.colSpan && child.colSpan + i > index) {
        return child.key ?? null;
      }

      if (child.colSpan) {
        i = i + child.colSpan - 1;
      }

      if (i === index) {
        return child.key ?? null;
      }

      i++;
    }
    return null;
  }

  getKeyBelow(fromKey: Key): Key | null {
    let key: Key | null = fromKey;
    const startItem = this.collection.getItem(key);
    if (!startItem) {
      return null;
    }

    if (this.isCell(startItem)) {
      key = startItem.parentKey ?? null;
    }
    if (key == null) {
      return null;
    }

    key = this.findNextKey(key, (item) => item.type === "item");
    if (key != null) {
      if (this.isCell(startItem)) {
        const startIndex = startItem.colIndex ? startItem.colIndex : startItem.index;
        return this.getKeyForItemInRowByIndex(key, startIndex);
      }

      if (this.focusMode === "row") {
        return key;
      }
    }
    return null;
  }

  getKeyAbove(fromKey: Key): Key | null {
    let key: Key | null = fromKey;
    const startItem = this.collection.getItem(key);
    if (!startItem) {
      return null;
    }

    if (this.isCell(startItem)) {
      key = startItem.parentKey ?? null;
    }
    if (key == null) {
      return null;
    }

    key = this.findPreviousKey(key, (item) => item.type === "item");
    if (key != null) {
      if (this.isCell(startItem)) {
        const startIndex = startItem.colIndex ? startItem.colIndex : startItem.index;
        return this.getKeyForItemInRowByIndex(key, startIndex);
      }

      if (this.focusMode === "row") {
        return key;
      }
    }
    return null;
  }

  getKeyRightOf(key: Key): Key | null {
    const item = this.collection.getItem(key);
    if (!item) {
      return null;
    }

    if (this.isRow(item)) {
      const children = getChildNodes(item, this.collection);
      return (this.direction === "rtl"
        ? getLastItem(children)?.key
        : getFirstItem(children)?.key) ?? null;
    }

    if (this.isCell(item) && item.parentKey != null) {
      const parent = this.collection.getItem(item.parentKey);
      if (!parent) {
        return null;
      }
      const children = getChildNodes(parent, this.collection);
      const next = (this.direction === "rtl"
        ? getNthItem(children, item.index - 1)
        : getNthItem(children, item.index + 1)) ?? null;

      if (next) {
        return next.key ?? null;
      }

      if (this.focusMode === "row") {
        return item.parentKey ?? null;
      }

      return (this.direction === "rtl" ? this.getFirstKey(key) : this.getLastKey(key)) ?? null;
    }
    return null;
  }

  getKeyLeftOf(key: Key): Key | null {
    const item = this.collection.getItem(key);
    if (!item) {
      return null;
    }

    if (this.isRow(item)) {
      const children = getChildNodes(item, this.collection);
      return (this.direction === "rtl"
        ? getFirstItem(children)?.key
        : getLastItem(children)?.key) ?? null;
    }

    if (this.isCell(item) && item.parentKey != null) {
      const parent = this.collection.getItem(item.parentKey);
      if (!parent) {
        return null;
      }
      const children = getChildNodes(parent, this.collection);
      const prev = (this.direction === "rtl"
        ? getNthItem(children, item.index + 1)
        : getNthItem(children, item.index - 1)) ?? null;

      if (prev) {
        return prev.key ?? null;
      }

      if (this.focusMode === "row") {
        return item.parentKey ?? null;
      }

      return (this.direction === "rtl" ? this.getLastKey(key) : this.getFirstKey(key)) ?? null;
    }
    return null;
  }

  getFirstKey(fromKey?: Key, global?: boolean): Key | null {
    let key: Key | null = fromKey ?? null;
    let item: GridNode<T> | null | undefined;
    if (key != null) {
      item = this.collection.getItem(key);
      if (!item) {
        return null;
      }

      if (this.isCell(item) && !global && item.parentKey != null) {
        const parent = this.collection.getItem(item.parentKey);
        if (!parent) {
          return null;
        }
        return getFirstItem(getChildNodes(parent, this.collection))?.key ?? null;
      }
    }

    key = this.findNextKey(undefined, (current) => current.type === "item");

    if (key != null && ((item && this.isCell(item) && global) || this.focusMode === "cell")) {
      const rowItem = this.collection.getItem(key);
      if (!rowItem) {
        return null;
      }
      key = getFirstItem(getChildNodes(rowItem, this.collection))?.key ?? null;
    }

    return key;
  }

  getLastKey(fromKey?: Key, global?: boolean): Key | null {
    let key: Key | null = fromKey ?? null;
    let item: GridNode<T> | null | undefined;
    if (key != null) {
      item = this.collection.getItem(key);
      if (!item) {
        return null;
      }

      if (this.isCell(item) && !global && item.parentKey != null) {
        const parent = this.collection.getItem(item.parentKey);
        if (!parent) {
          return null;
        }
        const children = getChildNodes(parent, this.collection);
        return getLastItem(children)?.key ?? null;
      }
    }

    key = this.findPreviousKey(undefined, (current) => current.type === "item");

    if (key != null && ((item && this.isCell(item) && global) || this.focusMode === "cell")) {
      const rowItem = this.collection.getItem(key);
      if (!rowItem) {
        return null;
      }
      const children = getChildNodes(rowItem, this.collection);
      key = getLastItem(children)?.key ?? null;
    }

    return key;
  }

  getKeyPageAbove(fromKey: Key): Key | null {
    let key: Key | null = fromKey;
    let itemRect = this.layoutDelegate.getItemRect(key);
    if (!itemRect) {
      return null;
    }

    const pageY = Math.max(
      0,
      itemRect.y + itemRect.height - this.layoutDelegate.getVisibleRect().height
    );

    while (itemRect && itemRect.y > pageY && key != null) {
      key = this.getKeyAbove(key) ?? null;
      if (key == null) {
        break;
      }
      itemRect = this.layoutDelegate.getItemRect(key);
    }

    return key;
  }

  getKeyPageBelow(fromKey: Key): Key | null {
    let key: Key | null = fromKey;
    let itemRect = this.layoutDelegate.getItemRect(key);

    if (!itemRect) {
      return null;
    }

    const pageHeight = this.layoutDelegate.getVisibleRect().height;
    const pageY = Math.min(
      this.layoutDelegate.getContentSize().height,
      itemRect.y + pageHeight
    );

    while (itemRect && itemRect.y + itemRect.height < pageY) {
      const nextKey = this.getKeyBelow(key);
      if (nextKey == null) {
        break;
      }

      itemRect = this.layoutDelegate.getItemRect(nextKey);
      key = nextKey;
    }

    return key;
  }

  getKeyForSearch(search: string, fromKey?: Key): Key | null {
    let key: Key | null = fromKey ?? null;
    if (!this.collator) {
      return null;
    }

    const collection = this.collection;
    key = fromKey ?? this.getFirstKey();
    if (key == null) {
      return null;
    }

    const startItem = collection.getItem(key);
    if (!startItem) {
      return null;
    }
    if (startItem.type === "cell") {
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
          if (this.isRow(item) && this.focusMode === "cell") {
            return getFirstItem(getChildNodes(item, this.collection))?.key ?? null;
          }

          return item.key;
        }
      }

      key = this.findNextKey(key, (row) => row.type === "item");

      if (key == null && !hasWrapped) {
        key = this.getFirstKey();
        hasWrapped = true;
      }
    }

    return null;
  }
}

interface DeprecatedLayout {
  getLayoutInfo(key: Key): DeprecatedLayoutInfo;
  getContentSize(): Size;
  virtualizer: DeprecatedVirtualizer;
}

interface DeprecatedLayoutInfo {
  rect: Rect;
}

interface DeprecatedVirtualizer {
  visibleRect: Rect;
}

class DeprecatedLayoutDelegate implements LayoutDelegate {
  layout: DeprecatedLayout;

  constructor(layout: DeprecatedLayout) {
    this.layout = layout;
  }

  getContentSize(): Size {
    return this.layout.getContentSize();
  }

  getItemRect(key: Key): Rect | null {
    return this.layout.getLayoutInfo(key)?.rect || null;
  }

  getVisibleRect(): Rect {
    return this.layout.virtualizer.visibleRect;
  }
}
