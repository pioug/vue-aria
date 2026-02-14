import type { AriaCheckboxGroupProps, AriaCheckboxProps } from "@vue-aria/checkbox";
import type { CheckboxGroupProps } from "@vue-aria/checkbox-state";

export interface SpectrumCheckboxProps extends AriaCheckboxProps {
  isEmphasized?: boolean;
  autoFocus?: boolean;
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}

export interface SpectrumCheckboxGroupProps extends AriaCheckboxGroupProps, CheckboxGroupProps {
  label?: string;
  orientation?: "vertical" | "horizontal";
  children?: unknown;
  isEmphasized?: boolean;
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}
