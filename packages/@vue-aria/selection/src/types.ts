import type { Key, Node } from "@vue-aria/collections";
import type { DisabledBehavior } from "@vue-aria/selection-state";

export type Orientation = "vertical" | "horizontal";
export type Direction = "ltr" | "rtl";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface LayoutDelegate {
  getItemRect(key: Key): Rect | null;
  getContentSize(): Size;
  getVisibleRect(): Rect;
  getKeyRightOf?(key: Key): Key | null;
  getKeyLeftOf?(key: Key): Key | null;
}

export interface KeyboardDelegate {
  getKeyBelow(key: Key): Key | null;
  getKeyAbove(key: Key): Key | null;
  getKeyLeftOf?(key: Key): Key | null;
  getKeyRightOf?(key: Key): Key | null;
  getFirstKey(): Key | null;
  getLastKey(): Key | null;
  getKeyPageBelow(key: Key): Key | null;
  getKeyPageAbove(key: Key): Key | null;
  getKeyForSearch?(search: string, fromKey?: Key): Key | null;
}

export interface SearchableCollection<T> {
  getItem(key: Key): Node<T> | null;
  getFirstKey(): Key | null;
  getLastKey(): Key | null;
  getKeyBefore(key: Key): Key | null;
  getKeyAfter(key: Key): Key | null;
}

export interface ListKeyboardDelegateOptions<T> {
  collection: SearchableCollection<T>;
  ref: { current: HTMLElement | null };
  collator?: Intl.Collator;
  layout?: "stack" | "grid";
  orientation?: Orientation;
  direction?: Direction;
  disabledKeys?: Set<Key>;
  disabledBehavior?: DisabledBehavior;
  layoutDelegate?: LayoutDelegate;
}

export interface AriaTypeSelectOptions {
  keyboardDelegate: KeyboardDelegate;
  selectionManager: {
    focusedKey: Key | null;
    setFocusedKey: (key: Key) => void;
  };
  onTypeSelect?: (key: Key) => void;
}

export interface TypeSelectAria {
  typeSelectProps: {
    onKeydownCapture?: (event: KeyboardEvent) => void;
  };
}

export type { Key, Node, DisabledBehavior };
