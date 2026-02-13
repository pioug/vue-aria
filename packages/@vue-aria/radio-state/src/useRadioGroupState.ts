import { ref } from "vue";
import { useControlledState } from "@vue-aria/utils-state";

export interface ValidationResult {
  isInvalid: boolean;
  validationErrors: string[];
  validationDetails?: ValidityState | null;
}

export interface RadioGroupProps {
  name?: string;
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  validationState?: "valid" | "invalid";
  validationBehavior?: "aria" | "native";
}

export interface RadioGroupState {
  readonly name: string;
  readonly isDisabled: boolean;
  readonly isReadOnly: boolean;
  readonly isRequired: boolean;
  readonly validationState: "invalid" | null;
  readonly isInvalid: boolean;
  readonly selectedValue: string | null;
  readonly defaultSelectedValue: string | null;
  readonly lastFocusedValue: string | null;
  readonly realtimeValidation: ValidationResult;
  readonly displayValidation: ValidationResult;
  setSelectedValue(value: string | null): void;
  setLastFocusedValue(value: string | null): void;
  resetValidation(): void;
  commitValidation(): void;
  updateValidation(validation: ValidationResult): void;
}

let instance = Math.round(Math.random() * 10000000000);
let i = 0;

const DEFAULT_VALIDATION_RESULT: ValidationResult = {
  isInvalid: false,
  validationErrors: [],
  validationDetails: undefined,
};

export function useRadioGroupState(props: RadioGroupProps = {}): RadioGroupState {
  const generatedName = props.name || `radio-group-${instance}-${++i}`;
  const [selectedValueRef, setSelectedValueRef] = useControlledState<string | null, string | null>(
    () => props.value,
    () => props.defaultValue ?? null,
    props.onChange
  );
  const initialValue = ref(selectedValueRef.value);
  const lastFocusedValue = ref<string | null>(null);
  const localValidation = ref<ValidationResult>(DEFAULT_VALIDATION_RESULT);

  const computeValidation = (): ValidationResult => {
    const requiredInvalid = Boolean(props.isRequired) && !selectedValueRef.value;
    const propIsInvalid = Boolean(props.isInvalid || props.validationState === "invalid");
    const isInvalid = requiredInvalid || propIsInvalid || localValidation.value.isInvalid;

    return {
      isInvalid,
      validationErrors: isInvalid ? ["Invalid radio group value"] : [],
      validationDetails: undefined,
    };
  };

  return {
    get name() {
      return generatedName;
    },
    get isDisabled() {
      return props.isDisabled ?? false;
    },
    get isReadOnly() {
      return props.isReadOnly ?? false;
    },
    get isRequired() {
      return props.isRequired ?? false;
    },
    get validationState() {
      return this.displayValidation.isInvalid ? "invalid" : null;
    },
    get isInvalid() {
      return this.displayValidation.isInvalid;
    },
    get selectedValue() {
      return selectedValueRef.value;
    },
    get defaultSelectedValue() {
      return props.value !== undefined ? initialValue.value : props.defaultValue ?? null;
    },
    setSelectedValue(value) {
      if (!props.isReadOnly && !props.isDisabled) {
        setSelectedValueRef(value);
        this.commitValidation();
      }
    },
    get lastFocusedValue() {
      return lastFocusedValue.value;
    },
    setLastFocusedValue(value) {
      lastFocusedValue.value = value;
    },
    get realtimeValidation() {
      return computeValidation();
    },
    get displayValidation() {
      return computeValidation();
    },
    resetValidation() {
      localValidation.value = DEFAULT_VALIDATION_RESULT;
    },
    commitValidation() {
      // No-op for this slice; validation is derived directly from current state.
    },
    updateValidation(validation) {
      localValidation.value = validation;
    },
  };
}
