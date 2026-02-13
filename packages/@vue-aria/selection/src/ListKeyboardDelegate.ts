import { isScrollable } from "@vue-aria/utils";
import { DOMLayoutDelegate } from "./DOMLayoutDelegate";
import type {
  DisabledBehavior,
  Key,
  ListKeyboardDelegateOptions,
  Orientation,
  SearchableCollection,
  Rect,
  LayoutDelegate,
  Direction,
} from "./types";

export class ListKeyboardDelegate<T> {
  private collection: SearchableCollection<T>;
  private disabledKeys: Set<Key>;
  private disabledBehavior: DisabledBehavior;
  private ref: { current: HTMLElement | null };
  private collator: Intl.Collator | undefined;
  private layout: "stack" | "grid";
  private orientation?: Orientation;
  private direction?: Direction;
  private layoutDelegate: LayoutDelegate;

  constructor(
    collection: SearchableCollection<T>,
    disabledKeys: Set<Key>,
    ref: { current: HTMLElement | null },
    collator?: Intl.Collator
  );
  constructor(options: ListKeyboardDelegateOptions<T>);
  constructor(...args: unknown[]) {
    if (args.length === 1) {
      const opts = args[0] as ListKeyboardDelegateOptions<T>;
      this.collection = opts.collection;
      this.ref = opts.ref;
      this.collator = opts.collator;
      this.disabledKeys = opts.disabledKeys || new Set();
      this.disabledBehavior = opts.disabledBehavior || "all";
      this.orientation = opts.orientation || "vertical";
      this.direction = opts.direction;
      this.layout = opts.layout || "stack";
      this.layoutDelegate = opts.layoutDelegate || new DOMLayoutDelegate(opts.ref);
    } else {
      this.collection = args[0] as SearchableCollection<T>;
      this.disabledKeys = args[1] as Set<Key>;
      this.ref = args[2] as { current: HTMLElement | null };
      this.collator = args[3] as Intl.Collator | undefined;
      this.layout = "stack";
      this.orientation = "vertical";
      this.disabledBehavior = "all";
      this.layoutDelegate = new DOMLayoutDelegate(this.ref);
    }

    if (this.layout === "stack" && this.orientation === "vertical") {
      this.getKeyLeftOf = undefined;
      this.getKeyRightOf = undefined;
    }
  }

  private isDisabled(item: { props?: { isDisabled?: boolean } }) {
    return this.disabledBehavior === "all" && (item.props?.isDisabled || this.disabledKeys.has((item as any).key));
  }

  private findNextNonDisabled(
    key: Key | null,
    getNext: (key: Key) => Key | null
  ): Key | null {
    let nextKey = key;
    while (nextKey != null) {
      const item = this.collection.getItem(nextKey);
      if (item?.type === "item" && !this.isDisabled(item)) {
        return nextKey;
      }

      nextKey = getNext(nextKey);
    }

    return null;
  }

  getNextKey(key: Key): Key | null {
    const nextKey = this.collection.getKeyAfter(key);
    return this.findNextNonDisabled(nextKey, (candidate) => this.collection.getKeyAfter(candidate));
  }

  getPreviousKey(key: Key): Key | null {
    const nextKey = this.collection.getKeyBefore(key);
    return this.findNextNonDisabled(nextKey, (candidate) => this.collection.getKeyBefore(candidate));
  }

  private findKey(
    key: Key,
    nextKey: (key: Key) => Key | null,
    shouldSkip: (prevRect: Rect, itemRect: Rect) => boolean
  ): Key | null {
    let tempKey: Key | null = key;
    let itemRect = this.layoutDelegate.getItemRect(tempKey);
    if (!itemRect || tempKey == null) {
      return null;
    }

    const prevRect = itemRect;
    do {
      tempKey = nextKey(tempKey);
      if (tempKey == null) {
        break;
      }
      itemRect = this.layoutDelegate.getItemRect(tempKey);
    } while (itemRect && shouldSkip(prevRect, itemRect) && tempKey != null);

    return tempKey;
  }

  private isSameRow(prevRect: Rect, itemRect: Rect) {
    return prevRect.y === itemRect.y || prevRect.x !== itemRect.x;
  }

  private isSameColumn(prevRect: Rect, itemRect: Rect) {
    return prevRect.x === itemRect.x || prevRect.y !== itemRect.y;
  }

  getKeyBelow(key: Key): Key | null {
    if (this.layout === "grid" && this.orientation === "vertical") {
      return this.findKey(key, (candidate) => this.getNextKey(candidate), this.isSameRow);
    }

    return this.getNextKey(key);
  }

  getKeyAbove(key: Key): Key | null {
    if (this.layout === "grid" && this.orientation === "vertical") {
      return this.findKey(key, (candidate) => this.getPreviousKey(candidate), this.isSameRow);
    }

    return this.getPreviousKey(key);
  }

  private getNextColumn(key: Key, right: boolean) {
    return right ? this.getPreviousKey(key) : this.getNextKey(key);
  }

