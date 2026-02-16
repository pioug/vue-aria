import type { VNodeChild } from "vue";

import type { Alignment, AriaLabelingProps, CollectionBase, DOMProps, FocusStrategy, Key, MultipleSelection, StyleProps } from "@vue-types/shared";
import type { OverlayTriggerProps } from "@vue-types/overlays";

export type MenuTriggerType = "press" | "longPress";

export interface MenuTriggerProps extends OverlayTriggerProps {
  trigger?: MenuTriggerType;
}

export interface SpectrumMenuTriggerProps extends MenuTriggerProps {
  children: VNodeChild[];
  align?: Alignment;
  direction?: "bottom" | "top" | "left" | "right" | "start" | "end";
  shouldFlip?: boolean;
  closeOnSelect?: boolean;
}

export interface MenuProps<T> extends CollectionBase<T>, MultipleSelection {
  autoFocus?: boolean | FocusStrategy;
  shouldFocusWrap?: boolean;
  onAction?: (key: Key) => void;
  onClose?: () => void;
}

export interface AriaMenuProps<T> extends MenuProps<T>, DOMProps, AriaLabelingProps {
  escapeKeyBehavior?: "clearSelection" | "none";
}

export interface SpectrumMenuProps<T> extends AriaMenuProps<T>, StyleProps {}

export interface SpectrumActionMenuProps<T> extends CollectionBase<T>, Omit<SpectrumMenuTriggerProps, "children">, StyleProps, DOMProps, AriaLabelingProps {
  isDisabled?: boolean;
  isQuiet?: boolean;
  autoFocus?: boolean;
  onAction?: (key: Key) => void;
}
