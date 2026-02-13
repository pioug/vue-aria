import { NumberFormatter } from "@internationalized/number";
import { clamp, snapValueToStep, useControlledState } from "@vue-aria/utils-state";
import { computed, ref, watch } from "vue";

export interface ValidationResult {
  isInvalid: boolean;
  validationErrors: string[];
  validationDetails: ValidityState | null;
}

export interface NumberFieldState {
  inputValue: string;
  numberValue: number;
  defaultNumberValue: number;
  minValue?: number;
  maxValue?: number;
  canIncrement: boolean;
  canDecrement: boolean;
  validate: (value: string) => boolean;
  setInputValue: (val: string) => void;
  setNumberValue: (val: number) => void;
  commit: (value?: string) => void;
  increment: () => void;
  decrement: () => void;
  incrementToMax: () => void;
  decrementToMin: () => void;
  displayValidation: ValidationResult;
  realtimeValidation: ValidationResult;
  updateValidation: (_validation: ValidationResult) => void;
  resetValidation: () => void;
  commitValidation: () => void;
}

export interface NumberFieldStateOptions {
  minValue?: number;
  maxValue?: number;
  step?: number;
  formatOptions?: Intl.NumberFormatOptions;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  locale: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
}

function handleDecimalOperation(operator: "-" | "+", value1: number, value2: number): number {
  let result = operator === "+" ? value1 + value2 : value1 - value2;

  if (value1 % 1 !== 0 || value2 % 1 !== 0) {
    const value1DecimalLength = value1.toString().split(".")[1]?.length ?? 0;
    const value2DecimalLength = value2.toString().split(".")[1]?.length ?? 0;
    const multiplier = Math.pow(10, Math.max(value1DecimalLength, value2DecimalLength));
    const normalizedValue1 = Math.round(value1 * multiplier);
    const normalizedValue2 = Math.round(value2 * multiplier);
    result = operator === "+" ? normalizedValue1 + normalizedValue2 : normalizedValue1 - normalizedValue2;
    result /= multiplier;
  }

  return result;
}

