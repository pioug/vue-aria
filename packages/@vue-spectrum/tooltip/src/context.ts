import type { PlacementAxis } from "@vue-aria/overlays";
import type { TooltipTriggerState } from "@vue-stately/tooltip";
import type { InjectionKey, Ref } from "vue";

export interface TooltipContextValue {
  state?: TooltipTriggerState;
  ref?: { current: HTMLElement | null };
  placement: PlacementAxis | null;
  arrowProps?: Record<string, unknown>;
  arrowRef?: { current: Element | null };
  tooltipProps?: Record<string, unknown>;
  UNSAFE_style?: Record<string, unknown>;
}

export const TooltipContext: InjectionKey<Ref<TooltipContextValue | null>> = Symbol("SpectrumTooltipContext");
