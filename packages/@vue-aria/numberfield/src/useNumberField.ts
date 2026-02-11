import { computed, ref, toValue, watchEffect } from "vue";
import { useTextField, type UseTextFieldOptions } from "@vue-aria/textfield";
import { useSpinButton } from "@vue-aria/spinbutton";
import { mergeProps } from "@vue-aria/utils";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";

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

function parseNumber(value: string): number | undefined {
  const normalized = value.trim().replace(/,/g, "");
  if (normalized === "") {
    return undefined;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
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
  const step = computed(() => {
    const resolved = toResolvedNumber(options.step);
    return resolved === undefined || resolved === 0 ? 1 : resolved;
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
        undefined,
        options.formatOptions === undefined ? undefined : toValue(options.formatOptions)
      )
  );

  const formatNumber = (value: number | undefined): string => {
    if (value === undefined || Number.isNaN(value)) {
      return "";
    }
    return numberFormatter.value.format(value);
  };

  const clamp = (value: number): number => {
    const min = minValue.value;
    const max = maxValue.value;
    if (min !== undefined && value < min) {
      return min;
    }
    if (max !== undefined && value > max) {
      return max;
    }
    return value;
  };

  const normalizeNumber = (value: number | undefined): number | undefined => {
    if (value === undefined) {
      return undefined;
    }

    return clamp(value);
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

  const commitNumberValue = (value: number | undefined) => {
    const normalized = normalizeNumber(value);
    if (options.value === undefined) {
      uncontrolledNumberValue.value = normalized;
    }
    options.onChange?.(normalized);
  };

  const commit = (rawValue?: string) => {
    const parsed = parseNumber(rawValue ?? inputValue.value);
    if (parsed === undefined) {
      inputValue.value = "";
      commitNumberValue(undefined);
      return;
    }

    const normalized = clamp(parsed);
    inputValue.value = formatNumber(normalized);
    commitNumberValue(normalized);
  };

  const changeByStep = (direction: 1 | -1, factor = 1) => {
    if (isDisabled.value || isReadOnly.value) {
      return;
    }

    const parsedInput = parseNumber(inputValue.value);
    const base =
      parsedInput ??
      currentNumberValue.value ??
      (minValue.value !== undefined ? minValue.value : 0);
    const nextValue = clamp(base + step.value * factor * direction);
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
    inputValue.value = formatNumber(maxValue.value);
    commitNumberValue(maxValue.value);
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
      inputValue.value = value;
      const parsed = parseNumber(value);
      if (parsed !== undefined) {
        commitNumberValue(clamp(parsed));
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
    const current = currentNumberValue.value;
    if (current === undefined || maxValue.value === undefined) {
      return true;
    }
    return current < maxValue.value;
  });

  const canDecrement = computed(() => {
    if (isDisabled.value || isReadOnly.value) {
      return false;
    }
    const current = currentNumberValue.value;
    if (current === undefined || minValue.value === undefined) {
      return true;
    }
    return current > minValue.value;
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
      onPressStart: () => {
        const inputRef = options.inputRef === undefined ? undefined : toValue(options.inputRef);
        inputRef?.focus();
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
      onPressStart: () => {
        const inputRef = options.inputRef === undefined ? undefined : toValue(options.inputRef);
        inputRef?.focus();
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