export function useNumberFieldState(props: NumberFieldStateOptions): NumberFieldState {
  const {
    minValue,
    maxValue,
    step,
    formatOptions,
    locale,
    isDisabled,
    isReadOnly,
    onChange,
  } = props;
  let { value, defaultValue = Number.NaN } = props;

  if (value === null) {
    value = Number.NaN;
  }

  if (value !== undefined && !Number.isNaN(value)) {
    value = step !== undefined && !Number.isNaN(step)
      ? snapValueToStep(value, minValue, maxValue, step)
      : clamp(value, minValue, maxValue);
  }

  if (!Number.isNaN(defaultValue)) {
    defaultValue = step !== undefined && !Number.isNaN(step)
      ? snapValueToStep(defaultValue, minValue, maxValue, step)
      : clamp(defaultValue, minValue, maxValue);
  }

  const [controlledValue, setControlledValue] = useControlledState<number, number>(
    () => value,
    Number.isNaN(defaultValue) ? Number.NaN : defaultValue,
    onChange
  );
  const initialValue = controlledValue.value;
  const inputValueRef = ref(
    Number.isNaN(controlledValue.value)
      ? ""
      : new NumberFormatter(locale, formatOptions).format(controlledValue.value)
  );

  const parseNumber = (raw: string): number => {
    const normalized = raw.replace(/[^\d+.,-]/g, "").replace(/,/g, ".");
    if (!normalized.length || normalized === "-" || normalized === "+" || normalized === ".") {
      return Number.NaN;
    }
    return Number(normalized);
  };
  const formatter = computed(() => new NumberFormatter(locale, { ...formatOptions }));
  const intlOptions = computed(() => formatter.value.resolvedOptions());
  const format = (nextValue: number) => (Number.isNaN(nextValue) ? "" : formatter.value.format(nextValue));

  watch(
    () => controlledValue.value,
    (next) => {
      inputValueRef.value = format(next);
    }
  );

  const parsedValue = computed(() => parseNumber(inputValueRef.value));
  let clampStep = step !== undefined && !Number.isNaN(step) ? step : 1;
  if (intlOptions.value.style === "percent" && (step === undefined || Number.isNaN(step))) {
    clampStep = 0.01;
  }

  const commitValidation = () => {};
  const commit = (overrideValue?: string) => {
    const newInputValue = overrideValue === undefined ? inputValueRef.value : overrideValue;
    let newParsedValue = parsedValue.value;
    if (overrideValue !== undefined) {
      newParsedValue = parseNumber(newInputValue);
    }

    if (!newInputValue.length) {
      setControlledValue(Number.NaN);
      inputValueRef.value = value === undefined ? "" : format(controlledValue.value);
      return;
    }

    if (Number.isNaN(newParsedValue)) {
      inputValueRef.value = format(controlledValue.value);
      return;
    }

    let clampedValue = step === undefined || Number.isNaN(step)
      ? clamp(newParsedValue, minValue, maxValue)
      : snapValueToStep(newParsedValue, minValue, maxValue, step);
    clampedValue = parseNumber(format(clampedValue));
    setControlledValue(clampedValue);
    inputValueRef.value = format(value === undefined ? clampedValue : controlledValue.value);
    commitValidation();
  };

  const safeNextStep = (operation: "+" | "-", minMax = 0) => {
    const prev = parsedValue.value;
    if (Number.isNaN(prev)) {
      const newValue = Number.isNaN(minMax) ? 0 : minMax;
      return snapValueToStep(newValue, minValue, maxValue, clampStep);
    }

    const newValue = snapValueToStep(prev, minValue, maxValue, clampStep);
    if ((operation === "+" && newValue > prev) || (operation === "-" && newValue < prev)) {
      return newValue;
    }

    return snapValueToStep(
      handleDecimalOperation(operation, prev, clampStep),
      minValue,
      maxValue,
      clampStep
    );
  };

  const increment = () => {
    const newValue = safeNextStep("+", minValue);
    inputValueRef.value = format(newValue);
    setControlledValue(newValue);
    commitValidation();
  };

  const decrement = () => {
    const newValue = safeNextStep("-", maxValue);
    inputValueRef.value = format(newValue);
    setControlledValue(newValue);
    commitValidation();
  };

  const incrementToMax = () => {
    if (maxValue != null) {
      setControlledValue(snapValueToStep(maxValue, minValue, maxValue, clampStep));
      commitValidation();
    }
  };

  const decrementToMin = () => {
    if (minValue != null) {
      setControlledValue(minValue);
      commitValidation();
    }
  };

  const canIncrement = computed(
    () =>
      !isDisabled &&
      !isReadOnly &&
      (Number.isNaN(parsedValue.value) ||
        maxValue === undefined ||
        Number.isNaN(maxValue) ||
        snapValueToStep(parsedValue.value, minValue, maxValue, clampStep) > parsedValue.value ||
        handleDecimalOperation("+", parsedValue.value, clampStep) <= maxValue)
  );

  const canDecrement = computed(
    () =>
      !isDisabled &&
      !isReadOnly &&
      (Number.isNaN(parsedValue.value) ||
        minValue === undefined ||
        Number.isNaN(minValue) ||
        snapValueToStep(parsedValue.value, minValue, maxValue, clampStep) < parsedValue.value ||
        handleDecimalOperation("-", parsedValue.value, clampStep) >= minValue)
  );

  const validate = (nextValue: string) => {
    if (!/^[+-]?\d*([.,]\d*)?$/.test(nextValue)) {
      return false;
    }

    const parsed = parseNumber(nextValue);
    if (Number.isNaN(parsed)) {
      return true;
    }

    if (minValue !== undefined && !Number.isNaN(minValue) && parsed < minValue) {
      return false;
    }

    if (maxValue !== undefined && !Number.isNaN(maxValue) && parsed > maxValue) {
      return false;
    }

    return true;
  };

  const updateValidation = () => {};
  const resetValidation = () => {};
  const validation = {
    isInvalid: false,
    validationErrors: [],
    validationDetails: null,
  };

  return {
    validate,
    increment,
    incrementToMax,
    decrement,
    decrementToMin,
    canIncrement: canIncrement.value,
    canDecrement: canDecrement.value,
    minValue,
    maxValue,
    numberValue: parsedValue.value,
    defaultNumberValue: Number.isNaN(defaultValue) ? initialValue : defaultValue,
    setNumberValue: setControlledValue,
    setInputValue: (next) => {
      inputValueRef.value = next;
    },
    inputValue: inputValueRef.value,
    commit,
    displayValidation: validation,
    realtimeValidation: validation,
    updateValidation,
    resetValidation,
    commitValidation,
  };
}
