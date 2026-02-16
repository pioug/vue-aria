import type { Key, Node } from "@vue-aria/collections";
import type { VNode } from "vue";

export type SearchAutocompleteKey = Key;

export type SearchAutocompleteMenuTrigger = "focus" | "input" | "manual";
export type SearchAutocompleteAlign = "start" | "end";
export type SearchAutocompleteDirection = "bottom" | "top";
export type SearchAutocompleteLoadingState = "idle" | "loading" | "filtering" | "loadingMore";
export type SearchAutocompleteFormValue = "text" | "key";

export type SearchAutocompleteValidationState = "valid" | "invalid";
export type SearchAutocompleteValidationBehavior = "aria" | "native";

export interface SpectrumSearchAutocompleteNodeData {
  key?: SearchAutocompleteKey;
  type?: "item" | "section";
  label?: string;
  name?: string;
  title?: string;
  textValue?: string;
  "aria-label"?: string;
  isDisabled?: boolean;
  children?: SpectrumSearchAutocompleteNodeData[];
}

export interface SpectrumSearchAutocompleteProps {
  id?: string;
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: {
    isInvalid: boolean;
    validationErrors: string[];
    validationDetails: ValidityState | null;
  }) => string | null | undefined);
  items?: Iterable<SpectrumSearchAutocompleteNodeData>;
  defaultItems?: Iterable<SpectrumSearchAutocompleteNodeData>;
  disabledKeys?: Iterable<SearchAutocompleteKey>;
  inputValue?: string;
  defaultInputValue?: string;
  onInputChange?: (value: string) => void;
  onSubmit?: (value: string | null, key: SearchAutocompleteKey | null) => void;
  onOpenChange?: (isOpen: boolean, menuTrigger?: SearchAutocompleteMenuTrigger) => void;
  onSelectionChange?: (key: SearchAutocompleteKey | null) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
  onClear?: () => void;
  onLoadMore?: () => void;
  defaultOpen?: boolean;
  isOpen?: boolean;
  menuTrigger?: SearchAutocompleteMenuTrigger;
  shouldCloseOnBlur?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  validationState?: SearchAutocompleteValidationState;
  validationBehavior?: SearchAutocompleteValidationBehavior;
  validate?: (value: string) => boolean | string | string[] | null | undefined;
  allowsCustomValue?: boolean;
  maxHeight?: number;
  loadingState?: SearchAutocompleteLoadingState;
  name?: string;
  form?: string;
  formValue?: SearchAutocompleteFormValue;
  autoFocus?: boolean;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  excludeFromTabOrder?: boolean;
  placeholder?: string;
  icon?: unknown;
  isQuiet?: boolean;
  direction?: SearchAutocompleteDirection;
  align?: SearchAutocompleteAlign;
  menuWidth?: unknown;
  shouldFlip?: boolean;
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}

export interface SpectrumSearchAutocompleteItemProps {
  id?: SearchAutocompleteKey;
  textValue?: string;
  isDisabled?: boolean;
  "aria-label"?: string;
}

export interface SpectrumSearchAutocompleteSectionProps {
  id?: SearchAutocompleteKey;
  title?: string;
  "aria-label"?: string;
}

export interface SearchAutocompleteCollectionNode<T extends object = object> extends Node<T> {
  wrapper?: (node: VNode) => VNode;
}
