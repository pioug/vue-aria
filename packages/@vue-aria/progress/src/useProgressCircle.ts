import { useProgressBar, type UseProgressBarOptions } from "./useProgressBar";
import type { ReadonlyRef } from "@vue-aria/types";

export interface UseProgressCircleResult {
  progressCircleProps: ReadonlyRef<Record<string, unknown>>;
  labelProps: ReadonlyRef<Record<string, unknown>>;
}

export function useProgressCircle(
  options: UseProgressBarOptions = {}
): UseProgressCircleResult {
  const { progressBarProps, labelProps } = useProgressBar(options);

  return {
    progressCircleProps: progressBarProps,
    labelProps,
  };
}
