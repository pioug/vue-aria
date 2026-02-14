import type { AriaButtonOptions } from "@vue-aria/button";
import type { AriaNumberFieldProps } from "@vue-aria/numberfield";

export interface SpectrumNumberFieldProps extends AriaNumberFieldProps {
  isQuiet?: boolean;
  hideStepper?: boolean;
  validationState?: "valid" | "invalid";
  isInvalid?: boolean;
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}

export interface SpectrumStepButtonProps extends AriaButtonOptions {
  direction: "up" | "down";
  isQuiet?: boolean;
}
