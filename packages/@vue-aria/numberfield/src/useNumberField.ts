import { computed, ref, toValue, watchEffect } from "vue";
import { NumberParser } from "@internationalized/number";
import { useTextField, type UseTextFieldOptions } from "@vue-aria/textfield";
import { useSpinButton } from "@vue-aria/spinbutton";
import { mergeProps } from "@vue-aria/utils";
import type { MaybeReactive, PressEvent, ReadonlyRef } from "@vue-aria/types";

export interface UseNumberFieldOptions
  extends Omit<
    UseTextFieldOptions,
    "value" | "defaultValue" | "type" | "inputMode" | "onChange"
  > {
  value?: MaybeReactive<number | undefined>;
  defaultValue?: MaybeReactive<number | undefined>;
  minValue?: MaybeReactive<number | undefined>;
  maxValue?: MaybeReactive<number | undefined>;
  step?: MaybeReactive<number | undefined>;
  formatOptions?: MaybeReactive<Intl.NumberFormatOptions | undefined>;
  locale?: MaybeReactive<string | undefined>;
  decrementAriaLabel?: MaybeReactive<string | undefined>;
  incrementAriaLabel?: MaybeReactive<string | undefined>;
  onChange?: (value: number | undefined) => void;
  onIncrement?: (value: number | undefined) => void;
  onDecrement?: (value: number | undefined) => void;
  inputRef?: MaybeReactive<HTMLInputElement | null | undefined>;
  isWheelDisabled?: MaybeReactive<boolean | undefined>;
}

export interface UseNumberFieldResult {
  labelProps: ReadonlyRef<Record<string, unknown>>;
  groupProps: ReadonlyRef<Record<string, unknown>>;
  inputProps: ReadonlyRef<Record<string, unknown>>;
  incrementButtonProps: ReadonlyRef<Record<string, unknown>>;
  decrementButtonProps: ReadonlyRef<Record<string, unknown>>;
  descriptionProps: ReadonlyRef<Record<string, unknown>>;
  errorMessageProps: ReadonlyRef<Record<string, unknown>>;
  isInvalid: ReadonlyRef<boolean>;
  numberValue: ReadonlyRef<number | undefined>;
}

function toResolvedNumber(
  value: MaybeReactive<number | undefined> | undefined
): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const resolved = toValue(value);
  if (typeof resolved !== "number" || Number.isNaN(resolved)) {
    return undefined;
  }

  return resolved;
}

function clampNumber(
  value: number,
  min: number = Number.NEGATIVE_INFINITY,
  max: number = Number.POSITIVE_INFINITY
): number {
  return Math.min(Math.max(value, min), max);
}

function roundToStepPrecision(value: number, step: number): number {
  let roundedValue = value;
  let precision = 0;
  const stepString = step.toString();
  const exponentIndex = stepString.toLowerCase().indexOf("e-");

  if (exponentIndex > 0) {
    precision = Math.abs(Math.floor(Math.log10(Math.abs(step)))) + exponentIndex;
  } else {
    const pointIndex = stepString.indexOf(".");
    if (pointIndex >= 0) {
      precision = stepString.length - pointIndex;
    }
  }

  if (precision > 0) {
    const power = Math.pow(10, precision);
    roundedValue = Math.round(roundedValue * power) / power;
  }

  return roundedValue;
}

function snapValueToStep(
  value: number,
  min: number | undefined,
  max: number | undefined,
  step: number
): number {
  const normalizedMin = Number(min);
  const normalizedMax = Number(max);
  const remainder = (value - (Number.isNaN(normalizedMin) ? 0 : normalizedMin)) % step;
  let snappedValue = roundToStepPrecision(
    Math.abs(remainder) * 2 >= step
      ? value + Math.sign(remainder) * (step - Math.abs(remainder))
      : value - remainder,
    step
  );

  if (!Number.isNaN(normalizedMin)) {
    if (snappedValue < normalizedMin) {
      snappedValue = normalizedMin;
    } else if (!Number.isNaN(normalizedMax) && snappedValue > normalizedMax) {
      snappedValue =
        normalizedMin +
        Math.floor(
          roundToStepPrecision((normalizedMax - normalizedMin) / step, step)
        ) *
          step;
    }
  } else if (!Number.isNaN(normalizedMax) && snappedValue > normalizedMax) {
    snappedValue =
      Math.floor(roundToStepPrecision(normalizedMax / step, step)) * step;
  }

  return roundToStepPrecision(snappedValue, step);
}

