import { computed, toValue } from "vue";
import { useLabel } from "@vue-aria/label";
import { filterDOMProps } from "@vue-aria/utils";
import { mergeProps } from "@vue-aria/utils";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export interface UseProgressBarOptions {
  id?: MaybeReactive<string | undefined>;
  label?: MaybeReactive<string | undefined>;
  value?: MaybeReactive<number | undefined>;
  minValue?: MaybeReactive<number | undefined>;
  maxValue?: MaybeReactive<number | undefined>;
  valueLabel?: MaybeReactive<string | undefined>;
  isIndeterminate?: MaybeReactive<boolean | undefined>;
  formatOptions?: MaybeReactive<Intl.NumberFormatOptions | undefined>;
  "aria-label"?: MaybeReactive<string | undefined>;
  "aria-labelledby"?: MaybeReactive<string | undefined>;
  class?: MaybeReactive<string | undefined>;
  style?: MaybeReactive<Record<string, unknown> | string | undefined>;
  [key: string]: unknown;
}

export interface UseProgressBarResult {
  progressBarProps: ReadonlyRef<Record<string, unknown>>;
  labelProps: ReadonlyRef<Record<string, unknown>>;
}

export function useProgressBar(
  options: UseProgressBarOptions = {}
): UseProgressBarResult {
  const minValue = computed(() =>
    options.minValue === undefined ? 0 : (toValue(options.minValue) ?? 0)
  );
  const maxValue = computed(() =>
    options.maxValue === undefined ? 100 : (toValue(options.maxValue) ?? 100)
  );
  const value = computed(() => {
    const resolved = options.value === undefined ? 0 : (toValue(options.value) ?? 0);
    return clamp(resolved, minValue.value, maxValue.value);
  });
  const isIndeterminate = computed(() =>
    options.isIndeterminate === undefined
      ? false
      : Boolean(toValue(options.isIndeterminate))
  );
  const percentage = computed(() => {
    const denominator = maxValue.value - minValue.value;
    if (denominator <= 0) {
      return 0;
    }
    return (value.value - minValue.value) / denominator;
  });

  const formatter = computed(
    () =>
      new Intl.NumberFormat(
        undefined,
        options.formatOptions === undefined
          ? { style: "percent" }
          : toValue(options.formatOptions) ?? { style: "percent" }
      )
  );

  const valueLabel = computed<string | undefined>(() => {
    if (isIndeterminate.value) {
      return undefined;
    }

    if (options.valueLabel !== undefined) {
      return toValue(options.valueLabel) ?? undefined;
    }

    const formatOptions =
      options.formatOptions === undefined ? undefined : toValue(options.formatOptions);
    const valueToFormat =
      formatOptions?.style === "percent" || options.formatOptions === undefined
        ? percentage.value
        : value.value;
    return formatter.value.format(valueToFormat);
  });

  const { labelProps, fieldProps } = useLabel({
    id: options.id,
    label: options.label,
    labelElementType: "span",
    "aria-label": options["aria-label"],
    "aria-labelledby": options["aria-labelledby"],
  });

  const domProps = filterDOMProps(options as Record<string, unknown>);
  const progressBarProps = computed<Record<string, unknown>>(() =>
    mergeProps(domProps, fieldProps.value, {
      role: "progressbar",
      "aria-valuemin": minValue.value,
      "aria-valuemax": maxValue.value,
      "aria-valuenow": isIndeterminate.value ? undefined : value.value,
      "aria-valuetext": isIndeterminate.value ? undefined : valueLabel.value,
    })
  );

  return {
    progressBarProps,
    labelProps,
  };
}
