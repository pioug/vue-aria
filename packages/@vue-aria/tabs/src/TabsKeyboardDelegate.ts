import type { Key } from "@vue-aria/collections";

type Direction = "ltr" | "rtl";
type Orientation = "horizontal" | "vertical";

export class TabsKeyboardDelegate<T> {
  private collection: {
    getFirstKey(): Key | null;
    getLastKey(): Key | null;
    getKeyAfter(key: Key): Key | null;
    getKeyBefore(key: Key): Key | null;
    getItem(key: Key): { props?: { isDisabled?: boolean } } | null;
  };
  private flipDirection: boolean;
  private disabledKeys: Set<Key>;
  private tabDirection: boolean;

  constructor(
    collection: TabsKeyboardDelegate<T>["collection"],
    direction: Direction,
    orientation: Orientation,
    disabledKeys: Set<Key> = new Set()
  ) {
    this.collection = collection;
    this.flipDirection = direction === "rtl" && orientation === "horizontal";
    this.disabledKeys = disabledKeys;
    this.tabDirection = orientation === "horizontal";
  }

  getKeyLeftOf(key: Key): Key | null {
    return this.flipDirection ? this.getNextKey(key) : this.getPreviousKey(key);
  }

  getKeyRightOf(key: Key): Key | null {
    return this.flipDirection ? this.getPreviousKey(key) : this.getNextKey(key);
  }

  private isDisabled(key: Key) {
    return this.disabledKeys.has(key) || !!this.collection.getItem(key)?.props?.isDisabled;
  }

  getFirstKey(): Key | null {
    let key = this.collection.getFirstKey();
    if (key != null && this.isDisabled(key)) {
      key = this.getNextKey(key);
    }

    return key;
  }

  getLastKey(): Key | null {
    let key = this.collection.getLastKey();
    if (key != null && this.isDisabled(key)) {
      key = this.getPreviousKey(key);
    }

    return key;
  }

  getKeyAbove(key: Key): Key | null {
    if (this.tabDirection) {
      return null;
    }

    return this.getPreviousKey(key);
  }

  getKeyBelow(key: Key): Key | null {
    if (this.tabDirection) {
      return null;
    }

    return this.getNextKey(key);
  }

  getNextKey(startKey: Key): Key | null {
    let key: Key | null = startKey;
    do {
      key = this.collection.getKeyAfter(key);
      if (key == null) {
        key = this.collection.getFirstKey();
      }
    } while (key != null && this.isDisabled(key));

    return key;
  }

  getPreviousKey(startKey: Key): Key | null {
    let key: Key | null = startKey;
    do {
      key = this.collection.getKeyBefore(key);
      if (key == null) {
        key = this.collection.getLastKey();
      }
    } while (key != null && this.isDisabled(key));

    return key;
  }
}
