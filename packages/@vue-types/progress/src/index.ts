import type { AriaLabelingProps, DOMProps, LabelPosition, StyleProps } from "@vue-types/shared";

interface ProgressBaseProps {
  value?: number;
  minValue?: number;
  maxValue?: number;
}

export interface ProgressBarBaseProps extends ProgressBaseProps {
  label?: string | number | Record<string, unknown>;
  formatOptions?: Intl.NumberFormatOptions;
  valueLabel?: string | number | Record<string, unknown>;
}

export interface AriaProgressBarBaseProps extends ProgressBarBaseProps, DOMProps, AriaLabelingProps {}

export interface ProgressBarProps extends ProgressBarBaseProps {
  isIndeterminate?: boolean;
}

export interface AriaProgressBarProps extends ProgressBarProps, DOMProps, AriaLabelingProps {}

export interface ProgressCircleProps extends ProgressBaseProps {
  isIndeterminate?: boolean;
}

export interface AriaProgressCircleProps extends ProgressCircleProps, DOMProps, AriaLabelingProps {}

export interface SpectrumProgressCircleProps extends AriaProgressCircleProps, StyleProps {
  size?: "S" | "M" | "L";
  staticColor?: "white" | "black";
  variant?: "overBackground";
}

export interface SpectrumProgressBarBaseProps extends AriaProgressBarBaseProps, StyleProps {
  size?: "S" | "L";
  labelPosition?: LabelPosition;
  showValueLabel?: boolean;
}

export interface SpectrumProgressBarProps extends SpectrumProgressBarBaseProps, ProgressBarProps {
  staticColor?: "white" | "black";
  variant?: "overBackground";
}
