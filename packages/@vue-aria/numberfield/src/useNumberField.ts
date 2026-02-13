import { announce } from "@vue-aria/live-announcer";
import { useLocalizedStringFormatter, useNumberFormatter } from "@vue-aria/i18n";
import { useFocus, useFocusWithin } from "@vue-aria/interactions";
import { useSpinButton } from "@vue-aria/spinbutton";
import { useFormattedTextField } from "@vue-aria/textfield";
import { chain, filterDOMProps, isAndroid, isIPhone, mergeProps, useFormReset, useId } from "@vue-aria/utils";
import { ref } from "vue";
import type { NumberFieldState } from "@vue-aria/numberfield-state";

interface ValidationResult {
  isInvalid: boolean;
  validationErrors: string[];
  validationDetails: ValidityState | null;
}

const intlMessages = {
  "en-US": {
    decrease: "Decrease {fieldLabel}",
    increase: "Increase {fieldLabel}",
    numberField: "Number field",
  },
};

export interface AriaNumberFieldProps {
  id?: string;
  decrementAriaLabel?: string;
  incrementAriaLabel?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  minValue?: number;
  maxValue?: number;
  autoFocus?: boolean;
  label?: string;
  formatOptions?: Intl.NumberFormatOptions;
  onBlur?: (event: FocusEvent) => void;
  onFocus?: (event: FocusEvent) => void;
  onFocusChange?: (isFocused: boolean) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
  onCopy?: (event: ClipboardEvent) => void;
  onCut?: (event: ClipboardEvent) => void;
  onPaste?: (event: ClipboardEvent) => void;
  onCompositionStart?: (event: CompositionEvent) => void;
  onCompositionEnd?: (event: CompositionEvent) => void;
  onCompositionUpdate?: (event: CompositionEvent) => void;
  onSelect?: (event: Event) => void;
  onBeforeInput?: (event: InputEvent) => void;
  onInput?: (event: InputEvent) => void;
  description?: string;
  errorMessage?: string;
  validationBehavior?: "aria" | "native";
  isWheelDisabled?: boolean;
  placeholder?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  [key: string]: unknown;
}

export interface NumberFieldAria extends ValidationResult {
  labelProps: Record<string, unknown>;
  groupProps: Record<string, unknown>;
  inputProps: Record<string, unknown>;
  incrementButtonProps: Record<string, unknown>;
  decrementButtonProps: Record<string, unknown>;
  descriptionProps: Record<string, unknown>;
  errorMessageProps: Record<string, unknown>;
}

