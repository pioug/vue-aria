import { computed, ref, toValue, watchEffect } from "vue";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { UseSliderState } from "./useSlider";
import type { UseSliderThumbState } from "./useSliderThumb";

type Orientation = "horizontal" | "vertical";

export interface UseSliderStateOptions {
  value?: MaybeReactive<number[] | undefined>;
  defaultValue?: MaybeReactive<number[] | undefined>;
  minValue?: MaybeReactive<number | undefined>;
  maxValue?: MaybeReactive<number | undefined>;
  step?: MaybeReactive<number | undefined>;
  pageSize?: MaybeReactive<number | undefined>;
  orientation?: MaybeReactive<Orientation | undefined>;
  isDisabled?: MaybeReactive<boolean | undefined>;
  onChange?: (value: number[]) => void;
  onChangeEnd?: (value: number[]) => void;
}

export interface UseSliderStateResult extends UseSliderState, UseSliderThumbState {
  values: ReadonlyRef<number[]>;
  defaultValues: ReadonlyRef<number[]>;
  orientation: ReadonlyRef<Orientation>;
  step: ReadonlyRef<number>;
  pageSize: ReadonlyRef<number>;
  focusedThumb: ReadonlyRef<number | undefined>;
  isDisabled: ReadonlyRef<boolean>;
  isThumbEditable: (index: number) => boolean;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number): number {
  return Number(value.toFixed(6));
}

function resolveArray(value: number[] | undefined, fallback: number[]): number[] {
  if (!value || value.length === 0) {
    return [...fallback];
  }
  return [...value];
}

