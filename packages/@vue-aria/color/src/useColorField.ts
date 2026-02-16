import { useId } from "@vue-aria/utils";

export interface AriaColorFieldProps {
  value?: string;
  label?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  validationBehavior?: "aria" | "native";
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

export interface ColorFieldAria {
  labelProps: Record<string, unknown>;
  inputProps: Record<string, unknown>;
  descriptionProps: Record<string, unknown>;
  errorMessageProps: Record<string, unknown>;
  validationErrors?: string[];
  validationDetails?: ValidityState | null;
  isInvalid: boolean;
}

export interface ColorFieldState {
  inputValue?: string;
  colorValue?: { toString: () => string };
  setColorValue?: (value: string) => void;
  setInputValue?: (value: string) => void;
  validate?: (value: string) => boolean;
  defaultColorValue?: string;
}

export function useColorField(
  props: AriaColorFieldProps,
  state: ColorFieldState = {}
): ColorFieldAria {
  const labelId = useId();
  const inputId = useId();
  const value = state.inputValue ?? props.value ?? "";

  const onInput = (event: { currentTarget: HTMLInputElement }) => {
    const next = event.currentTarget.value;
    state.setInputValue?.(next);
    state.setColorValue?.(next);
    if (props.validationBehavior === "native" || props.onChange == null) return;
    if (state.validate?.(next) ?? true) {
      props.onChange?.(next);
    }
  };

  return {
    labelProps: {
      id: labelId,
      htmlFor: inputId,
      children: props.label,
      "aria-hidden": true,
    },
    inputProps: {
      id: inputId,
      value,
      onInput,
      onBlur: () => props.onSubmit?.(value),
      "aria-label": props["aria-label"],
      "aria-labelledby": props["aria-labelledby"],
      readOnly: props.isReadOnly,
      disabled: props.isDisabled,
      required: props.isRequired,
    },
    descriptionProps: { id: `${inputId}-description` },
    errorMessageProps: { id: `${inputId}-error` },
    validationErrors: [],
    validationDetails: null,
    isInvalid: false,
  };
}
