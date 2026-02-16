import { mergeProps } from "@vue-aria/utils";
import { useToggle, type ToggleState } from "@vue-aria/toggle";
import type { ValidationResult } from "@vue-stately/checkbox";

interface PrivateValidationState {
  commitValidation?: () => void;
}

export interface AriaCheckboxProps {
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isIndeterminate?: boolean;
  isRequired?: boolean;
  validationBehavior?: "aria" | "native";
  validationState?: "valid" | "invalid";
  isInvalid?: boolean;
  value?: string;
  name?: string;
  form?: string;
  children?: unknown;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  onChange?: (isSelected: boolean) => void;
  __validationState?: PrivateValidationState;
  [key: string]: unknown;
}

export interface CheckboxAria extends ValidationResult {
  labelProps: Record<string, unknown>;
  inputProps: Record<string, unknown>;
  isSelected: boolean;
  isPressed: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
}

export function useCheckbox(
  props: AriaCheckboxProps,
  state: ToggleState,
  inputRef: { current: HTMLInputElement | null }
): CheckboxAria {
  const isInvalid = Boolean(props.isInvalid || props.validationState === "invalid");
  const { labelProps, inputProps, isSelected, isPressed, isDisabled, isReadOnly } = useToggle(
    {
      ...props,
      isInvalid,
    },
    state,
    inputRef
  );

  if (inputRef.current) {
    inputRef.current.indeterminate = Boolean(props.isIndeterminate);
  }

  const commitValidation = () => {
    props.__validationState?.commitValidation?.();
  };

  const validationBehavior = props.validationBehavior ?? "aria";
  const validationResult: ValidationResult = {
    isInvalid,
    validationErrors: isInvalid ? ["Invalid checkbox value"] : [],
    validationDetails: null,
  };

  return {
    labelProps: mergeProps(labelProps, {
      onMousedown: (e: MouseEvent) => e.preventDefault(),
      onClick: commitValidation,
    }),
    inputProps: {
      ...inputProps,
      checked: isSelected,
      "aria-required": (props.isRequired && validationBehavior === "aria") || undefined,
      required: Boolean(props.isRequired && validationBehavior === "native"),
    },
    isSelected,
    isPressed,
    isDisabled,
    isReadOnly,
    ...validationResult,
  };
}
