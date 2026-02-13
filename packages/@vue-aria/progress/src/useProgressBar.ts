import { clamp, filterDOMProps, mergeProps } from "@vue-aria/utils";
import { useLabel } from "@vue-aria/label";
import { useNumberFormatter } from "@vue-aria/i18n";

export interface AriaProgressBarProps {
  value?: number;
  minValue?: number;
  maxValue?: number;
  valueLabel?: string;
  isIndeterminate?: boolean;
  formatOptions?: Intl.NumberFormatOptions;
  label?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  [key: string]: unknown;
}

export interface ProgressBarAria {
  progressBarProps: Record<string, unknown>;
  labelProps: Record<string, unknown>;
}

export function useProgressBar(props: AriaProgressBarProps): ProgressBarAria {
  let {
    value = 0,
    minValue = 0,
    maxValue = 100,
    valueLabel,
    isIndeterminate,
    formatOptions = {
      style: "percent",
    },
  } = props;

  const domProps = filterDOMProps(props, { labelable: true });
  const { labelProps, fieldProps } = useLabel({
    ...props,
    labelElementType: "span",
  });

  value = clamp(value, minValue, maxValue);
  const percentage = (value - minValue) / (maxValue - minValue);
  const formatter = useNumberFormatter(formatOptions);

  if (!isIndeterminate && !valueLabel) {
    const valueToFormat = formatOptions.style === "percent" ? percentage : value;
    valueLabel = formatter.format(valueToFormat);
  }

  return {
    progressBarProps: mergeProps(domProps, {
      ...fieldProps,
      "aria-valuenow": isIndeterminate ? undefined : value,
      "aria-valuemin": minValue,
      "aria-valuemax": maxValue,
      "aria-valuetext": isIndeterminate ? undefined : valueLabel,
      role: "progressbar",
    }),
    labelProps,
  };
}
