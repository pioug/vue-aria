import type { AriaTextFieldProps, SpectrumTextFieldProps, TextFieldProps } from "@vue-types/textfield";
import type { SpectrumTextInputBase } from "@vue-types/shared";

export interface SearchFieldProps extends TextFieldProps {
  onSubmit?: (value: string) => void;
  onClear?: () => void;
}

export interface AriaSearchFieldProps extends SearchFieldProps, Omit<AriaTextFieldProps, "type"> {
  enterKeyHint?: "enter" | "done" | "go" | "next" | "previous" | "search" | "send";
  type?: "text" | "search" | "url" | "tel" | "email" | "password" | (string & {});
}

export interface SpectrumSearchFieldProps extends SpectrumTextInputBase, Omit<AriaSearchFieldProps, "isInvalid" | "validationState">, SpectrumTextFieldProps {}
