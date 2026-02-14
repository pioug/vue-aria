import type { AriaProgressBarProps } from "@vue-aria/progress";

export type SpectrumStaticColor = "white" | "black";
export type SpectrumProgressVariant = "overBackground";
export type SpectrumProgressSize = "S" | "L";
export type SpectrumCircleSize = "S" | "M" | "L";
export type SpectrumLabelPosition = "top" | "side";

export interface SpectrumProgressBarBaseProps extends AriaProgressBarProps {
  size?: SpectrumProgressSize;
  showValueLabel?: boolean;
  labelPosition?: SpectrumLabelPosition;
  staticColor?: SpectrumStaticColor;
  variant?: SpectrumProgressVariant;
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}

export interface SpectrumProgressBarProps extends SpectrumProgressBarBaseProps {}

export interface SpectrumProgressCircleProps extends AriaProgressBarProps {
  size?: SpectrumCircleSize;
  staticColor?: SpectrumStaticColor;
  variant?: SpectrumProgressVariant;
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}
