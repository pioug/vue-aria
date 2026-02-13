import { useToggleState } from "@vue-aria/toggle-state";
import type { CheckboxGroupState, ValidationResult } from "@vue-aria/checkbox-state";
import { useCheckbox, type AriaCheckboxProps, type CheckboxAria } from "./useCheckbox";
import { checkboxGroupData } from "./utils";

export interface AriaCheckboxGroupItemProps extends AriaCheckboxProps {
  value: string;
  onChange?: (isSelected: boolean) => void;
}

export function useCheckboxGroupItem(
  props: AriaCheckboxGroupItemProps,
  state: CheckboxGroupState,
  inputRef: { current: HTMLInputElement | null }
): CheckboxAria {
  const toggleState = useToggleState({
    isReadOnly: props.isReadOnly || state.isReadOnly,
    isSelected: state.isSelected(props.value),
    defaultSelected: state.defaultValue.includes(props.value),
    onChange(isSelected) {
      if (isSelected) {
        state.addValue(props.value);
      } else {
        state.removeValue(props.value);
      }

      props.onChange?.(isSelected);
    },
  });

  const groupData = checkboxGroupData.get(state);
  const validationBehavior = props.validationBehavior ?? groupData?.validationBehavior ?? "aria";
  const localValidation: ValidationResult = {
    isInvalid: Boolean(props.isInvalid || props.validationState === "invalid"),
    validationErrors: [],
    validationDetails: undefined,
  };

  state.setInvalid(props.value, localValidation);
  const combinedRealtimeValidation = state.realtimeValidation.isInvalid
    ? state.realtimeValidation
    : localValidation;
  const displayValidation =
    validationBehavior === "native" ? state.displayValidation : combinedRealtimeValidation;

  const result = useCheckbox(
    {
      ...props,
      isReadOnly: props.isReadOnly || state.isReadOnly,
      isDisabled: props.isDisabled || state.isDisabled,
      name: props.name || groupData?.name,
      form: props.form || groupData?.form,
      isRequired: props.isRequired ?? state.isRequired,
      validationBehavior,
      __validationState: {
        commitValidation: state.commitValidation,
      },
    },
    toggleState,
    inputRef
  );

  return {
    ...result,
    isInvalid: displayValidation.isInvalid,
    validationErrors: displayValidation.validationErrors,
    validationDetails: displayValidation.validationDetails,
    inputProps: {
      ...result.inputProps,
      "aria-describedby": [
        props["aria-describedby"],
        state.isInvalid ? groupData?.errorMessageId : null,
        groupData?.descriptionId,
      ]
        .filter(Boolean)
        .join(" ") || undefined,
    },
  };
}
