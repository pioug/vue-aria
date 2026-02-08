import { computed } from "vue";
import {
  useProgressBar,
  type UseProgressBarOptions,
} from "@vue-aria/progress";
import type { ReadonlyRef } from "@vue-aria/types";

export interface UseMeterOptions extends UseProgressBarOptions {}

export interface UseMeterResult {
  meterProps: ReadonlyRef<Record<string, unknown>>;
  labelProps: ReadonlyRef<Record<string, unknown>>;
}

export function useMeter(options: UseMeterOptions = {}): UseMeterResult {
  const { progressBarProps, labelProps } = useProgressBar(options);

  const meterProps = computed<Record<string, unknown>>(() => ({
    ...progressBarProps.value,
    role: "meter progressbar",
  }));

  return {
    meterProps,
    labelProps,
  };
}
