import type { Key, Node } from "@vue-aria/collections";
import type { ListState } from "@vue-aria/list-state";
import type { SelectionValue } from "@vue-aria/selection-state";
import type { VNode } from "vue";

export interface SpectrumListBoxNodeData {
  key?: Key;
  type?: "item" | "section";
  name?: string;
  title?: string;
  textValue?: string;
  "aria-label"?: string;
  isDisabled?: boolean;
  href?: string;
  routerOptions?: unknown;
  onAction?: () => void;
  children?: SpectrumListBoxNodeData[];
}

export interface SpectrumListBoxProps<T extends object> {
  id?: string;
  items?: Iterable<T | SpectrumListBoxNodeData | Node<T>>;
  disabledKeys?: Iterable<Key>;
  selectionMode?: "none" | "single" | "multiple";
  disallowEmptySelection?: boolean;
  escapeKeyBehavior?: "clearSelection" | "none";
  selectedKeys?: SelectionValue;
  defaultSelectedKeys?: SelectionValue;
  onSelectionChange?: (keys: SelectionValue) => void;
  autoFocus?: boolean | "first" | "last";
  shouldFocusWrap?: boolean;
  shouldUseVirtualFocus?: boolean;
  shouldSelectOnPressUp?: boolean;
  shouldFocusOnHover?: boolean;
  isLoading?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  onAction?: (key: Key) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onFocusChange?: (isFocused: boolean) => void;
  renderEmptyState?: () => VNode | string | null;
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}

export interface SpectrumListBoxItemProps {
  textValue?: string;
  href?: string;
  routerOptions?: unknown;
  isDisabled?: boolean;
  onAction?: () => void;
  "aria-label"?: string;
}

export interface SpectrumListBoxSectionProps {
  title?: string;
  "aria-label"?: string;
}

export interface ListBoxCollectionNode<T extends object = object> extends Node<T> {
  wrapper?: (node: VNode) => VNode;
}

export interface ListBoxContextValue {
  state: ListState<object>;
  shouldFocusOnHover: boolean;
  shouldUseVirtualFocus: boolean;
  renderEmptyState?: () => VNode | string | null;
}