export function useSliderState(
  options: UseSliderStateOptions = {}
): UseSliderStateResult {
  const minValue = computed(() =>
    options.minValue === undefined ? 0 : (toValue(options.minValue) ?? 0)
  );
  const maxValue = computed(() =>
    options.maxValue === undefined ? 100 : (toValue(options.maxValue) ?? 100)
  );
  const step = computed(() => {
    const resolved = options.step === undefined ? undefined : toValue(options.step);
    return resolved && resolved > 0 ? resolved : 1;
  });
  const pageSize = computed(() => {
    const resolved =
      options.pageSize === undefined ? undefined : toValue(options.pageSize);
    if (resolved && resolved > 0) {
      return resolved;
    }

    const range = Math.abs(maxValue.value - minValue.value);
    if (range <= 0) {
      return step.value;
    }

    const rawPageSize = range / 10;
    const snappedPageSize = Math.round(rawPageSize / step.value) * step.value;
    if (snappedPageSize > 0) {
      return round(snappedPageSize);
    }

    return step.value;
  });
  const orientation = computed<Orientation>(() => {
    const resolved =
      options.orientation === undefined ? undefined : toValue(options.orientation);
    return resolved ?? "horizontal";
  });
  const isDisabled = computed(() =>
    options.isDisabled === undefined ? false : Boolean(toValue(options.isDisabled))
  );
  const isControlled = computed(() => options.value !== undefined);

  const roundToStep = (value: number): number => {
    const min = minValue.value;
    const max = maxValue.value;
    const stepValue = step.value;
    const clampedValue = clamp(value, min, max);
    const nearestStep = Math.round((clampedValue - min) / stepValue);
    let snapped = min + nearestStep * stepValue;

    if (snapped > max) {
      const maxSteps = Math.floor((max - min) / stepValue);
      snapped = min + maxSteps * stepValue;
    }

    return round(clamp(snapped, min, max));
  };

  const normalizeValues = (value: number[] | undefined): number[] => {
    const resolved = resolveArray(value, [minValue.value]);
    const normalized = resolved.map((entry) =>
      clamp(roundToStep(entry), minValue.value, maxValue.value)
    );

    for (let index = 1; index < normalized.length; index += 1) {
      normalized[index] = Math.max(normalized[index], normalized[index - 1]);
    }

    for (let index = normalized.length - 2; index >= 0; index -= 1) {
      normalized[index] = Math.min(normalized[index], normalized[index + 1]);
    }

    return normalized;
  };

  const initialValues = (() => {
    if (options.defaultValue !== undefined) {
      return normalizeValues(toValue(options.defaultValue));
    }
    if (options.value !== undefined) {
      return normalizeValues(toValue(options.value));
    }
    return normalizeValues(undefined);
  })();

  const uncontrolledValues = ref<number[]>([...initialValues]);
  const defaultValues = ref<number[]>([...initialValues]);
  const focusedThumb = ref<number | undefined>(undefined);
  const dragging = ref<boolean[]>([]);
  const editable = ref<boolean[]>([]);

  const values = computed<number[]>(() => {
    if (!isControlled.value) {
      return uncontrolledValues.value;
    }
    return normalizeValues(toValue(options.value));
  });

  watchEffect(() => {
    const count = values.value.length;
    while (dragging.value.length < count) {
      dragging.value.push(false);
    }
    while (editable.value.length < count) {
      editable.value.push(true);
    }
    if (dragging.value.length > count) {
      dragging.value.length = count;
    }
    if (editable.value.length > count) {
      editable.value.length = count;
    }
  });

  const updateValues = (nextValues: number[]) => {
    const normalized = normalizeValues(nextValues);
    if (!isControlled.value) {
      uncontrolledValues.value = normalized;
    }
    options.onChange?.(normalized);
  };

  const getThumbMinValue = (index: number): number => {
    if (index <= 0) {
      return minValue.value;
    }
    return values.value[index - 1];
  };

  const getThumbMaxValue = (index: number): number => {
    if (index >= values.value.length - 1) {
      return maxValue.value;
    }
    return values.value[index + 1];
  };

  const setThumbValue = (index: number, value: number) => {
    if (index < 0 || index >= values.value.length) {
      return;
    }

    const min = getThumbMinValue(index);
    const max = getThumbMaxValue(index);
    const nextValue = clamp(roundToStep(value), min, max);
    const nextValues = [...values.value];

    if (nextValues[index] === nextValue) {
      return;
    }

    nextValues[index] = nextValue;
    updateValues(nextValues);
  };

  const getPercentValue = (percent: number): number =>
    minValue.value + clamp(percent, 0, 1) * (maxValue.value - minValue.value);

  const getThumbPercent = (index: number): number => {
    const denominator = maxValue.value - minValue.value;
    if (denominator <= 0) {
      return 0;
    }

    const value = values.value[index];
    return clamp((value - minValue.value) / denominator, 0, 1);
  };

  const setThumbPercent = (index: number, percent: number) => {
    setThumbValue(index, getPercentValue(percent));
  };

  const decrementThumb = (index: number, amount = step.value) => {
    setThumbValue(index, values.value[index] - amount);
  };

  const incrementThumb = (index: number, amount = step.value) => {
    setThumbValue(index, values.value[index] + amount);
  };

  const setThumbDragging = (index: number, isDragging: boolean) => {
    const wasDragging = dragging.value[index] ?? false;
    dragging.value[index] = isDragging;

    if (wasDragging && !isDragging) {
      options.onChangeEnd?.([...values.value]);
    }
  };

  const setThumbEditable = (index: number, isEditable: boolean) => {
    editable.value[index] = isEditable;
  };

  return {
    values,
    defaultValues,
    orientation,
    step,
    pageSize,
    focusedThumb,
    isDisabled,
    setFocusedThumb: (index) => {
      focusedThumb.value = index;
    },
    isThumbDragging: (index) => dragging.value[index] ?? false,
    setThumbDragging,
    getThumbPercent,
    setThumbPercent,
    setThumbValue,
    getPercentValue,
    getThumbValueLabel: (index) => String(values.value[index]),
    getThumbMinValue,
    getThumbMaxValue,
    decrementThumb,
    incrementThumb,
    setThumbEditable,
    isThumbEditable: (index) =>
      !isDisabled.value && (editable.value[index] ?? true),
  };
}
