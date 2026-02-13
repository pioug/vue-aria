import { setInteractionModality } from "@vue-aria/interactions";
import { useEffectEvent, useLayoutEffect } from "@vue-aria/utils";
import { watch } from "vue";

type ValidatableElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export interface ValidationResult {
  isInvalid: boolean;
  validationDetails: ValidityState | null;
  validationErrors: string[];
}

export interface FormValidationState {
  realtimeValidation?: ValidationResult;
  displayValidation?: ValidationResult;
  updateValidation?: (validation: ValidationResult) => void;
  resetValidation?: () => void;
  commitValidation?: () => void;
}

export interface FormValidationProps {
  validationBehavior?: "aria" | "native";
  focus?: () => void;
}

function getValiditySnapshot(input: ValidatableElement): ValidityState {
  const validity = input.validity;
  return {
    badInput: validity.badInput,
    customError: validity.customError,
    patternMismatch: validity.patternMismatch,
    rangeOverflow: validity.rangeOverflow,
    rangeUnderflow: validity.rangeUnderflow,
    stepMismatch: validity.stepMismatch,
    tooLong: validity.tooLong,
    tooShort: validity.tooShort,
    typeMismatch: validity.typeMismatch,
    valueMissing: validity.valueMissing,
    valid: validity.valid,
  };
}

function getNativeValidity(input: ValidatableElement): ValidationResult {
  return {
    isInvalid: !input.validity.valid,
    validationDetails: getValiditySnapshot(input),
    validationErrors: input.validationMessage ? [input.validationMessage] : [],
  };
}

function getFirstInvalidInput(form: HTMLFormElement): ValidatableElement | null {
  for (let i = 0; i < form.elements.length; i += 1) {
    const element = form.elements[i] as ValidatableElement;
    if (!element.validity.valid) {
      return element;
    }
  }
  return null;
}

export function useFormValidation(
  props: FormValidationProps,
  state: FormValidationState,
  ref?: { value: ValidatableElement | null } | null
): void {
  const { validationBehavior, focus } = props;

  useLayoutEffect(() => {
    const input = ref?.value;
    if (validationBehavior === "native" && input && !input.disabled) {
      const errors = state.realtimeValidation?.validationErrors ?? [];
      const isInvalid = state.realtimeValidation?.isInvalid ?? false;
      input.setCustomValidity(isInvalid ? errors.join(" ") || "Invalid value." : "");

      if (!input.hasAttribute("title")) {
        input.title = "";
      }

      if (!isInvalid) {
        state.updateValidation?.(getNativeValidity(input));
      }
    }
  }, [() => validationBehavior, () => ref?.value]);

  const onReset = useEffectEvent(() => {
    state.resetValidation?.();
  });

  const onInvalid = useEffectEvent((event: Event) => {
    if (!state.displayValidation?.isInvalid) {
      state.commitValidation?.();
    }

    const input = ref?.value;
    const form = input?.form;
    if (!event.defaultPrevented && input && form && getFirstInvalidInput(form) === input) {
      if (focus) {
        focus();
      } else {
        input.focus();
      }
      setInteractionModality("keyboard");
    }

    event.preventDefault();
  });

  const onChange = useEffectEvent(() => {
    state.commitValidation?.();
  });

  watch(
    () => ref?.value,
    (input, _prev, onCleanup) => {
      if (!input) {
        return;
      }

      const form = input.form;
      input.addEventListener("invalid", onInvalid);
      input.addEventListener("change", onChange);
      form?.addEventListener("reset", onReset);

      onCleanup(() => {
        input.removeEventListener("invalid", onInvalid);
        input.removeEventListener("change", onChange);
        form?.removeEventListener("reset", onReset);
      });
    },
    { immediate: true }
  );
}
