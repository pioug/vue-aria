import { ref } from "vue";
import type { UseSliderState } from "../src/useSlider";
import type { UseSliderThumbState } from "../src/useSliderThumb";

interface CreateSliderStateOptions {
  defaultValue: number[];
  minValue?: number;
  maxValue?: number;
  step?: number;
  pageSize?: number;
  orientation?: "horizontal" | "vertical";
  isDisabled?: boolean;
  onChange?: (value: number[]) => void;
  onChangeEnd?: (value: number[]) => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundToStep(value: number, step: number): number {
  if (step <= 0) {
    return value;
  }
  const rounded = Math.round(value / step) * step;
  return Number(rounded.toFixed(6));
}

export function createSliderState(
  options: CreateSliderStateOptions
): (UseSliderState & UseSliderThumbState) & {
  valuesRef: ReturnType<typeof ref<number[]>>;
  focusedThumbRef: ReturnType<typeof ref<number | undefined>>;
} {
  const minValue = options.minValue ?? 0;
  const maxValue = options.maxValue ?? 100;
  const step = options.step ?? 1;
  const pageSize = options.pageSize ?? step * 10;

  const valuesRef = ref<number[]>([...options.defaultValue]);
  const defaultValues = ref<number[]>([...options.defaultValue]);
  const isDisabled = ref(Boolean(options.isDisabled));
  const orientation = ref(options.orientation ?? "horizontal");
  const stepRef = ref(step);
  const pageSizeRef = ref(pageSize);
  const focusedThumbRef = ref<number | undefined>(undefined);
  const draggingRef = ref<boolean[]>(valuesRef.value.map(() => false));
  const editableRef = ref<boolean[]>(valuesRef.value.map(() => true));

  const getThumbMinValue = (index: number): number =>
    index > 0 ? valuesRef.value[index - 1] : minValue;

  const getThumbMaxValue = (index: number): number =>
    index < valuesRef.value.length - 1 ? valuesRef.value[index + 1] : maxValue;

  const emitChange = () => {
    options.onChange?.([...valuesRef.value]);
  };

  const setThumbValue = (index: number, value: number): void => {
    const min = getThumbMinValue(index);
    const max = getThumbMaxValue(index);
    const nextValue = clamp(roundToStep(value, stepRef.value), min, max);
    valuesRef.value[index] = nextValue;
    emitChange();
  };

  const state: (UseSliderState & UseSliderThumbState) & {
    valuesRef: ReturnType<typeof ref<number[]>>;
    focusedThumbRef: ReturnType<typeof ref<number | undefined>>;
  } = {
    values: valuesRef,
    valuesRef,
    defaultValues,
    orientation,
    step: stepRef,
    pageSize: pageSizeRef,
    focusedThumb: focusedThumbRef,
    focusedThumbRef,
    isDisabled,
    isThumbDragging: (index) => draggingRef.value[index] ?? false,
    setThumbDragging: (index, isDragging) => {
      const wasDragging = draggingRef.value[index] ?? false;
      draggingRef.value[index] = isDragging;
      if (wasDragging && !isDragging) {
        options.onChangeEnd?.([...valuesRef.value]);
      }
    },
    getThumbPercent: (index) => {
      const denominator = maxValue - minValue;
      if (denominator <= 0) {
        return 0;
      }
      return (valuesRef.value[index] - minValue) / denominator;
    },
    setThumbPercent: (index, percent) => {
      const value = minValue + clamp(percent, 0, 1) * (maxValue - minValue);
      setThumbValue(index, value);
    },
    setThumbValue,
    getPercentValue: (percent) => minValue + clamp(percent, 0, 1) * (maxValue - minValue),
    setFocusedThumb: (index) => {
      focusedThumbRef.value = index;
    },
    getThumbValueLabel: (index) => String(valuesRef.value[index]),
    getThumbMinValue,
    getThumbMaxValue,
    decrementThumb: (index, amount) => {
      const stepAmount = amount ?? stepRef.value;
      setThumbValue(index, valuesRef.value[index] - stepAmount);
    },
    incrementThumb: (index, amount) => {
      const stepAmount = amount ?? stepRef.value;
      setThumbValue(index, valuesRef.value[index] + stepAmount);
    },
    setThumbEditable: (index, isEditable) => {
      editableRef.value[index] = isEditable;
    },
  };

  return state;
}
