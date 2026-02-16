import type { RefObject } from "@vue-types/shared";
import type { AriaLabelingProps, AriaValidationProps, FocusableDOMProps, FocusableProps, HelpTextProps, InputBase, LabelableProps, SpectrumFieldValidation, SpectrumLabelableProps, SpectrumTextInputBase, StyleProps, TextInputBase, TextInputDOMProps, Validation, ValueBase } from "@vue-types/shared";
import type { VNodeChild } from "vue";

export interface TextFieldProps<T = HTMLInputElement> extends InputBase, Validation<string>, HelpTextProps, FocusableProps<T>, TextInputBase, ValueBase<string>, LabelableProps {}

export interface AriaTextFieldProps<T = HTMLInputElement> extends TextFieldProps<T>, AriaLabelingProps, FocusableDOMProps, TextInputDOMProps, AriaValidationProps {
  "aria-activedescendant"?: string;
  "aria-autocomplete"?: "none" | "inline" | "list" | "both";
  "aria-haspopup"?: boolean | "false" | "true" | "menu" | "listbox" | "tree" | "grid" | "dialog";
  "aria-controls"?: string;
  enterKeyHint?: "enter" | "done" | "go" | "next" | "previous" | "search" | "send";
}

interface SpectrumTextFieldBaseProps {
  icon?: VNodeChild | null;
  isQuiet?: boolean;
}

export interface SpectrumTextFieldProps extends SpectrumTextFieldBaseProps, SpectrumTextInputBase, Omit<AriaTextFieldProps, "isInvalid" | "validationState">, SpectrumFieldValidation<string>, SpectrumLabelableProps, StyleProps {}

export interface SpectrumTextAreaProps extends SpectrumTextFieldBaseProps, SpectrumTextInputBase, Omit<AriaTextFieldProps<HTMLTextAreaElement>, "isInvalid" | "validationState" | "type" | "pattern">, SpectrumFieldValidation<string>, SpectrumLabelableProps, StyleProps {}

export interface TextFieldRef<T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement> extends RefObject<HTMLDivElement> {
  select(): void;
  getInputElement(): T | null;
}
