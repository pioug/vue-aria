import type { TooltipTriggerState } from "@vue-stately/tooltip";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { useHover } from "@vue-aria/interactions";

export interface AriaTooltipProps {
  [key: string]: unknown;
}

export interface TooltipAria {
  tooltipProps: Record<string, unknown>;
}

export function useTooltip(props: AriaTooltipProps, state?: TooltipTriggerState): TooltipAria {
  const domProps = filterDOMProps(props, { labelable: true });
  const { hoverProps } = useHover({
    onHoverStart: () => state?.open(true),
    onHoverEnd: () => state?.close(),
  });

  return {
    tooltipProps: mergeProps(domProps, hoverProps, {
      role: "tooltip",
    }),
  };
}
