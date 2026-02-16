import type { VNodeChild } from "vue";

import type { AriaLabelingProps, AsyncLoadable, CollectionBase, DOMProps, FocusEvents, FocusStrategy, Key, MultipleSelection, SelectionBehavior, StyleProps } from "@vue-types/shared";

export interface ListBoxProps<T> extends CollectionBase<T>, MultipleSelection, FocusEvents {
  autoFocus?: boolean | FocusStrategy;
  shouldFocusWrap?: boolean;
}

interface AriaListBoxPropsBase<T> extends ListBoxProps<T>, DOMProps, AriaLabelingProps {
  escapeKeyBehavior?: "clearSelection" | "none";
}

export interface AriaListBoxProps<T> extends AriaListBoxPropsBase<T> {
  label?: VNodeChild;
  selectionBehavior?: SelectionBehavior;
  shouldSelectOnPressUp?: boolean;
  shouldFocusOnHover?: boolean;
  onAction?: (key: Key) => void;
}

export interface SpectrumListBoxProps<T> extends AriaListBoxPropsBase<T>, AsyncLoadable, StyleProps {}
