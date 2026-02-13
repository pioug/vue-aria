import {
  VALID_VALIDITY_STATE,
  useFormValidationState,
  type ValidationResult as FormValidationResult,
} from "@vue-aria/form-state";
import { ref } from "vue";
import { useControlledState } from "@vue-aria/utils-state";

export type ValidationResult = FormValidationResult;

export interface CheckboxGroupProps {
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  validationState?: "valid" | "invalid";
  validationBehavior?: "aria" | "native";
}

export interface CheckboxGroupState {
  readonly value: readonly string[];
  readonly defaultValue: readonly string[];
  readonly isDisabled: boolean;
  readonly isReadOnly: boolean;
  readonly validationState: "invalid" | null;
  readonly isInvalid: boolean;
  readonly isRequired: boolean;
  readonly realtimeValidation: ValidationResult;
  readonly displayValidation: ValidationResult;
  setValue(value: string[]): void;
  isSelected(value: string): boolean;
  addValue(value: string): void;
  removeValue(value: string): void;
  toggleValue(value: string): void;
  setInvalid(value: string, validation: ValidationResult): void;
  resetValidation(): void;
  commitValidation(): void;
  updateValidation(validation: ValidationResult): void;
}

export function useCheckboxGroupState(props: CheckboxGroupProps = {}): CheckboxGroupState {
  const [selectedValuesRef, setSelectedValues] = useControlledState<string[], string[]>(
    () => props.value,
    () => props.defaultValue ?? [],
    props.onChange
  );
  const initialValues = ref([...selectedValuesRef.value]);
  const invalidValues = ref(new Map<string, ValidationResult>());

  const builtinValidation = (): ValidationResult => {
    const merged = [...invalidValues.value.values()];
    const itemIsInvalid = merged.some((v) => v.isInvalid);
    const requiredIsInvalid = Boolean(props.isRequired) && selectedValuesRef.value.length === 0;
    const isInvalid = itemIsInvalid || requiredIsInvalid;
    const validationDetails = isInvalid
      ? {
        ...VALID_VALIDITY_STATE,
        customError: true,
        valueMissing: requiredIsInvalid,
        valid: false,
      }
      : VALID_VALIDITY_STATE;

    return {
      isInvalid,
      validationErrors: isInvalid ? ["Invalid checkbox group value"] : [],
      validationDetails,
    };
  };
  const validation = useFormValidationState<string[]>({
    ...props,
    value: () => selectedValuesRef.value,
    builtinValidation: () => builtinValidation(),
  });

  return {
    get value() {
      return selectedValuesRef.value;
    },
    get defaultValue() {
      return props.defaultValue ?? initialValues.value;
    },
    get isDisabled() {
      return props.isDisabled ?? false;
    },
    get isReadOnly() {
      return props.isReadOnly ?? false;
    },
    get validationState() {
      return this.displayValidation.isInvalid ? "invalid" : null;
    },
    get isInvalid() {
      return this.displayValidation.isInvalid;
    },
    get isRequired() {
      return Boolean(props.isRequired) && selectedValuesRef.value.length === 0;
    },
    get realtimeValidation() {
      return validation.realtimeValidation;
    },
    get displayValidation() {
      return validation.displayValidation;
    },
    setValue(value) {
      if (props.isReadOnly || props.isDisabled) {
        return;
      }

      setSelectedValues(value);
    },
    isSelected(value) {
      return selectedValuesRef.value.includes(value);
    },
    addValue(value) {
      if (props.isReadOnly || props.isDisabled) {
        return;
      }

      setSelectedValues((existing) => {
        if (existing.includes(value)) {
          return existing;
        }

        return existing.concat(value);
      });
    },
    removeValue(value) {
      if (props.isReadOnly || props.isDisabled) {
        return;
      }

      setSelectedValues((existing) => existing.filter((v) => v !== value));
    },
    toggleValue(value) {
      if (props.isReadOnly || props.isDisabled) {
        return;
      }

      setSelectedValues((existing) =>
        existing.includes(value)
          ? existing.filter((v) => v !== value)
          : existing.concat(value)
      );
    },
    setInvalid(value, validation) {
      const next = new Map(invalidValues.value);
      if (validation.isInvalid) {
        next.set(value, validation);
      } else {
        next.delete(value);
      }
      invalidValues.value = next;
    },
    resetValidation() {
      invalidValues.value = new Map();
      validation.resetValidation();
    },
    commitValidation() {
      validation.commitValidation();
    },
    updateValidation(nextValidation) {
      validation.updateValidation(nextValidation);
    },
  };
}
