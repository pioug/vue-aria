import type { AriaProgressBarBaseProps, ProgressBarBaseProps, SpectrumProgressBarBaseProps } from "@vue-types/progress";

export type MeterProps = ProgressBarBaseProps;
export interface AriaMeterProps extends AriaProgressBarBaseProps {}
export interface SpectrumMeterProps extends SpectrumProgressBarBaseProps {
  variant?: "informative" | "positive" | "warning" | "critical";
}
