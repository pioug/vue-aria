import type { VNodeChild } from "vue";

import type { DOMProps, AriaLabelingProps, StyleProps } from "@vue-types/shared";
import type { OverlayTriggerProps, Placement, PositionProps } from "@vue-types/overlays";

export interface TooltipTriggerProps extends OverlayTriggerProps {
  isDisabled?: boolean;
  delay?: number;
  closeDelay?: number;
  trigger?: "hover" | "focus";
  shouldCloseOnPress?: boolean;
}

export interface SpectrumTooltipTriggerProps extends Omit<TooltipTriggerProps, "closeDelay">, PositionProps {
  children: [VNodeChild, VNodeChild];
  offset?: number;
  placement?: Placement;
}

export interface TooltipProps {
  isOpen?: boolean;
}

export interface AriaTooltipProps extends TooltipProps, DOMProps, AriaLabelingProps {}

export interface SpectrumTooltipProps extends AriaTooltipProps, StyleProps {
  variant?: "neutral" | "positive" | "negative" | "info";
  placement?: "start" | "end" | "right" | "left" | "top" | "bottom";
  showIcon?: boolean;
  children: VNodeChild;
}
