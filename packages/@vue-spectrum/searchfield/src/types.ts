import type { AriaSearchFieldProps } from "@vue-aria/searchfield";
import type { SearchFieldProps } from "@vue-aria/searchfield-state";

export interface SpectrumSearchFieldProps extends AriaSearchFieldProps, SearchFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string;
  isQuiet?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  validationState?: "valid" | "invalid";
  isInvalid?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  excludeFromTabOrder?: boolean;
  icon?: unknown;
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}
