import type { AriaProgressBarProps } from "@vue-aria/progress";

export type SpectrumMeterVariant = "informative" | "positive" | "warning" | "critical";
export type SpectrumMeterSize = "S" | "L";
export type SpectrumMeterLabelPosition = "top" | "side";

export interface SpectrumMeterProps extends AriaProgressBarProps {
  size?: SpectrumMeterSize;
  showValueLabel?: boolean;
  labelPosition?: SpectrumMeterLabelPosition;
  variant?: SpectrumMeterVariant;
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}
