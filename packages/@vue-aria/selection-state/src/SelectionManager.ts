import { compareNodeOrder, getChildNodes, getFirstItem } from "./collectionUtils";
import { Selection } from "./Selection";
import type {
  Collection,
  DisabledBehavior,
  FocusStrategy,
  Key,
  MultipleSelectionManager,
  MultipleSelectionState,
  Node,
  SelectionBehavior,
  SelectionMode,
} from "./types";

interface SelectionManagerOptions {
  allowsCellSelection?: boolean;
  layoutDelegate?: {
    getKeyRange?: (from: Key, to: Key) => Key[];
  };
}

export class SelectionManager implements MultipleSelectionManager {
  collection: Collection<Node<unknown>>;
  private state: MultipleSelectionState;
  private allowsCellSelection: boolean;
  private _isSelectAll: boolean | null;
  private layoutDelegate: SelectionManagerOptions["layoutDelegate"];

  constructor(collection: Collection<Node<unknown>>, state: MultipleSelectionState, options?: SelectionManagerOptions) {
    this.collection = collection;
    this.state = state;
    this.allowsCellSelection = options?.allowsCellSelection ?? false;
    this._isSelectAll = null;
    this.layoutDelegate = options?.layoutDelegate;
  }

  get selectionMode(): SelectionMode {
    return this.state.selectionMode;
  }

  get disallowEmptySelection(): boolean {
    return this.state.disallowEmptySelection;
  }

  get selectionBehavior(): SelectionBehavior {
    return this.state.selectionBehavior;
  }

  setSelectionBehavior(selectionBehavior: SelectionBehavior): void {
    this.state.setSelectionBehavior(selectionBehavior);
  }

  get isFocused(): boolean {
    return this.state.isFocused;
  }

  setFocused(isFocused: boolean): void {
    this.state.setFocused(isFocused);
  }

  get focusedKey(): Key | null {
    return this.state.focusedKey;
  }

  get childFocusStrategy(): FocusStrategy | null {
    return this.state.childFocusStrategy;
  }

  setFocusedKey(key: Key | null, childFocusStrategy?: FocusStrategy): void {
    if (key == null || this.collection.getItem(key)) {
      this.state.setFocusedKey(key, childFocusStrategy);
    }
  }

  get selectedKeys(): Set<Key> {
    return this.state.selectedKeys === "all"
      ? new Set(this.getSelectAllKeys())
      : this.state.selectedKeys;
  }

  get rawSelection() {
    return this.state.selectedKeys;
  }

  isSelected(key: Key): boolean {
    if (this.state.selectionMode === "none") {
      return false;
    }

    const mappedKey = this.getKey(key);
    if (mappedKey == null) {
      return false;
    }

    return this.state.selectedKeys === "all"
      ? this.canSelectItem(mappedKey)
      : this.state.selectedKeys.has(mappedKey);
  }

  get isEmpty(): boolean {
    return this.state.selectedKeys !== "all" && this.state.selectedKeys.size === 0;
  }

  get isSelectAll(): boolean {
    if (this.isEmpty) {
      return false;
    }

    if (this.state.selectedKeys === "all") {
      return true;
    }

    if (this._isSelectAll != null) {
      return this._isSelectAll;
    }

    const allKeys = this.getSelectAllKeys();
    const selectedKeys = this.state.selectedKeys;
    this._isSelectAll = allKeys.every((k) => selectedKeys.has(k));
    return this._isSelectAll;
  }

  get firstSelectedKey(): Key | null {
    let first: Node<unknown> | null = null;
    if (this.state.selectedKeys === "all") {
      return this.collection.getFirstKey();
    }

    for (const key of this.state.selectedKeys) {
      const item = this.collection.getItem(key);
      if (!first || (item && compareNodeOrder(this.collection, item, first) < 0)) {
        first = item;
      }
    }

    return first?.key ?? null;
  }

