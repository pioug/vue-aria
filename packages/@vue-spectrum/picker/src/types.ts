import type { Key, Node } from "@vue-aria/collections";
import type { VNode } from "vue";

export type PickerKey = Key;

export interface SpectrumPickerNodeData {
  key?: PickerKey;
  type?: "item" | "section";
  label?: string;
  name?: string;
  title?: string;
  textValue?: string;
  "aria-label"?: string;
  isDisabled?: boolean;
  children?: SpectrumPickerNodeData[];
}

export interface SpectrumPickerProps {
  id?: string;
  label?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  items?: Iterable<SpectrumPickerNodeData>;
  selectedKey?: PickerKey | null;
  defaultSelectedKey?: PickerKey | null;
  onSelectionChange?: (key: PickerKey | null) => void;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  maxHeight?: number;
  onLoadMore?: () => void;
  isRequired?: boolean;
  validationBehavior?: "native" | "aria";
  isInvalid?: boolean;
  validationState?: "valid" | "invalid";
  placeholder?: string;
  name?: string;
  form?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}

export interface SpectrumPickerItemProps {
  id?: PickerKey;
  textValue?: string;
  isDisabled?: boolean;
  "aria-label"?: string;
}

export interface SpectrumPickerSectionProps {
  id?: PickerKey;
  title?: string;
  "aria-label"?: string;
}

export interface PickerCollectionNode<T extends object = object> extends Node<T> {
  wrapper?: (node: VNode) => VNode;
}
