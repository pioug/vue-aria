import type { CheckboxGroupProps, CheckboxGroupState, ValidationResult } from "@vue-aria/checkbox-state";
import { useField } from "@vue-aria/label";
import { useFocusWithin } from "@vue-aria/interactions";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { checkboxGroupData } from "./utils";

export interface CheckboxGroupAria extends ValidationResult {
  groupProps: Record<string, unknown>;
  labelProps: Record<string, unknown>;
  descriptionProps: Record<string, unknown>;
  errorMessageProps: Record<string, unknown>;
}

export interface AriaCheckboxGroupProps extends CheckboxGroupProps {
  label?: string;
  name?: string;
  form?: string;
  description?: string;
  errorMessage?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onFocusChange?: (isFocused: boolean) => void;
  [key: string]: unknown;
}

export function useCheckboxGroup(
  props: AriaCheckboxGroupProps,
  state: CheckboxGroupState
): CheckboxGroupAria {
  const { isDisabled, name, form, validationBehavior = "aria" } = props;
  const { isInvalid, validationErrors, validationDetails } = state.displayValidation;

  const { labelProps, fieldProps, descriptionProps, errorMessageProps } = useField({
    ...props,
    labelElementType: "span",
    isInvalid,
    errorMessage: props.errorMessage || validationErrors.join(", "),
  });

  checkboxGroupData.set(state, {
    name,
    form,
    descriptionId: descriptionProps.id as string | undefined,
    errorMessageId: errorMessageProps.id as string | undefined,
    validationBehavior,
  });

  const domProps = filterDOMProps(props, { labelable: true });
  const { focusWithinProps } = useFocusWithin({
    onBlurWithin: props.onBlur,
    onFocusWithin: props.onFocus,
    onFocusWithinChange: props.onFocusChange,
  });

  return {
    groupProps: mergeProps(domProps, {
      role: "group",
      "aria-disabled": isDisabled || undefined,
      ...fieldProps,
      ...focusWithinProps,
    }),
    labelProps,
    descriptionProps,
    errorMessageProps,
    isInvalid,
    validationErrors,
    validationDetails,
  };
}
