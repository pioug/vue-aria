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
  let isIgnoredReset = false;

  useLayoutEffect(() => {
    const input = ref?.value;
    if (validationBehavior === "native" && input && !input.disabled) {
      input.setCustomValidity("");
      const nativeValidity = getNativeValidity(input);
      const realtimeValidation = state.realtimeValidation;
      const displayValidation = state.displayValidation;
      const useDisplayMessage =
        !realtimeValidation?.isInvalid
        && nativeValidity.isInvalid
        && !!displayValidation?.isInvalid
        && (displayValidation.validationErrors?.length ?? 0) > 0;
      const errors = useDisplayMessage
        ? displayValidation?.validationErrors ?? []
        : realtimeValidation?.validationErrors ?? [];
      const hasError = useDisplayMessage || !!realtimeValidation?.isInvalid;
      input.setCustomValidity(hasError ? errors.join(" ") || "Invalid value." : "");

      if (!input.hasAttribute("title")) {
        input.title = "";
      }

      if (!realtimeValidation?.isInvalid) {
        state.updateValidation?.(nativeValidity);
      }
    }
  }, [
    () => validationBehavior,
    () => ref?.value,
    () => state.realtimeValidation?.isInvalid,
    () => (state.realtimeValidation?.validationErrors ?? []).join("\n"),
    () => state.displayValidation?.isInvalid,
    () => (state.displayValidation?.validationErrors ?? []).join("\n"),
  ]);

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
      const reset = form?.reset;

      if (form) {
        form.reset = () => {
          const activeEvent = window.event;
          isIgnoredReset =
            !activeEvent ||
            (activeEvent.type === "message" && activeEvent.target instanceof MessagePort);
          reset?.call(form);
          isIgnoredReset = false;
        };
      }

      const onResetHandler = () => {
        if (!isIgnoredReset) {
          onReset();
        }
      };

      input.addEventListener("invalid", onInvalid);
      input.addEventListener("change", onChange);
      form?.addEventListener("reset", onResetHandler);

      onCleanup(() => {
        input.removeEventListener("invalid", onInvalid);
        input.removeEventListener("change", onChange);
        form?.removeEventListener("reset", onResetHandler);
        if (form) {
          form.reset = reset!;
        }
      });
    },
    { immediate: true }
  );
}
