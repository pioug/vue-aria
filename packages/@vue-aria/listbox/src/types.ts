import type { Key, Node } from "@vue-aria/collections";
import type { LayoutDelegate, KeyboardDelegate, SearchableCollection } from "@vue-aria/selection";
import type { MultipleSelectionManager } from "@vue-aria/selection-state";
import type { ListState as ListStateBase } from "@vue-aria/list-state";

export type ListState<T> = ListStateBase<T> & {
  collection: SearchableCollection<T> & {
    getItem(key: Key): Node<T> | null;
  };
  selectionManager: MultipleSelectionManager;
};

export interface AriaListBoxProps<T> {
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  label?: string;
  selectionBehavior?: "toggle" | "replace";
  shouldSelectOnPressUp?: boolean;
  shouldFocusOnHover?: boolean;
  onAction?: (key: Key) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onFocusChange?: (isFocused: boolean) => void;
  keyboardDelegate?: KeyboardDelegate;
  layoutDelegate?: LayoutDelegate;
  disallowTypeAhead?: boolean;
  shouldUseVirtualFocus?: boolean;
  autoFocus?: boolean | "first" | "last";
  shouldFocusWrap?: boolean;
  disallowEmptySelection?: boolean;
  disallowSelectAll?: boolean;
  escapeKeyBehavior?: "clearSelection" | "none";
  selectOnFocus?: boolean;
  allowsTabNavigation?: boolean;
  isVirtualized?: boolean;
  linkBehavior?: "action" | "selection" | "override";
  [key: string]: unknown;
}
