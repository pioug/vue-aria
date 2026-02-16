import { clamp, snapValueToStep, useControlledState } from "@vue-stately/utils";
import { computed, ref, watch } from "vue";

export interface SliderState {
  values: number[];
  defaultValues: number[];
  getThumbValue: (index: number) => number;
  setThumbValue: (index: number, value: number) => void;
  setThumbPercent: (index: number, percent: number) => void;
  isThumbDragging: (index: number) => boolean;
  setThumbDragging: (index: number, dragging: boolean) => void;
  focusedThumb: number | undefined;
  setFocusedThumb: (index: number | undefined) => void;
  getThumbPercent: (index: number) => number;
  getValuePercent: (value: number) => number;
  getThumbValueLabel: (index: number) => string;
  getFormattedValue: (value: number) => string;
  getThumbMinValue: (index: number) => number;
  getThumbMaxValue: (index: number) => number;
  getPercentValue: (percent: number) => number;
  isThumbEditable: (index: number) => boolean;
  setThumbEditable: (index: number, editable: boolean) => void;
  incrementThumb: (index: number, stepSize?: number) => void;
  decrementThumb: (index: number, stepSize?: number) => void;
  step: number;
  pageSize: number;
  orientation: "horizontal" | "vertical";
  isDisabled: boolean;
}

const DEFAULT_MIN_VALUE = 0;
const DEFAULT_MAX_VALUE = 100;
const DEFAULT_STEP_VALUE = 1;

export interface SliderStateOptions<T> {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  onChangeEnd?: (value: T) => void;
  minValue?: number;
  maxValue?: number;
  step?: number;
  orientation?: "horizontal" | "vertical";
  isDisabled?: boolean;
  numberFormatter: Intl.NumberFormat;
}

function replaceIndex<T>(array: T[], index: number, value: T): T[] {
  if (array[index] === value) {
    return array;
  }

  return [...array.slice(0, index), value, ...array.slice(index + 1)];
}

function convertValue(value?: number | number[]): number[] | undefined {
  if (value == null) {
    return undefined;
  }

  return Array.isArray(value) ? value : [value];
}

function createOnChange(
  value: number | number[] | undefined,
  defaultValue: number | number[] | undefined,
  onChange: ((nextValue: number | number[]) => void) | undefined
) {
  return (newValue: number[]) => {
    if (typeof value === "number" || typeof defaultValue === "number") {
      onChange?.(newValue[0]);
    } else {
      onChange?.(newValue);
    }
  };
}