  get lastSelectedKey(): Key | null {
    let last: Node<unknown> | null = null;
    if (this.state.selectedKeys === "all") {
      let key = this.collection.getFirstKey();
      let prev: Key | null = null;
      while (key != null) {
        prev = key;
        key = this.collection.getKeyAfter(key);
      }
      return prev;
    }

    for (const key of this.state.selectedKeys) {
      const item = this.collection.getItem(key);
      if (!last || (item && compareNodeOrder(this.collection, item, last) > 0)) {
        last = item;
      }
    }

    return last?.key ?? null;
  }

  get disabledKeys(): Set<Key> {
    return this.state.disabledKeys;
  }

  get disabledBehavior(): DisabledBehavior {
    return this.state.disabledBehavior;
  }

  extendSelection(toKey: Key): void {
    if (this.selectionMode === "none") {
      return;
    }

    if (this.selectionMode === "single") {
      this.replaceSelection(toKey);
      return;
    }

    const mappedToKey = this.getKey(toKey);
    if (mappedToKey == null) {
      return;
    }

    let selection: Selection;

    if (this.state.selectedKeys === "all") {
      selection = new Selection([mappedToKey], mappedToKey, mappedToKey);
    } else {
      const selectedKeys = this.state.selectedKeys as Selection;
      const anchorKey = selectedKeys.anchorKey ?? mappedToKey;
      selection = new Selection(selectedKeys, anchorKey, mappedToKey);
      for (const key of this.getKeyRange(anchorKey, selectedKeys.currentKey ?? mappedToKey)) {
        selection.delete(key);
      }

      for (const key of this.getKeyRange(mappedToKey, anchorKey)) {
        if (this.canSelectItem(key)) {
          selection.add(key);
        }
      }
    }

    this.state.setSelectedKeys(selection);
  }

  private getKeyRange(from: Key, to: Key) {
    const fromItem = this.collection.getItem(from);
    const toItem = this.collection.getItem(to);
    if (fromItem && toItem) {
      if (compareNodeOrder(this.collection, fromItem, toItem) <= 0) {
        return this.getKeyRangeInternal(from, to);
      }

      return this.getKeyRangeInternal(to, from);
    }

    return [] as Key[];
  }

  private getKeyRangeInternal(from: Key, to: Key) {
    if (this.layoutDelegate?.getKeyRange) {
      return this.layoutDelegate.getKeyRange(from, to);
    }

    const keys: Key[] = [];
    let key: Key | null = from;
    while (key != null) {
      const item = this.collection.getItem(key);
      if (item && (item.type === "item" || (item.type === "cell" && this.allowsCellSelection))) {
        keys.push(key);
      }

      if (key === to) {
        return keys;
      }

      key = this.collection.getKeyAfter(key);
    }

    return [] as Key[];
  }

  private getKey(key: Key) {
    let item = this.collection.getItem(key);
    if (!item) {
      return key;
    }

    if (item.type === "cell" && this.allowsCellSelection) {
      return key;
    }

    while (item && item.type !== "item" && item.parentKey != null) {
      item = this.collection.getItem(item.parentKey);
    }

    if (!item || item.type !== "item") {
      return null;
    }

    return item.key;
  }

  toggleSelection(key: Key): void {
    if (this.selectionMode === "none") {
      return;
    }

    if (this.selectionMode === "single" && !this.isSelected(key)) {
      this.replaceSelection(key);
      return;
    }

    const mappedKey = this.getKey(key);
    if (mappedKey == null) {
      return;
    }

    const keys = new Selection(this.state.selectedKeys === "all" ? this.getSelectAllKeys() : this.state.selectedKeys as Set<Key>);
    if (keys.has(mappedKey)) {
      keys.delete(mappedKey);
    } else if (this.canSelectItem(mappedKey)) {
      keys.add(mappedKey);
      keys.anchorKey = mappedKey;
      keys.currentKey = mappedKey;
    }

    if (this.disallowEmptySelection && keys.size === 0) {
      return;
    }

    this.state.setSelectedKeys(keys);
  }