  getKeyRightOf?(key: Key): Key | null {
    const layoutDelegateMethod = this.direction === "ltr" ? "getKeyRightOf" : "getKeyLeftOf";
    if (this.layoutDelegate[layoutDelegateMethod]) {
      key = this.layoutDelegate[layoutDelegateMethod](key) as Key;
      return this.findNextNonDisabled(key, (candidate) => this.layoutDelegate[layoutDelegateMethod]?.(candidate) ?? null);
    }

    if (this.layout === "grid") {
      if (this.orientation === "vertical") {
        return this.getNextColumn(key, this.direction === "rtl");
      }

      return this.findKey(
        key,
        (candidate) => this.getNextColumn(candidate, this.direction === "rtl"),
        this.isSameColumn
      );
    }

    if (this.orientation === "horizontal") {
      return this.getNextColumn(key, this.direction === "rtl");
    }

    return null;
  }

  getKeyLeftOf?(key: Key): Key | null {
    const layoutDelegateMethod = this.direction === "ltr" ? "getKeyLeftOf" : "getKeyRightOf";
    if (this.layoutDelegate[layoutDelegateMethod]) {
      key = this.layoutDelegate[layoutDelegateMethod](key) as Key;
      return this.findNextNonDisabled(key, (candidate) => this.layoutDelegate[layoutDelegateMethod]?.(candidate) ?? null);
    }

    if (this.layout === "grid") {
      if (this.orientation === "vertical") {
        return this.getNextColumn(key, this.direction === "ltr");
      }

      return this.findKey(
        key,
        (candidate) => this.getNextColumn(candidate, this.direction === "ltr"),
        this.isSameColumn
      );
    }

    if (this.orientation === "horizontal") {
      return this.getNextColumn(key, this.direction === "ltr");
    }

    return null;
  }

  getFirstKey(_fromKey?: Key | null, _global?: boolean): Key | null {
    const key = this.collection.getFirstKey();
    return this.findNextNonDisabled(key, (candidate) => this.collection.getKeyAfter(candidate));
  }

  getLastKey(_fromKey?: Key | null, _global?: boolean): Key | null {
    const key = this.collection.getLastKey();
    return this.findNextNonDisabled(key, (candidate) => this.collection.getKeyBefore(candidate));
  }

  getKeyPageAbove(key: Key): Key | null {
    const menu = this.ref.current;
    let itemRect = this.layoutDelegate.getItemRect(key);
    if (!itemRect) {
      return null;
    }

    if (menu && !isScrollable(menu)) {
      return this.getFirstKey();
    }

    let nextKey: Key | null = key;
    if (this.orientation === "horizontal") {
      const pageX = Math.max(
        0,
        itemRect.x + itemRect.width - this.layoutDelegate.getVisibleRect().width
      );

      while (itemRect && itemRect.x > pageX && nextKey != null) {
        nextKey = this.getKeyAbove(nextKey);
        itemRect = nextKey == null ? null : this.layoutDelegate.getItemRect(nextKey);
      }
    } else {
      const pageY = Math.max(
        0,
        itemRect.y + itemRect.height - this.layoutDelegate.getVisibleRect().height
      );

      while (itemRect && itemRect.y > pageY && nextKey != null) {
        nextKey = this.getKeyAbove(nextKey);
        itemRect = nextKey == null ? null : this.layoutDelegate.getItemRect(nextKey);
      }
    }

    return nextKey ?? this.getFirstKey();
  }

  getKeyPageBelow(key: Key): Key | null {
    const menu = this.ref.current;
    let itemRect = this.layoutDelegate.getItemRect(key);
    if (!itemRect) {
      return null;
    }

    if (menu && !isScrollable(menu)) {
      return this.getLastKey();
    }

    let nextKey: Key | null = key;
    if (this.orientation === "horizontal") {
      const pageX = Math.min(
        this.layoutDelegate.getContentSize().width,
        itemRect.y - itemRect.width + this.layoutDelegate.getVisibleRect().width
      );

      while (itemRect && itemRect.x < pageX && nextKey != null) {
        nextKey = this.getKeyBelow(nextKey);
        itemRect = nextKey == null ? null : this.layoutDelegate.getItemRect(nextKey);
      }
    } else {
      const pageY = Math.min(
        this.layoutDelegate.getContentSize().height,
        itemRect.y - itemRect.height + this.layoutDelegate.getVisibleRect().height
      );

      while (itemRect && itemRect.y < pageY && nextKey != null) {
        nextKey = this.getKeyBelow(nextKey);
        itemRect = nextKey == null ? null : this.layoutDelegate.getItemRect(nextKey);
      }
    }

    return nextKey ?? this.getLastKey();
  }

  getKeyForSearch(search: string, fromKey?: Key): Key | null {
    if (!this.collator) {
      return null;
    }

    let key = fromKey || this.getFirstKey();
    while (key != null) {
      const item = this.collection.getItem(key);
      if (!item) {
        return null;
      }

      const textValue = (item.textValue || "") as string;
      const substring = textValue.slice(0, search.length);
      if (textValue && this.collator.compare(substring, search) === 0) {
        return key;
      }

      key = this.getNextKey(key);
    }

    return null;
  }
}