export function useSliderState<T extends number | number[]>(
  props: SliderStateOptions<T>
): SliderState {
  const {
    isDisabled = false,
    minValue = DEFAULT_MIN_VALUE,
    maxValue = DEFAULT_MAX_VALUE,
    numberFormatter,
    step = DEFAULT_STEP_VALUE,
    orientation = "horizontal",
  } = props;

  const pageSize = computed(() => {
    let calcPageSize = (maxValue - minValue) / 10;
    calcPageSize = snapValueToStep(calcPageSize, 0, calcPageSize + step, step);
    return Math.max(calcPageSize, step);
  });

  const restrictValues = (values: number[] | undefined): number[] | undefined =>
    values?.map((value, index) => {
      const min = index === 0 ? minValue : values[index - 1];
      const max = index === values.length - 1 ? maxValue : values[index + 1];
      return snapValueToStep(value, min, max, step);
    });

  const controlledValue = computed(() =>
    restrictValues(convertValue(props.value as number | number[] | undefined))
  );
  const defaultValue = computed(
    () =>
      restrictValues(
        convertValue(props.defaultValue as number | number[] | undefined) ?? [minValue]
      )!
  );
  const onChange = createOnChange(
    props.value as number | number[] | undefined,
    props.defaultValue as number | number[] | undefined,
    props.onChange as ((nextValue: number | number[]) => void) | undefined
  );
  const onChangeEnd = createOnChange(
    props.value as number | number[] | undefined,
    props.defaultValue as number | number[] | undefined,
    props.onChangeEnd as ((nextValue: number | number[]) => void) | undefined
  );

  const [valuesState, setValuesState] = useControlledState<number[]>(
    () => controlledValue.value,
    () => defaultValue.value,
    onChange
  );

  const valuesRef = ref<number[]>(valuesState.value);
  const initialValues = [...valuesState.value];
  const isDraggingsRef = ref<boolean[]>(new Array(valuesState.value.length).fill(false));
  const isEditablesRef = ref<boolean[]>(new Array(valuesState.value.length).fill(true));
  const focusedIndexRef = ref<number | undefined>(undefined);

  const setValues = (values: number[]) => {
    valuesRef.value = values;
    setValuesState(values);
  };

  const setDraggings = (draggings: boolean[]) => {
    isDraggingsRef.value = draggings;
  };

  watch(
    () => valuesState.value,
    (next) => {
      valuesRef.value = next;
    }
  );

  watch(
    () => valuesState.value.length,
    (length) => {
      if (isDraggingsRef.value.length !== length) {
        const nextDraggings = Array.from({ length }, (_, index) => Boolean(isDraggingsRef.value[index]));
        setDraggings(nextDraggings);
      }

      if (isEditablesRef.value.length !== length) {
        isEditablesRef.value = Array.from(
          { length },
          (_, index) => isEditablesRef.value[index] ?? true
        );
      }

      if (focusedIndexRef.value != null && focusedIndexRef.value >= length) {
        focusedIndexRef.value = undefined;
      }
    }
  );

  const getValuePercent = (value: number) => (value - minValue) / (maxValue - minValue);

  const getThumbMinValue = (index: number) =>
    index === 0 ? minValue : valuesRef.value[index - 1];

  const getThumbMaxValue = (index: number) =>
    index === valuesRef.value.length - 1 ? maxValue : valuesRef.value[index + 1];

  const isThumbEditable = (index: number) => isEditablesRef.value[index];

  const setThumbEditable = (index: number, editable: boolean) => {
    isEditablesRef.value[index] = editable;
  };

  const updateValue = (index: number, value: number) => {
    if (isDisabled || !isThumbEditable(index)) {
      return;
    }

    const currentValues = valuesRef.value;
    const thisMin = index === 0 ? minValue : currentValues[index - 1];
    const thisMax = index === currentValues.length - 1 ? maxValue : currentValues[index + 1];
    const snapped = snapValueToStep(value, thisMin, thisMax, step);
    const newValues = replaceIndex(currentValues, index, snapped);
    setValues(newValues);
  };

  const updateDragging = (index: number, dragging: boolean) => {
    if (isDisabled || !isThumbEditable(index)) {
      return;
    }

    if (dragging) {
      valuesRef.value = valuesState.value;
    }

    const wasDragging = isDraggingsRef.value[index];
    const nextDraggings = replaceIndex(isDraggingsRef.value, index, dragging);
    setDraggings(nextDraggings);

    if (onChangeEnd && wasDragging && !nextDraggings.some(Boolean)) {
      onChangeEnd(valuesRef.value);
    }
  };

  const getFormattedValue = (value: number) => numberFormatter.format(value);

  const getRoundedValue = (value: number) =>
    Math.round((value - minValue) / step) * step + minValue;

  const getPercentValue = (percent: number) => {
    const value = percent * (maxValue - minValue) + minValue;
    return clamp(getRoundedValue(value), minValue, maxValue);
  };

  const setThumbPercent = (index: number, percent: number) => {
    updateValue(index, getPercentValue(percent));
  };

  const incrementThumb = (index: number, stepSize = 1) => {
    const size = Math.max(stepSize, step);
    updateValue(index, snapValueToStep(valuesRef.value[index] + size, minValue, maxValue, step));
  };

  const decrementThumb = (index: number, stepSize = 1) => {
    const size = Math.max(stepSize, step);
    updateValue(index, snapValueToStep(valuesRef.value[index] - size, minValue, maxValue, step));
  };

  return {
    get values() {
      return valuesState.value;
    },
    defaultValues: props.defaultValue !== undefined ? defaultValue.value : initialValues,
    getThumbValue: (index) => valuesState.value[index],
    setThumbValue: updateValue,
    setThumbPercent,
    isThumbDragging: (index) => Boolean(isDraggingsRef.value[index]),
    setThumbDragging: updateDragging,
    get focusedThumb() {
      return focusedIndexRef.value;
    },
    setFocusedThumb: (index) => {
      focusedIndexRef.value = index;
    },
    getThumbPercent: (index) => getValuePercent(valuesState.value[index]),
    getValuePercent,
    getThumbValueLabel: (index) => getFormattedValue(valuesState.value[index]),
    getFormattedValue,
    getThumbMinValue,
    getThumbMaxValue,
    getPercentValue,
    isThumbEditable,
    setThumbEditable,
    incrementThumb,
    decrementThumb,
    step,
    get pageSize() {
      return pageSize.value;
    },
    orientation,
    isDisabled,
  };
}
