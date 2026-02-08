import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import { useHover } from "@vue-aria/interactions";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { computed } from "vue";

export interface TooltipTriggerStateLike {
  isOpen: ReadonlyRef<boolean>;
  open: (immediate?: boolean) => void;
  close: (immediate?: boolean) => void;
}

export interface UseTooltipOptions {
  "aria-label"?: MaybeReactive<string | undefined>;
  "aria-labelledby"?: MaybeReactive<string | undefined>;
}

export interface UseTooltipResult {
  tooltipProps: ReadonlyRef<Record<string, unknown>>;
}

export function useTooltip(
  options: UseTooltipOptions,
  state?: TooltipTriggerStateLike
): UseTooltipResult {
  const domProps = filterDOMProps(options as unknown as Record<string, unknown>, {
    labelable: true,
  });

  const { hoverProps } = useHover({
    onHoverStart: () => {
      state?.open(true);
    },
    onHoverEnd: () => {
      state?.close();
    },
  });

  return {
    tooltipProps: computed(() =>
      mergeProps(domProps, hoverProps, {
        role: "tooltip",
      })
    ),
  };
}

export type {
  UseTooltipTriggerOptions,
  UseTooltipTriggerResult,
} from "./useTooltipTrigger";
