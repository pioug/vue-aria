import {
  computed,
  hasInjectionContext,
  inject,
  ref,
  toValue,
  watch,
  type InjectionKey,
  type MaybeRefOrGetter,
} from "vue";

export interface ValidationResult {
  isInvalid: boolean;
  validationDetails: ValidityState | null;
  validationErrors: string[];
}

export type ValidationFunction<T> = (
  value: T
) => boolean | string | string[] | null | undefined;

export type ValidationErrors = Record<string, string | string[] | undefined>;

export interface FormValidationProps<T> {
  builtinValidation?: MaybeRefOrGetter<ValidationResult | null | undefined>;
  isInvalid?: MaybeRefOrGetter<boolean | undefined>;
  validationState?: MaybeRefOrGetter<"valid" | "invalid" | undefined>;
  name?: MaybeRefOrGetter<string | string[] | undefined>;
  value: MaybeRefOrGetter<T | null | undefined>;
  validate?: MaybeRefOrGetter<ValidationFunction<T> | undefined>;
  validationBehavior?: MaybeRefOrGetter<"aria" | "native" | undefined>;
  [key: string]: unknown;
}

export interface FormValidationState {
  realtimeValidation: ValidationResult;
  displayValidation: ValidationResult;
  updateValidation(result: ValidationResult): void;
  resetValidation(): void;
  commitValidation(): void;
}

export const VALID_VALIDITY_STATE: ValidityState = {
  badInput: false,
  customError: false,
  patternMismatch: false,
  rangeOverflow: false,
  rangeUnderflow: false,
  stepMismatch: false,
  tooLong: false,
  tooShort: false,
  typeMismatch: false,
  valueMissing: false,
  valid: true,
};

const CUSTOM_VALIDITY_STATE: ValidityState = {
  ...VALID_VALIDITY_STATE,
  customError: true,
  valid: false,
};

export const DEFAULT_VALIDATION_RESULT: ValidationResult = {
  isInvalid: false,
  validationDetails: VALID_VALIDITY_STATE,
  validationErrors: [],
};

export const FormValidationContext: InjectionKey<MaybeRefOrGetter<ValidationErrors>> =
  Symbol("FormValidationContext");

export const privateValidationStateProp = `__formValidationState${Date.now()}`;

