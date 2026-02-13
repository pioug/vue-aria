import { useProgressBar, type AriaProgressBarProps } from "@vue-aria/progress";

export interface MeterAria {
  meterProps: Record<string, unknown>;
  labelProps: Record<string, unknown>;
}

export function useMeter(props: AriaProgressBarProps): MeterAria {
  const { progressBarProps, labelProps } = useProgressBar(props);

  return {
    meterProps: {
      ...progressBarProps,
      role: "meter progressbar",
    },
    labelProps,
  };
}
