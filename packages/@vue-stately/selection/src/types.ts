export type Key = string | number;
export type Selection = "all" | Set<Key>;
export type SelectionMode = "none" | "single" | "multiple";
export type SelectionBehavior = "toggle" | "replace";
export type DisabledBehavior = "all" | "selection";
export type FocusStrategy = "first" | "last";

export interface Node<T = unknown> {
  type: string;
  key: Key;
  parentKey: Key | null;
  firstChildKey: Key | null;
  lastChildKey: Key | null;
  hasChildNodes: boolean;
  props?: any;
}

export interface Collection<T = Node<unknown>> {
  getItem(key: Key): T | null;
  getFirstKey(): Key | null;
  getKeyAfter(key: Key): Key | null;
  getChildren(key: Key): Iterable<T>;
}

export interface FocusState {
  readonly isFocused: boolean;
  setFocused(isFocused: boolean): void;
  readonly focusedKey: Key | null;
  readonly childFocusStrategy: FocusStrategy | null;
  setFocusedKey(key: Key | null, child?: FocusStrategy): void;
}

export interface MultipleSelectionState extends FocusState {
  readonly selectionMode: SelectionMode;
  readonly selectionBehavior: SelectionBehavior;
  setSelectionBehavior(selectionBehavior: SelectionBehavior): void;
  readonly disallowEmptySelection: boolean;
  readonly selectedKeys: Selection;
  setSelectedKeys(keys: Selection): void;
  readonly disabledKeys: Set<Key>;
  readonly disabledBehavior: DisabledBehavior;
}

export interface MultipleSelectionManager extends FocusState {
  readonly selectionMode: SelectionMode;
  readonly selectionBehavior: SelectionBehavior;
  setSelectionBehavior(selectionBehavior: SelectionBehavior): void;
  readonly disallowEmptySelection?: boolean;
  readonly selectedKeys: Set<Key>;
  readonly isEmpty: boolean;
  readonly isSelectAll: boolean;
  readonly firstSelectedKey: Key | null;
  readonly lastSelectedKey: Key | null;
  readonly disabledKeys: Set<Key>;
  readonly disabledBehavior: DisabledBehavior;
  isSelected(key: Key): boolean;
  isSelectionEqual(selection: Set<Key>): boolean;
  extendSelection(toKey: Key): void;
  toggleSelection(key: Key): void;
  replaceSelection(key: Key): void;
  setSelectedKeys(keys: Iterable<Key>): void;
  selectAll(): void;
  clearSelection(): void;
  toggleSelectAll(): void;
  select(key: Key, e?: any): void;
  canSelectItem(key: Key): boolean;
  isDisabled(key: Key): boolean;
  isLink(key: Key): boolean;
  getItemProps(key: Key): any;
  collection: Collection<Node<unknown>>;
}