function handleDecimalOperation(
  operator: "+" | "-",
  left: number,
  right: number
): number {
  let result = operator === "+" ? left + right : left - right;

  if (left % 1 !== 0 || right % 1 !== 0) {
    const leftDecimalLength = left.toString().split(".")[1]?.length ?? 0;
    const rightDecimalLength = right.toString().split(".")[1]?.length ?? 0;
    const multiplier = Math.pow(10, Math.max(leftDecimalLength, rightDecimalLength));

    const normalizedLeft = Math.round(left * multiplier);
    const normalizedRight = Math.round(right * multiplier);
    result =
      operator === "+"
        ? normalizedLeft + normalizedRight
        : normalizedLeft - normalizedRight;
    result /= multiplier;
  }

  return result;
}

function getNavigatorPlatform(): string {
  if (typeof navigator === "undefined") {
    return "";
  }

  return navigator.platform ?? "";
}

function getNavigatorUserAgent(): string {
  if (typeof navigator === "undefined") {
    return "";
  }

  return navigator.userAgent ?? "";
}

function isIPhone(): boolean {
  const platform = getNavigatorPlatform();
  return /iPhone/i.test(platform);
}

function isAndroid(): boolean {
  const userAgent = getNavigatorUserAgent();
  return /Android/i.test(userAgent);
}

