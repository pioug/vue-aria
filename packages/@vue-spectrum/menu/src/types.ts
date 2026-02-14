import type { Key, Node } from "@vue-aria/collections";
import type { SelectionValue } from "@vue-aria/selection-state";
import type { VNode } from "vue";

export type MenuTriggerType = "press" | "longPress";
export type MenuDirection = "top" | "bottom" | "left" | "right" | "start" | "end";
export type MenuAlign = "start" | "end";

export type SpectrumMenuNodeType = "item" | "section";

export interface SpectrumMenuNodeData {
  key?: Key;
  type?: SpectrumMenuNodeType;
  name?: string;
  title?: string;
  textValue?: string;
  description?: string;
  keyboardShortcut?: string;
  "aria-label"?: string;
  isDisabled?: boolean;
  href?: string;
  routerOptions?: unknown;
  closeOnSelect?: boolean;
  onAction?: () => void;
  children?: SpectrumMenuNodeData[];
}

export interface SpectrumRootMenuTriggerState {
  readonly isOpen: boolean;
  readonly focusStrategy: "first" | "last" | null;
  readonly expandedKeysStack: Key[];
  open(focusStrategy?: "first" | "last" | null): void;
  close(): void;
  toggle(focusStrategy?: "first" | "last" | null): void;
  openSubmenu(triggerKey: Key, level: number, focusStrategy?: "first" | "last" | null): void;
  closeSubmenu(level: number): void;
}

export interface SpectrumMenuBaseProps<T extends object> {
  id?: string;
  items?: Iterable<T | SpectrumMenuNodeData | Node<T>>;
  disabledKeys?: Iterable<Key>;
  selectionMode?: "none" | "single" | "multiple";
  disallowEmptySelection?: boolean;
  selectedKeys?: SelectionValue;
  defaultSelectedKeys?: SelectionValue;
  onSelectionChange?: (keys: SelectionValue) => void;
  shouldFocusWrap?: boolean;
  shouldUseVirtualFocus?: boolean;
  isVirtualized?: boolean;
  autoFocus?: boolean | "first" | "last";
  closeOnSelect?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  onAction?: (key: Key) => void;
  onClose?: () => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
  rootMenuTriggerState?: SpectrumRootMenuTriggerState;
  submenuLevel?: number;
  onBackButtonPress?: () => void;
}

export interface SpectrumMenuProps<T extends object> extends SpectrumMenuBaseProps<T> {
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}

export interface SpectrumMenuTriggerProps {
  align?: MenuAlign;
  shouldFlip?: boolean;
  direction?: MenuDirection;
  portalContainer?: Element | null;
  closeOnSelect?: boolean;
  trigger?: MenuTriggerType;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export interface SpectrumSubmenuTriggerProps {
  type?: "menu" | "dialog";
  isUnavailable?: boolean;
}

export interface SpectrumActionMenuProps<T extends object> extends SpectrumMenuTriggerProps, SpectrumMenuBaseProps<T> {
  isDisabled?: boolean;
  autoFocus?: boolean;
  "aria-label"?: string;
}

export interface SpectrumMenuItemProps {
  textValue?: string;
  description?: string;
  keyboardShortcut?: string;
  href?: string;
  routerOptions?: unknown;
  closeOnSelect?: boolean;
  isDisabled?: boolean;
  onAction?: () => void;
  "aria-label"?: string;
}

export interface SpectrumMenuSectionProps {
  title?: string;
  "aria-label"?: string;
}

export interface MenuCollectionNode<T extends object = object> extends Node<T> {
  wrapper?: (node: VNode) => VNode;
}
