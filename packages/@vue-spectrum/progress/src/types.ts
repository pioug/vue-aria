export type ProgressBarSize = "S" | "L";
export type ProgressCircleSize = "S" | "M" | "L";
export type ProgressBarLabelPosition = "top" | "side";
export type StaticColor = "white" | "black";
export type ProgressVariant = "overBackground";

export interface ProgressBaseProps {
  value?: number | undefined;
  minValue?: number | undefined;
  maxValue?: number | undefined;
}

export interface ProgressBarBaseProps extends ProgressBaseProps {
  label?: string | undefined;
  formatOptions?: Intl.NumberFormatOptions | undefined;
  valueLabel?: string | undefined;
}

export interface SpectrumProgressBarBaseProps extends ProgressBarBaseProps {
  size?: ProgressBarSize | undefined;
  labelPosition?: ProgressBarLabelPosition | undefined;
  showValueLabel?: boolean | undefined;
  isIndeterminate?: boolean | undefined;
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export interface SpectrumProgressBarProps extends SpectrumProgressBarBaseProps {
  staticColor?: StaticColor | undefined;
  variant?: ProgressVariant | undefined;
}

export interface SpectrumProgressCircleProps extends ProgressBaseProps {
  isIndeterminate?: boolean | undefined;
  size?: ProgressCircleSize | undefined;
  staticColor?: StaticColor | undefined;
  variant?: ProgressVariant | undefined;
  formatOptions?: Intl.NumberFormatOptions | undefined;
  valueLabel?: string | undefined;
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}
