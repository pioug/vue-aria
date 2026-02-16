import type {
  AriaLabelingProps,
  AsyncLoadable,
  CollectionBase,
  DimensionValue,
  DOMProps,
  FocusableProps,
  HelpTextProps,
  InputBase,
  InputDOMProps,
  Key,
  LabelableProps,
  LoadingState,
  SingleSelection,
  SpectrumFieldValidation,
  SpectrumLabelableProps,
  SpectrumTextInputBase,
  StyleProps,
  TextInputBase,
  Validation
} from "@vue-types/shared";

export type MenuTriggerAction = "focus" | "input" | "manual";

export interface ComboBoxValidationValue {
  selectedKey: Key | null;
  inputValue: string;
}

export interface ComboBoxProps<T> extends CollectionBase<T>, Omit<SingleSelection, "disallowEmptySelection" | "onSelectionChange">, InputBase, TextInputBase, Validation<ComboBoxValidationValue>, FocusableProps, LabelableProps, HelpTextProps {
  defaultItems?: Iterable<T>;
  items?: Iterable<T>;
  onOpenChange?: (isOpen: boolean, menuTrigger?: MenuTriggerAction) => void;
  onSelectionChange?: (key: Key | null) => void;
  inputValue?: string;
  defaultInputValue?: string;
  onInputChange?: (value: string) => void;
  allowsCustomValue?: boolean;
  menuTrigger?: MenuTriggerAction;
}

export interface AriaComboBoxProps<T> extends ComboBoxProps<T>, DOMProps, InputDOMProps, AriaLabelingProps {
  shouldFocusWrap?: boolean;
}

export interface SpectrumComboBoxProps<T> extends SpectrumTextInputBase, Omit<AriaComboBoxProps<T>, "menuTrigger" | "isInvalid" | "validationState">, SpectrumFieldValidation<ComboBoxValidationValue>, SpectrumLabelableProps, StyleProps, Omit<AsyncLoadable, "isLoading"> {
  menuTrigger?: MenuTriggerAction;
  isQuiet?: boolean;
  align?: "start" | "end";
  direction?: "bottom" | "top";
  loadingState?: LoadingState;
  shouldFlip?: boolean;
  menuWidth?: DimensionValue;
  formValue?: "text" | "key";
}
