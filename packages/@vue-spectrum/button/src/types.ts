import type { AriaButtonOptions } from "@vue-aria/button";

export type SpectrumStaticColor = "white" | "black";
export type SpectrumValidationState = "valid" | "invalid";
export type SpectrumButtonVariant = "accent" | "primary" | "secondary" | "negative" | "cta" | "overBackground";
export type SpectrumButtonStyle = "fill" | "outline";
export type SpectrumLogicButtonVariant = "and" | "or";

export interface SpectrumBaseButtonProps extends AriaButtonOptions {
  autoFocus?: boolean;
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}

export interface SpectrumActionButtonProps extends SpectrumBaseButtonProps {
  isQuiet?: boolean;
  staticColor?: SpectrumStaticColor;
  holdAffordance?: boolean;
  hideButtonText?: boolean;
}

export interface SpectrumButtonProps extends SpectrumBaseButtonProps {
  variant?: SpectrumButtonVariant;
  style?: SpectrumButtonStyle;
  staticColor?: SpectrumStaticColor;
  isPending?: boolean;
}

export interface SpectrumLogicButtonProps extends SpectrumBaseButtonProps {
  variant?: SpectrumLogicButtonVariant;
}

export interface SpectrumToggleButtonProps extends SpectrumBaseButtonProps {
  isQuiet?: boolean;
  isEmphasized?: boolean;
  staticColor?: SpectrumStaticColor;
  isSelected?: boolean;
  defaultSelected?: boolean;
  onChange?: (isSelected: boolean) => void;
  isReadOnly?: boolean;
}

export interface SpectrumClearButtonProps extends SpectrumBaseButtonProps {
  focusClassName?: string;
  variant?: "overBackground";
  excludeFromTabOrder?: boolean;
  preventFocus?: boolean;
  inset?: boolean;
}

export interface SpectrumFieldButtonProps extends SpectrumBaseButtonProps {
  isQuiet?: boolean;
  isActive?: boolean;
  validationState?: SpectrumValidationState;
  isInvalid?: boolean;
  focusRingClass?: string;
}