  replaceSelection(key: Key): void {
    if (this.selectionMode === "none") {
      return;
    }

    const mappedKey = this.getKey(key);
    if (mappedKey == null) {
      return;
    }

    const selection = this.canSelectItem(mappedKey)
      ? new Selection([mappedKey], mappedKey, mappedKey)
      : new Selection();

    this.state.setSelectedKeys(selection);
  }

  setSelectedKeys(keys: Iterable<Key>): void {
    if (this.selectionMode === "none") {
      return;
    }

    const selection = new Selection();
    for (const key of keys) {
      const mappedKey = this.getKey(key);
      if (mappedKey != null) {
        selection.add(mappedKey);
        if (this.selectionMode === "single") {
          break;
        }
      }
    }

    this.state.setSelectedKeys(selection);
  }

  private getSelectAllKeys() {
    const keys: Key[] = [];
    const addKeys = (key: Key | null) => {
      while (key != null) {
        if (this.canSelectItem(key)) {
          const item = this.collection.getItem(key);
          if (item?.type === "item") {
            keys.push(key);
          }

          if (item?.hasChildNodes && (this.allowsCellSelection || item.type !== "item")) {
            addKeys(getFirstItem(getChildNodes(item, this.collection as any))?.key ?? null);
          }
        }

        key = this.collection.getKeyAfter(key);
      }
    };

    addKeys(this.collection.getFirstKey());
    return keys;
  }

  selectAll(): void {
    if (!this.isSelectAll && this.selectionMode === "multiple") {
      this.state.setSelectedKeys("all");
    }
  }

  clearSelection(): void {
    if (!this.disallowEmptySelection && (this.state.selectedKeys === "all" || this.state.selectedKeys.size > 0)) {
      this.state.setSelectedKeys(new Selection());
    }
  }

  toggleSelectAll(): void {
    if (this.isSelectAll) {
      this.clearSelection();
    } else {
      this.selectAll();
    }
  }

  select(key: Key, e?: { pointerType?: string }): void {
    if (this.selectionMode === "none") {
      return;
    }

    if (this.selectionMode === "single") {
      if (this.isSelected(key) && !this.disallowEmptySelection) {
        this.toggleSelection(key);
      } else {
        this.replaceSelection(key);
      }
    } else if (this.selectionBehavior === "toggle" || (e && (e.pointerType === "touch" || e.pointerType === "virtual"))) {
      this.toggleSelection(key);
    } else {
      this.replaceSelection(key);
    }
  }

  isSelectionEqual(selection: Set<Key>): boolean {
    if (selection === this.state.selectedKeys) {
      return true;
    }

    const selectedKeys = this.selectedKeys;
    if (selection.size !== selectedKeys.size) {
      return false;
    }

    for (const key of selection) {
      if (!selectedKeys.has(key)) {
        return false;
      }
    }

    for (const key of selectedKeys) {
      if (!selection.has(key)) {
        return false;
      }
    }

    return true;
  }

  canSelectItem(key: Key): boolean {
    if (this.state.selectionMode === "none" || this.state.disabledKeys.has(key)) {
      return false;
    }

    const item = this.collection.getItem(key);
    if (!item || item?.props?.isDisabled || (item.type === "cell" && !this.allowsCellSelection)) {
      return false;
    }

    return true;
  }

  isDisabled(key: Key): boolean {
    return this.state.disabledBehavior === "all" && (this.state.disabledKeys.has(key) || !!this.collection.getItem(key)?.props?.isDisabled);
  }

  isLink(key: Key): boolean {
    return !!this.collection.getItem(key)?.props?.href;
  }

  getItemProps(key: Key): any {
    return this.collection.getItem(key)?.props;
  }

  withCollection(collection: Collection<Node<unknown>>): SelectionManager {
    return new SelectionManager(collection, this.state, {
      allowsCellSelection: this.allowsCellSelection,
      layoutDelegate: this.layoutDelegate || undefined,
    });
  }
}
