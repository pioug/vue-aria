import type { Key, Node } from "@vue-aria/collections";
import type { MenuTriggerAction } from "@vue-aria/combobox-state";
import type { VNode } from "vue";

export type ComboBoxKey = Key;

export interface SpectrumComboBoxNodeData {
  key?: ComboBoxKey;
  type?: "item" | "section";
  label?: string;
  name?: string;
  title?: string;
  textValue?: string;
  "aria-label"?: string;
  isDisabled?: boolean;
  children?: SpectrumComboBoxNodeData[];
}

export interface SpectrumComboBoxProps {
  id?: string;
  label?: string;
  description?: string;
  errorMessage?: string;
  items?: Iterable<SpectrumComboBoxNodeData>;
  selectedKey?: ComboBoxKey | null;
  defaultSelectedKey?: ComboBoxKey | null;
  onSelectionChange?: (key: ComboBoxKey | null) => void;
  inputValue?: string;
  defaultInputValue?: string;
  onInputChange?: (value: string) => void;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean, trigger?: MenuTriggerAction) => void;
  defaultFilter?: SpectrumComboBoxFilterFn;
  completionMode?: SpectrumComboBoxCompletionMode;
  menuTrigger?: SpectrumComboBoxMenuTrigger;
  allowsEmptyCollection?: boolean;
  allowsCustomValue?: boolean;
  shouldCloseOnBlur?: boolean;
  maxHeight?: number;
  onLoadMore?: () => void;
  loadingState?: SpectrumComboBoxLoadingState;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  validationState?: "valid" | "invalid";
  placeholder?: string;
  name?: string;
  form?: string;
  autoFocus?: boolean;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}

export interface SpectrumComboBoxItemProps {
  id?: ComboBoxKey;
  textValue?: string;
  isDisabled?: boolean;
  "aria-label"?: string;
}

export interface SpectrumComboBoxSectionProps {
  id?: ComboBoxKey;
  title?: string;
  "aria-label"?: string;
}

export type SpectrumComboBoxCompletionMode = "none" | "list" | "both";
export type SpectrumComboBoxMenuTrigger = "focus" | "input" | "manual";
export type SpectrumComboBoxMenuTriggerAction = MenuTriggerAction;
export type SpectrumComboBoxFilterFn = (textValue: string, inputValue: string) => boolean;
export type SpectrumComboBoxLoadingState =
  | "idle"
  | "loading"
  | "filtering"
  | "loadingMore";

export interface ComboBoxCollectionNode<T extends object = object> extends Node<T> {
  wrapper?: (node: VNode) => VNode;
}
