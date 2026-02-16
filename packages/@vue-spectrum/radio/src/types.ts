import type { AriaRadioGroupProps, AriaRadioProps } from "@vue-aria/radio";
import type { RadioGroupProps } from "@vue-stately/radio";

export interface SpectrumRadioProps extends AriaRadioProps {
  autoFocus?: boolean;
  isDisabled?: boolean;
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}

export interface SpectrumRadioGroupProps extends AriaRadioGroupProps, RadioGroupProps {
  isEmphasized?: boolean;
  orientation?: "horizontal" | "vertical";
  label?: string;
  children?: unknown;
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}
