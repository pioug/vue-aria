import type { PositionProps } from "@vue-aria/overlays";
import type { AriaTooltipProps, TooltipTriggerProps as AriaTooltipTriggerProps } from "@vue-aria/tooltip";

export type SpectrumTooltipPlacement = "start" | "end" | "right" | "left" | "top" | "bottom";
export type SpectrumTooltipVariant = "neutral" | "positive" | "negative" | "info";

export interface SpectrumTooltipProps extends AriaTooltipProps {
  variant?: SpectrumTooltipVariant;
  placement?: SpectrumTooltipPlacement;
  isOpen?: boolean;
  showIcon?: boolean;
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}

export interface SpectrumTooltipTriggerProps extends Omit<AriaTooltipTriggerProps, "trigger">, PositionProps {
  trigger?: "hover" | "focus";
  offset?: number;
  crossOffset?: number;
}