export function useFormValidationState<T>(props: FormValidationProps<T>): FormValidationState {
  const privateState = props[privateValidationStateProp] as FormValidationState | undefined;
  if (privateState) {
    return privateState;
  }

  const validationBehavior = computed(() => toValue(props.validationBehavior) ?? "aria");
  const isInvalid = computed(
    () => Boolean(toValue(props.isInvalid) || toValue(props.validationState) === "invalid")
  );
  const builtinValidation = computed(() => {
    const validation = toValue(props.builtinValidation) ?? null;
    return validation?.validationDetails?.valid ? null : validation;
  });

  const controlledError = computed<ValidationResult | null>(() =>
    isInvalid.value
      ? {
        isInvalid: true,
        validationErrors: [],
        validationDetails: CUSTOM_VALIDITY_STATE,
      }
      : null
  );

  const clientError = computed<ValidationResult | null>(() => {
    const validator = toValue(props.validate);
    const value = toValue(props.value);
    if (!validator || value == null) {
      return null;
    }

    return getValidationResult(runValidate(validator, value));
  });

  const injectedServerErrors = hasInjectionContext()
    ? inject(FormValidationContext, ref<ValidationErrors>({}))
    : ref<ValidationErrors>({});
  const serverErrors = computed(() => toValue(injectedServerErrors) ?? {});
  const serverErrorMessages = computed(() => {
    const name = toValue(props.name);
    if (!name) {
      return [];
    }

    if (Array.isArray(name)) {
      return name.flatMap((item) => asArray(serverErrors.value[item]));
    }

    return asArray(serverErrors.value[name]);
  });

  const isServerErrorCleared = ref(false);
  watch(serverErrors, (next, prev) => {
    if (next !== prev) {
      isServerErrorCleared.value = false;
    }
  });

  const serverError = computed<ValidationResult | null>(() =>
    getValidationResult(isServerErrorCleared.value ? [] : serverErrorMessages.value)
  );

  const nextValidation = ref(DEFAULT_VALIDATION_RESULT);
  const currentValidity = ref(DEFAULT_VALIDATION_RESULT);
  const lastError = ref(DEFAULT_VALIDATION_RESULT);
  const commitQueued = ref(false);

  const commitQueuedValidation = () => {
    if (!commitQueued.value) {
      return;
    }

    commitQueued.value = false;
    const error =
      clientError.value
      || builtinValidation.value
      || nextValidation.value
      || DEFAULT_VALIDATION_RESULT;
    if (!isEqualValidation(error, lastError.value)) {
      lastError.value = error;
      currentValidity.value = error;
    }
  };

  watch(commitQueued, commitQueuedValidation, { flush: "post" });

  const realtimeValidation = computed(
    () =>
      controlledError.value
      || serverError.value
      || clientError.value
      || builtinValidation.value
      || DEFAULT_VALIDATION_RESULT
  );
  const displayValidation = computed(() =>
    validationBehavior.value === "native"
      ? controlledError.value || serverError.value || currentValidity.value
      : controlledError.value
      || serverError.value
      || clientError.value
      || builtinValidation.value
      || currentValidity.value
  );

  return {
    get realtimeValidation() {
      return realtimeValidation.value;
    },
    get displayValidation() {
      return displayValidation.value;
    },
    updateValidation(value) {
      if (validationBehavior.value === "aria" && !isEqualValidation(currentValidity.value, value)) {
        currentValidity.value = value;
      } else {
        nextValidation.value = value;
      }
    },
    resetValidation() {
      if (!isEqualValidation(DEFAULT_VALIDATION_RESULT, lastError.value)) {
        lastError.value = DEFAULT_VALIDATION_RESULT;
        currentValidity.value = DEFAULT_VALIDATION_RESULT;
      }

      if (validationBehavior.value === "native") {
        commitQueued.value = false;
      }

      isServerErrorCleared.value = true;
    },
    commitValidation() {
      if (validationBehavior.value === "native") {
        commitQueued.value = true;
      }

      isServerErrorCleared.value = true;
    },
  };
}

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (value == null) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function runValidate<T>(validate: ValidationFunction<T>, value: T): string[] {
  const result = validate(value);
  if (result && typeof result !== "boolean") {
    return asArray(result);
  }

  return [];
}

function getValidationResult(errors: string[]): ValidationResult | null {
  return errors.length
    ? {
      isInvalid: true,
      validationErrors: errors,
      validationDetails: CUSTOM_VALIDITY_STATE,
    }
    : null;
}

function isEqualValidation(a: ValidationResult | null, b: ValidationResult | null): boolean {
  if (a === b) {
    return true;
  }

  if (!a || !b) {
    return false;
  }

  return (
    a.isInvalid === b.isInvalid
    && a.validationErrors.length === b.validationErrors.length
    && a.validationErrors.every((error, index) => error === b.validationErrors[index])
    && Object.entries(a.validationDetails ?? {}).every(
      ([key, value]) => (b.validationDetails as any)?.[key] === value
    )
  );
}

export function mergeValidation(...results: ValidationResult[]): ValidationResult {
  const errors = new Set<string>();
  let isInvalid = false;
  const validationDetails: ValidityState = {
    ...VALID_VALIDITY_STATE,
  };

  for (const result of results) {
    for (const error of result.validationErrors) {
      errors.add(error);
    }

    isInvalid ||= result.isInvalid;
    for (const key in validationDetails) {
      if (key === "valid") {
        continue;
      }

      (validationDetails as any)[key] ||= (result.validationDetails as any)?.[key];
    }
  }

  (validationDetails as any).valid = !isInvalid;
  return {
    isInvalid,
    validationErrors: [...errors],
    validationDetails,
  };
}
