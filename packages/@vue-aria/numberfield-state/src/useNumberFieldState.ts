import { NumberFormatter, NumberParser } from "@internationalized/number";
import { useFormValidationState, type ValidationResult } from "@vue-aria/form-state";
import { clamp, snapValueToStep, useControlledState } from "@vue-aria/utils-state";
import { computed, ref, watch } from "vue";

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
  value?: number | null;
  defaultValue?: number | null;
  onChange?: (value: number) => void;
  locale: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isInvalid?: boolean;
  validationState?: "valid" | "invalid";
  validationBehavior?: "aria" | "native";
  name?: string | string[];
  validate?: (value: number) => boolean | string | string[] | null | undefined;
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
  const normalizeControlledValue = (nextValue: number | null | undefined): number | undefined => {
    if (nextValue === null) {
      return Number.NaN;
    }

    if (nextValue !== undefined && !Number.isNaN(nextValue)) {
      return step !== undefined && !Number.isNaN(step)
        ? snapValueToStep(nextValue, minValue, maxValue, step)
        : clamp(nextValue, minValue, maxValue);
    }

    return nextValue as number | undefined;
  };

  let defaultValue = props.defaultValue ?? Number.NaN;

  if (!Number.isNaN(defaultValue)) {
    defaultValue = step !== undefined && !Number.isNaN(step)
      ? snapValueToStep(defaultValue, minValue, maxValue, step)
      : clamp(defaultValue, minValue, maxValue);
  }

  const controlledValueFromProps = computed(() =>
    normalizeControlledValue(props.value as number | null | undefined)
  );
  const isControlled = computed(() => controlledValueFromProps.value !== undefined);

  const [controlledValue, setControlledValue] = useControlledState<number, number>(
    () => controlledValueFromProps.value,
    Number.isNaN(defaultValue) ? Number.NaN : defaultValue,
    onChange
  );
  const initialValue = controlledValue.value;
  const inputValueRef = ref(
    Number.isNaN(controlledValue.value)
      ? ""
      : new NumberFormatter(locale, formatOptions).format(controlledValue.value)
  );

  const numberParser = computed(() => new NumberParser(locale, formatOptions));
  const numberingSystem = computed(() => numberParser.value.getNumberingSystem(inputValueRef.value));
  const formatter = computed(
    () => new NumberFormatter(locale, { ...formatOptions, numberingSystem: numberingSystem.value })
  );
  const intlOptions = computed(() => formatter.value.resolvedOptions());
  const format = (nextValue: number) => (Number.isNaN(nextValue) ? "" : formatter.value.format(nextValue));
  const validation = useFormValidationState<number>({
    ...props,
    value: () => controlledValue.value,
  });

  watch(
    () => controlledValue.value,
    (next) => {
      inputValueRef.value = format(next);
    }
  );

  const parsedValue = computed(() => numberParser.value.parse(inputValueRef.value));
  let clampStep = step !== undefined && !Number.isNaN(step) ? step : 1;
  if (intlOptions.value.style === "percent" && (step === undefined || Number.isNaN(step))) {
    clampStep = 0.01;
  }

  const commit = (overrideValue?: string) => {
    const newInputValue = overrideValue === undefined ? inputValueRef.value : overrideValue;
    let newParsedValue = parsedValue.value;
    if (overrideValue !== undefined) {
      newParsedValue = numberParser.value.parse(newInputValue);
    }

    if (!newInputValue.length) {
      setControlledValue(Number.NaN);
      inputValueRef.value = !isControlled.value ? "" : format(controlledValue.value);
      return;
    }

    if (Number.isNaN(newParsedValue)) {
      inputValueRef.value = format(controlledValue.value);
      return;
    }

    let clampedValue = step === undefined || Number.isNaN(step)
      ? clamp(newParsedValue, minValue, maxValue)
      : snapValueToStep(newParsedValue, minValue, maxValue, step);
    clampedValue = numberParser.value.parse(format(clampedValue));
    setControlledValue(clampedValue);
    inputValueRef.value = format(!isControlled.value ? clampedValue : controlledValue.value);
    validation.commitValidation();
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
    validation.commitValidation();
  };

  const decrement = () => {
    const newValue = safeNextStep("-", maxValue);
    inputValueRef.value = format(newValue);
    setControlledValue(newValue);
    validation.commitValidation();
  };

  const incrementToMax = () => {
    if (maxValue != null) {
      setControlledValue(snapValueToStep(maxValue, minValue, maxValue, clampStep));
      validation.commitValidation();
    }
  };

  const decrementToMin = () => {
    if (minValue != null) {
      setControlledValue(minValue);
      validation.commitValidation();
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

  const validate = (nextValue: string) =>
    numberParser.value.isValidPartialNumber(nextValue, minValue, maxValue);

  return {
    validate,
    increment,
    incrementToMax,
    decrement,
    decrementToMin,
    get canIncrement() {
      return canIncrement.value;
    },
    get canDecrement() {
      return canDecrement.value;
    },
    minValue,
    maxValue,
    get numberValue() {
      return parsedValue.value;
    },
    defaultNumberValue: Number.isNaN(defaultValue) ? initialValue : defaultValue,
    setNumberValue: (next) => {
      setControlledValue(next);
      inputValueRef.value = format(next);
    },
    setInputValue: (next) => {
      inputValueRef.value = next;
    },
    get inputValue() {
      return inputValueRef.value;
    },
    commit,
    get displayValidation() {
      return validation.displayValidation;
    },
    get realtimeValidation() {
      return validation.realtimeValidation;
    },
    updateValidation: validation.updateValidation,
    resetValidation: validation.resetValidation,
    commitValidation: validation.commitValidation,
  };
}