export function useNumberField(
  props: AriaNumberFieldProps,
  state: NumberFieldState,
  inputRef: { current: HTMLInputElement | null }
): NumberFieldAria {
  const {
    id,
    decrementAriaLabel,
    incrementAriaLabel,
    isDisabled,
    isReadOnly,
    isRequired,
    minValue,
    maxValue,
    autoFocus,
    label,
    formatOptions,
    onBlur = () => {},
    onFocus,
    onFocusChange,
    onKeyDown,
    onKeyUp,
    description,
    errorMessage,
    ...otherProps
  } = props;

  const {
    increment,
    incrementToMax,
    decrement,
    decrementToMin,
    numberValue,
    inputValue,
    commit,
    commitValidation,
  } = state;

  const stringFormatter = useLocalizedStringFormatter(intlMessages as any, "@react-aria/numberfield");

  const commitAndAnnounce = () => {
    const oldValue = inputRef.current?.value ?? "";
    commit();
    if (inputRef.current?.value !== oldValue) {
      announce(inputRef.current?.value ?? "", "assertive");
    }
  };

  const inputId = useId(id);
  const { focusProps } = useFocus({
    onBlur() {
      commitAndAnnounce();
    },
  });

  const numberFormatter = useNumberFormatter(formatOptions);
  const intlOptions = numberFormatter.resolvedOptions();
  const textValueFormatter = useNumberFormatter({ ...formatOptions, currencySign: undefined });
  const textValue = Number.isNaN(numberValue) ? "" : textValueFormatter.format(numberValue);

  const {
    spinButtonProps,
    incrementButtonProps: incButtonProps,
    decrementButtonProps: decButtonProps,
  } = useSpinButton({
    isDisabled,
    isReadOnly,
    isRequired,
    maxValue,
    minValue,
    onIncrement: increment,
    onIncrementToMax: incrementToMax,
    onDecrement: decrement,
    onDecrementToMin: decrementToMin,
    value: numberValue,
    textValue,
  });

  const focusWithin = ref(false);
  const { focusWithinProps } = useFocusWithin({
    isDisabled,
    onFocusWithinChange: (isFocused) => {
      focusWithin.value = isFocused;
    },
  });

  const hasDecimals = (intlOptions.maximumFractionDigits ?? 0) > 0;
  const hasNegative =
    state.minValue === undefined || Number.isNaN(state.minValue) || state.minValue < 0;
  let inputMode: "numeric" | "decimal" | "text" = "numeric";
  if (isIPhone()) {
    if (hasNegative) {
      inputMode = "text";
    } else if (hasDecimals) {
      inputMode = "decimal";
    }
  } else if (isAndroid()) {
    if (hasNegative) {
      inputMode = "numeric";
    } else if (hasDecimals) {
      inputMode = "decimal";
    }
  }

  const onWheel = ({ deltaX, deltaY }: { deltaX: number; deltaY: number }) => {
    if (Math.abs(deltaY) <= Math.abs(deltaX)) {
      return;
    }
    if (deltaY > 0) {
      increment();
    } else if (deltaY < 0) {
      decrement();
    }
  };

  const onChange = (value: string) => {
    if (state.validate(value)) {
      state.setInputValue(value);
    }
  };

  const onPaste = (event: ClipboardEvent) => {
    props.onPaste?.(event);
    const inputElement = event.target as HTMLInputElement;
    if (
      inputElement &&
      ((inputElement.selectionEnd ?? -1) - (inputElement.selectionStart ?? 0)) ===
        inputElement.value.length
    ) {
      event.preventDefault();
      commit(event.clipboardData?.getData("text/plain")?.trim() ?? "");
    }
  };

  const domProps = filterDOMProps(props);
  const onKeyDownEnter = (event: KeyboardEvent & { nativeEvent?: { isComposing?: boolean } }) => {
    if (event.nativeEvent?.isComposing) {
      return;
    }
    if (event.key === "Enter") {
      commit();
      commitValidation();
    }
  };

  const { isInvalid, validationErrors, validationDetails } = state.displayValidation;
  const {
    labelProps,
    inputProps: textFieldProps,
    descriptionProps,
    errorMessageProps,
  } = useFormattedTextField(
    {
      ...otherProps,
      ...domProps,
      label,
      autoFocus,
      isDisabled,
      isReadOnly,
      isRequired,
      value: inputValue,
      autoComplete: "off",
      "aria-label": props["aria-label"] || undefined,
      "aria-labelledby": props["aria-labelledby"] || undefined,
      id: inputId,
      type: "text",
      inputMode,
      onChange,
      onBlur,
      onFocus,
      onFocusChange,
      onKeyDown: chain(onKeyDownEnter, onKeyDown),
      onKeyUp,
      onPaste,
      description,
      errorMessage,
    },
    state as any,
    inputRef
  );

  useFormReset(
    { current: inputRef.current } as any,
    state.defaultNumberValue as any,
    (value: number) => state.setNumberValue?.(value)
  );

  const inputProps = mergeProps(spinButtonProps, focusProps, textFieldProps, {
    role: null,
    "aria-roledescription": stringFormatter.format("numberField"),
    "aria-valuemax": null,
    "aria-valuemin": null,
    "aria-valuenow": null,
    "aria-valuetext": null,
    autoCorrect: "off",
    spellCheck: "false",
    onWheel: (event: WheelEvent) => {
      const scrollingDisabled = props.isWheelDisabled || isDisabled || isReadOnly || !focusWithin.value;
      if (event.ctrlKey || scrollingDisabled) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      onWheel({ deltaX: event.deltaX, deltaY: event.deltaY });
    },
  });

  if (props.validationBehavior === "native") {
    (inputProps as Record<string, unknown>)["aria-required"] = undefined;
  }

  const fieldLabel = props["aria-label"] || (typeof props.label === "string" ? props.label : "");
  let ariaLabelledby: string | undefined;
  if (!fieldLabel) {
    ariaLabelledby = props.label != null ? (labelProps.id as string | undefined) : props["aria-labelledby"] as string | undefined;
  }

  const incrementId = useId();
  const decrementId = useId();

  const incrementButtonProps = mergeProps(incButtonProps, {
    "aria-label": incrementAriaLabel || stringFormatter.format("increase", { fieldLabel }).trim(),
    id: ariaLabelledby && !incrementAriaLabel ? incrementId : null,
    "aria-labelledby": ariaLabelledby && !incrementAriaLabel ? `${incrementId} ${ariaLabelledby}` : null,
    "aria-controls": inputId,
    excludeFromTabOrder: true,
    preventFocusOnPress: true,
    allowFocusWhenDisabled: true,
    isDisabled: state.canIncrement === undefined ? false : !state.canIncrement,
    onPressStart: (event: { pointerType: string; target: HTMLElement }) => {
      if (document.activeElement === inputRef.current) {
        return;
      }
      if (event.pointerType === "mouse") {
        inputRef.current?.focus();
      } else {
        event.target.focus();
      }
    },
  });

  const decrementButtonProps = mergeProps(decButtonProps, {
    "aria-label": decrementAriaLabel || stringFormatter.format("decrease", { fieldLabel }).trim(),
    id: ariaLabelledby && !decrementAriaLabel ? decrementId : null,
    "aria-labelledby": ariaLabelledby && !decrementAriaLabel ? `${decrementId} ${ariaLabelledby}` : null,
    "aria-controls": inputId,
    excludeFromTabOrder: true,
    preventFocusOnPress: true,
    allowFocusWhenDisabled: true,
    isDisabled: state.canDecrement === undefined ? false : !state.canDecrement,
    onPressStart: (event: { pointerType: string; target: HTMLElement }) => {
      if (document.activeElement === inputRef.current) {
        return;
      }
      if (event.pointerType === "mouse") {
        inputRef.current?.focus();
      } else {
        event.target.focus();
      }
    },
  });

  return {
    groupProps: {
      ...focusWithinProps,
      role: "group",
      "aria-disabled": isDisabled,
      "aria-invalid": isInvalid ? "true" : undefined,
    },
    labelProps,
    inputProps,
    incrementButtonProps,
    decrementButtonProps,
    errorMessageProps,
    descriptionProps,
    isInvalid,
    validationErrors,
    validationDetails,
  };
}
