import type {
  Alignment,
  AriaLabelingProps,
  AsyncLoadable,
  CollectionBase,
  DimensionValue,
  DOMProps,
  FocusableDOMProps,
  FocusableProps,
  HelpTextProps,
  InputBase,
  Key,
  LabelableProps,
  SingleSelection,
  SpectrumLabelableProps,
  StyleProps,
  TextInputBase,
  Validation,
  ValueBase
} from "@vue-types/shared";

export type SelectionMode = "single" | "multiple";
export type ValueType<M extends SelectionMode> = M extends "single" ? Key | null : readonly Key[];
export type ChangeValueType<M extends SelectionMode> = M extends "single" ? Key | null : Key[];
type ValidationType<M extends SelectionMode> = M extends "single" ? Key : Key[];

export interface SelectProps<T, M extends SelectionMode = "single"> extends CollectionBase<T>, Omit<InputBase, "isReadOnly">, ValueBase<ValueType<M>, ChangeValueType<M>>, Validation<ValidationType<M>>, HelpTextProps, LabelableProps, TextInputBase, FocusableProps {
  selectionMode?: M;
  selectedKey?: Key | null;
  defaultSelectedKey?: Key;
  onSelectionChange?: (key: Key | null) => void;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  allowsEmptyCollection?: boolean;
}

export interface AriaSelectProps<T, M extends SelectionMode = "single"> extends SelectProps<T, M>, DOMProps, AriaLabelingProps, FocusableDOMProps {
  autoComplete?: string;
  name?: string;
  form?: string;
}

export interface SpectrumPickerProps<T> extends Omit<AriaSelectProps<T>, "selectionMode" | "selectedKey" | "defaultSelectedKey" | "onSelectionChange" | "value" | "defaultValue" | "onChange" | "allowsEmptyCollection">, Omit<SingleSelection, "disallowEmptySelection">, AsyncLoadable, SpectrumLabelableProps, StyleProps {
  isQuiet?: boolean;
  align?: Alignment;
  direction?: "bottom" | "top";
  shouldFlip?: boolean;
  menuWidth?: DimensionValue;
  autoFocus?: boolean;
}