export function useNumberField(
  options: UseNumberFieldOptions = {}
): UseNumberFieldResult {
  const {
    value: _value,
    defaultValue: _defaultValue,
    minValue: _minValue,
    maxValue: _maxValue,
    step: _step,
    formatOptions: _formatOptions,
    decrementAriaLabel: _decrementAriaLabel,
    incrementAriaLabel: _incrementAriaLabel,
    onChange: _onChange,
    onIncrement: _onIncrement,
    onDecrement: _onDecrement,
    inputRef: _inputRef,
    isWheelDisabled: _isWheelDisabled,
    ...textFieldOptions
  } = options;

  const minValue = computed(() => toResolvedNumber(options.minValue));
  const maxValue = computed(() => toResolvedNumber(options.maxValue));
  const resolvedLocale = computed(() =>
    options.locale === undefined ? undefined : toValue(options.locale)
  );
  const resolvedFormatOptions = computed(() =>
    options.formatOptions === undefined ? undefined : toValue(options.formatOptions)
  );
  const explicitStep = computed(() => {
    const resolved = toResolvedNumber(options.step);
    return resolved === undefined || resolved === 0 ? undefined : resolved;
  });
  const isDisabled = computed(() =>
    options.isDisabled === undefined ? false : Boolean(toValue(options.isDisabled))
  );
  const isReadOnly = computed(() =>
    options.isReadOnly === undefined ? false : Boolean(toValue(options.isReadOnly))
  );

  const numberFormatter = computed(
    () =>
      new Intl.NumberFormat(
        resolvedLocale.value,
        resolvedFormatOptions.value
      )
  );
  const numberParser = computed(
    () =>
      new NumberParser(
        numberFormatter.value.resolvedOptions().locale,
        resolvedFormatOptions.value
      )
  );

  const parseNumber = (value: string): number | undefined => {
    const trimmed = value.trim();
    if (trimmed === "") {
      return undefined;
    }

    const parsed = numberParser.value.parse(trimmed);
    if (Number.isFinite(parsed)) {
      return parsed;
    }

    const fallback = Number(trimmed.replace(/,/g, ""));
    return Number.isFinite(fallback) ? fallback : undefined;
  };

  const step = computed(() => {
    if (explicitStep.value !== undefined) {
      return explicitStep.value;
    }

    const style = numberFormatter.value.resolvedOptions().style;
    if (style === "percent") {
      return 0.01;
    }

    return 1;
  });

  const formatNumber = (value: number | undefined): string => {
    if (value === undefined || Number.isNaN(value)) {
      return "";
    }
    return numberFormatter.value.format(value);
  };

  const clampToRange = (value: number): number => {
    const min = minValue.value;
    const max = maxValue.value;
    return clampNumber(value, min, max);
  };

  const normalizeNumber = (value: number | undefined): number | undefined => {
    if (value === undefined) {
      return undefined;
    }

    if (explicitStep.value !== undefined) {
      return snapValueToStep(value, minValue.value, maxValue.value, explicitStep.value);
    }

    return clampToRange(value);
  };

  const uncontrolledNumberValue = ref<number | undefined>(
    normalizeNumber(toResolvedNumber(options.defaultValue))
  );
  const inputValue = ref(formatNumber(uncontrolledNumberValue.value));

  const currentNumberValue = computed<number | undefined>(() => {
    if (options.value !== undefined) {
      return normalizeNumber(toResolvedNumber(options.value));
    }
    return uncontrolledNumberValue.value;
  });

  watchEffect(() => {
    if (options.value !== undefined) {
      inputValue.value = formatNumber(currentNumberValue.value);
    }
  });

  watchEffect((onCleanup) => {
    const inputElement = options.inputRef === undefined ? undefined : toValue(options.inputRef);
    if (!inputElement || !inputElement.form) {
      return;
    }

    const onFormReset = () => {
      if (options.value !== undefined) {
        inputValue.value = formatNumber(currentNumberValue.value);
        return;
      }

      const resetValue = normalizeNumber(toResolvedNumber(options.defaultValue));
      uncontrolledNumberValue.value = resetValue;
      inputValue.value = formatNumber(resetValue);
    };

    inputElement.form.addEventListener("reset", onFormReset);

    onCleanup(() => {
      inputElement.form?.removeEventListener("reset", onFormReset);
    });
  });

  const commitNumberValue = (value: number | undefined) => {
    const normalized = normalizeNumber(value);
    const previousValue = currentNumberValue.value;
    if (options.value === undefined) {
      uncontrolledNumberValue.value = normalized;
    }

    if (!Object.is(previousValue, normalized)) {
      options.onChange?.(normalized);
    }
  };

  const commit = (rawValue?: string) => {
    const parsed = parseNumber(rawValue ?? inputValue.value);
    if (parsed === undefined) {
      inputValue.value = "";
      commitNumberValue(undefined);
      return;
    }

    const normalized = normalizeNumber(parsed);
    inputValue.value = formatNumber(normalized);
    commitNumberValue(normalized);
  };

  const changeByStep = (direction: 1 | -1, factor = 1) => {
    if (isDisabled.value || isReadOnly.value) {
      return;
    }

    const parsedInput = parseNumber(inputValue.value);
    const currentValue = currentNumberValue.value;
    const nextValue = (() => {
      if (parsedInput === undefined && currentValue === undefined) {
        const initialValue =
          direction > 0
            ? minValue.value ?? 0
            : maxValue.value ?? (minValue.value ?? 0);

        return snapValueToStep(initialValue, minValue.value, maxValue.value, step.value);
      }

      const base = parsedInput ?? currentValue;
      if (base === undefined) {
        return snapValueToStep(0, minValue.value, maxValue.value, step.value);
      }

      const snappedBase = snapValueToStep(
        base,
        minValue.value,
        maxValue.value,
        step.value
      );

      if (
        (direction > 0 && snappedBase > base) ||
        (direction < 0 && snappedBase < base)
      ) {
        return snappedBase;
      }

      const steppedValue =
        direction > 0
          ? handleDecimalOperation("+", base, step.value * factor)
          : handleDecimalOperation("-", base, step.value * factor);

      return snapValueToStep(
        steppedValue,
        minValue.value,
        maxValue.value,
        step.value
      );
    })();

    inputValue.value = formatNumber(nextValue);
    commitNumberValue(nextValue);

    if (direction > 0) {
      options.onIncrement?.(nextValue);
    } else {
      options.onDecrement?.(nextValue);
    }
  };

  const setToMin = () => {
    if (minValue.value === undefined || isDisabled.value || isReadOnly.value) {
      return;
    }
    inputValue.value = formatNumber(minValue.value);
    commitNumberValue(minValue.value);
  };

  const setToMax = () => {
    if (maxValue.value === undefined || isDisabled.value || isReadOnly.value) {
      return;
    }
    const snappedMax = snapValueToStep(
      maxValue.value,
      minValue.value,
      maxValue.value,
      step.value
    );
    inputValue.value = formatNumber(snappedMax);
    commitNumberValue(snappedMax);
  };

  const hasDecimals = computed(
    () => (numberFormatter.value.resolvedOptions().maximumFractionDigits ?? 0) > 0
  );
  const hasNegative = computed(
    () => minValue.value === undefined || minValue.value < 0
  );

  const inputMode = computed<"numeric" | "decimal" | "text">(() => {
    if (isIPhone()) {
      if (hasNegative.value) {
        return "text";
      }

      return hasDecimals.value ? "decimal" : "numeric";
    }

    if (isAndroid()) {
      if (!hasNegative.value && hasDecimals.value) {
        return "decimal";
      }

      return "numeric";
    }

    return "numeric";
  });

  const isFocused = ref(false);

  const handleWheel = (event: WheelEvent) => {
    if (
      isFocused.value === false ||
      isDisabled.value ||
      isReadOnly.value ||
      Boolean(
        options.isWheelDisabled === undefined
          ? false
          : toValue(options.isWheelDisabled)
      ) ||
      event.ctrlKey
    ) {
      return;
    }

    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return;
    }

    if (event.deltaY > 0) {
      changeByStep(1);
    } else if (event.deltaY < 0) {
      changeByStep(-1);
    }
  };

  const {
    labelProps,
    inputProps: textFieldProps,
    descriptionProps,
    errorMessageProps,
    isInvalid,
  } = useTextField({
    ...textFieldOptions,
    type: "text",
    inputMode,
    value: inputValue,
    onChange: (value) => {
      if (
        !numberParser.value.isValidPartialNumber(
          value,
          minValue.value,
          maxValue.value
        )
      ) {
        const inputElement =
          options.inputRef === undefined ? undefined : toValue(options.inputRef);
        if (inputElement) {
          inputElement.value = inputValue.value;
        }
        return;
      }

      inputValue.value = value;
      const parsed = parseNumber(value);
      if (parsed !== undefined) {
        commitNumberValue(clampToRange(parsed));
      } else if (value.trim() === "") {
        commitNumberValue(undefined);
      }
    },
    onBlur: (event) => {
      commit();
      options.onBlur?.(event);
    },
    onKeydown: (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        commit();
      }

      options.onKeydown?.(event);
    },
    onPaste: (event) => {
      options.onPaste?.(event);
      const inputElement = event.target as HTMLInputElement | null;
      if (!inputElement) {
        return;
      }

      const selectionStart = inputElement.selectionStart ?? 0;
      const selectionEnd = inputElement.selectionEnd ?? -1;
      const selectionLength = selectionEnd - selectionStart;
      if (selectionLength !== inputElement.value.length) {
        return;
      }

      event.preventDefault();
      const pastedText = event.clipboardData?.getData("text/plain")?.trim() ?? "";
      commit(pastedText);
    },
  });

  const {
    spinButtonProps,
    incrementButtonProps: stepperIncrementButtonProps,
    decrementButtonProps: stepperDecrementButtonProps,
  } = useSpinButton({
    value: currentNumberValue,
    textValue: inputValue,
    minValue,
    maxValue,
    isDisabled: options.isDisabled,
    isReadOnly: options.isReadOnly,
    isRequired: options.isRequired,
    onIncrement: () => changeByStep(1),
    onIncrementPage: () => changeByStep(1, 10),
    onDecrement: () => changeByStep(-1),
    onDecrementPage: () => changeByStep(-1, 10),
    onDecrementToMin: setToMin,
    onIncrementToMax: setToMax,
  });

  const canIncrement = computed(() => {
    if (isDisabled.value || isReadOnly.value) {
      return false;
    }
    const parsedInput = parseNumber(inputValue.value);
    if (parsedInput === undefined || maxValue.value === undefined) {
      return true;
    }

    return (
      snapValueToStep(parsedInput, minValue.value, maxValue.value, step.value) >
        parsedInput ||
      handleDecimalOperation("+", parsedInput, step.value) <= maxValue.value
    );
  });

  const canDecrement = computed(() => {
    if (isDisabled.value || isReadOnly.value) {
      return false;
    }
    const parsedInput = parseNumber(inputValue.value);
    if (parsedInput === undefined || minValue.value === undefined) {
      return true;
    }

    return (
      snapValueToStep(parsedInput, minValue.value, maxValue.value, step.value) <
        parsedInput ||
      handleDecimalOperation("-", parsedInput, step.value) >= minValue.value
    );
  });

  const fieldLabel = computed(() => {
    const ariaLabel =
      options["aria-label"] === undefined ? undefined : toValue(options["aria-label"]);
    if (ariaLabel) {
      return ariaLabel;
    }

    const label = options.label === undefined ? undefined : toValue(options.label);
    return typeof label === "string" ? label : "";
  });

  const inputId = computed(() =>
    typeof textFieldProps.value.id === "string"
      ? (textFieldProps.value.id as string)
      : undefined
  );

  const inputProps = computed<Record<string, unknown>>(() =>
    mergeProps(spinButtonProps.value, textFieldProps.value, {
      onFocus: () => {
        isFocused.value = true;
      },
      onBlur: () => {
        isFocused.value = false;
      },
      onWheel: (event: WheelEvent) => {
        handleWheel(event);
      },
      role: null,
      "aria-roledescription": "numberField",
      "aria-valuenow": null,
      "aria-valuetext": null,
      "aria-valuemin": null,
      "aria-valuemax": null,
      autoCorrect: "off",
      spellCheck: false,
    })
  );

  const incrementButtonProps = computed<Record<string, unknown>>(() =>
    mergeProps(stepperIncrementButtonProps.value, {
      "aria-label":
        options.incrementAriaLabel === undefined
          ? `Increase ${fieldLabel.value}`.trim()
          : toValue(options.incrementAriaLabel),
      "aria-controls": inputId.value,
      excludeFromTabOrder: true,
      preventFocusOnPress: true,
      isDisabled: !canIncrement.value,
      onPressStart: (event: PressEvent) => {
        const inputElement =
          options.inputRef === undefined ? undefined : toValue(options.inputRef);
        if (!inputElement) {
          return;
        }

        if (inputElement.ownerDocument.activeElement === inputElement) {
          return;
        }

        if (event.pointerType === "mouse") {
          inputElement.focus();
          return;
        }

        if (event.target instanceof HTMLElement) {
          event.target.focus();
        }
      },
    })
  );

  const decrementButtonProps = computed<Record<string, unknown>>(() =>
    mergeProps(stepperDecrementButtonProps.value, {
      "aria-label":
        options.decrementAriaLabel === undefined
          ? `Decrease ${fieldLabel.value}`.trim()
          : toValue(options.decrementAriaLabel),
      "aria-controls": inputId.value,
      excludeFromTabOrder: true,
      preventFocusOnPress: true,
      isDisabled: !canDecrement.value,
      onPressStart: (event: PressEvent) => {
        const inputElement =
          options.inputRef === undefined ? undefined : toValue(options.inputRef);
        if (!inputElement) {
          return;
        }

        if (inputElement.ownerDocument.activeElement === inputElement) {
          return;
        }

        if (event.pointerType === "mouse") {
          inputElement.focus();
          return;
        }

        if (event.target instanceof HTMLElement) {
          event.target.focus();
        }
      },
    })
  );

  const groupProps = computed<Record<string, unknown>>(() => ({
    role: "group",
    "aria-disabled": isDisabled.value || undefined,
    "aria-invalid": isInvalid.value ? "true" : undefined,
  }));

  return {
    labelProps,
    groupProps,
    inputProps,
    incrementButtonProps,
    decrementButtonProps,
    descriptionProps,
    errorMessageProps,
    isInvalid,
    numberValue: currentNumberValue,
  };
}
