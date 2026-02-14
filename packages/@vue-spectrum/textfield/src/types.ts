import type { AriaTextFieldOptions } from "@vue-aria/textfield";

export interface SpectrumTextFieldBaseProps {
  label?: string;
  description?: string;
  errorMessage?: string;
  isDisabled?: boolean;
  isQuiet?: boolean;
  validationState?: "valid" | "invalid";
  isInvalid?: boolean;
  validationErrors?: string[];
  multiLine?: boolean;
  icon?: unknown;
  inputClassName?: string;
  validationIconClassName?: string;
  wrapperChildren?: unknown;
  inputProps: Record<string, unknown>;
  labelProps?: Record<string, unknown>;
  descriptionProps?: Record<string, unknown>;
  errorMessageProps?: Record<string, unknown>;
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}

export interface SpectrumTextFieldProps extends AriaTextFieldOptions {
  isQuiet?: boolean;
  icon?: unknown;
  excludeFromTabOrder?: boolean;
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}

export interface SpectrumTextAreaProps extends SpectrumTextFieldProps {
  height?: string | number;
}
