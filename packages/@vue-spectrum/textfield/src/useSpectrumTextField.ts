import { computed, ref, watch, watchEffect, type Ref } from "vue";
import { useTextField } from "@vue-aria/textfield";
import { useFormContext, useFormValidationErrors } from "@vue-spectrum/form";
import { useProviderContext } from "@vue-spectrum/provider";
import type {
  SpectrumTextAreaProps,
  SpectrumTextFieldBaseProps,
  SpectrumTextFieldValidationBehavior,
} from "./types";

interface UseSpectrumTextFieldOptions {
  multiLine?: boolean;
  rows?: number | undefined;
  type?: string | undefined;
  pattern?: string | undefined;
  inputRef?: Ref<HTMLInputElement | HTMLTextAreaElement | null> | undefined;
}

export function useSpectrumTextField(
  props: SpectrumTextFieldBaseProps,
  attrs: Record<string, unknown>,
  options: UseSpectrumTextFieldOptions = {}
) {
  const propsRecord = props as Record<string, unknown>;
  const provider = useProviderContext();
  const formContext = useFormContext();
  const formValidationErrors = useFormValidationErrors();
  const isServerErrorCleared = ref(false);
  const currentValue = ref(props.value ?? props.defaultValue ?? "");

  watch(
    () => [formValidationErrors.value, props.name] as const,
    () => {
      isServerErrorCleared.value = false;
    },
    { deep: true }
  );

  watch(
    () => props.value,
    (nextValue) => {
      if (nextValue !== undefined) {
        currentValue.value = nextValue ?? "";
      }
    },
    { immediate: true }
  );

  const resolvedFormProps = computed(() => ({
    labelPosition: props.labelPosition ?? formContext?.value.labelPosition,
    labelAlign: props.labelAlign ?? formContext?.value.labelAlign,
    necessityIndicator:
      props.necessityIndicator ?? formContext?.value.necessityIndicator,
    validationBehavior:
      props.validationBehavior ?? formContext?.value.validationBehavior,
  }));

  const isDisabled = computed(
    () => props.isDisabled ?? provider?.value.isDisabled ?? false
  );
  const isReadOnly = computed(
    () => props.isReadOnly ?? provider?.value.isReadOnly ?? false
  );
  const isRequired = computed(
    () => props.isRequired ?? provider?.value.isRequired ?? false
  );
  const validationState = computed(
    () => props.validationState ?? provider?.value.validationState
  );
  const serverErrorMessageFromForm = computed(() => {
    if (!props.name) {
      return undefined;
    }

    const formError = formValidationErrors.value[props.name];
    if (typeof formError === "string") {
      return formError;
    }

    if (Array.isArray(formError)) {
      for (const entry of formError) {
        if (typeof entry === "string" && entry.trim().length > 0) {
          return entry;
        }
      }
    }

    return undefined;
  });
  const serverErrorMessage = computed(() =>
    isServerErrorCleared.value ? undefined : serverErrorMessageFromForm.value
  );
  const validationBehavior = computed<SpectrumTextFieldValidationBehavior>(
    () =>
      props.validationBehavior ??
      (resolvedFormProps.value.validationBehavior as
        | SpectrumTextFieldValidationBehavior
        | undefined) ??
      "aria"
  );
  const validationErrorMessage = computed(() => {
    if (typeof props.validate !== "function") {
      return undefined;
    }

    const result = props.validate(currentValue.value);
    if (typeof result === "string" && result.trim().length > 0) {
      return result;
    }

    if (Array.isArray(result)) {
      for (const entry of result) {
        if (typeof entry === "string" && entry.trim().length > 0) {
          return entry;
        }
      }
    }

    return undefined;
  });
  const ariaValidationErrorMessage = computed(() =>
    validationBehavior.value === "aria" ? validationErrorMessage.value : undefined
  );
  const resolvedValidationState = computed(
    () =>
      validationState.value ??
      (serverErrorMessage.value || ariaValidationErrorMessage.value
        ? "invalid"
        : undefined)
  );
  const resolvedErrorMessage = computed(
    () =>
      props.errorMessage ??
      serverErrorMessage.value ??
      ariaValidationErrorMessage.value
  );
  const resolvedInvalid = computed(
    () =>
      Boolean(props.isInvalid) ||
      resolvedValidationState.value === "invalid" ||
      Boolean(serverErrorMessage.value) ||
      Boolean(ariaValidationErrorMessage.value)
  );

  const readAriaProp = (
    dashedName: string,
    camelName: string
  ): string | undefined => {
    const fromProps = propsRecord[dashedName] ?? propsRecord[camelName];
    if (typeof fromProps === "string") {
      return fromProps;
    }

    const fromAttrs = attrs[dashedName] ?? attrs[camelName];
    return typeof fromAttrs === "string" ? fromAttrs : undefined;
  };

  const textField = useTextField({
    inputElementType: computed(() =>
      options.multiLine ? "textarea" : "input"
    ),
    id: computed(() => props.id),
    label: computed(() => props.label),
    description: computed(() => props.description),
    errorMessage: resolvedErrorMessage,
    isInvalid: resolvedInvalid,
    validationState: resolvedValidationState,
    validationBehavior,
    isDisabled,
    isReadOnly,
    isRequired,
    value:
      props.value !== undefined ? computed(() => props.value) : undefined,
    defaultValue: props.defaultValue,
    inputRef: options.inputRef,
    type: computed(() => options.type),
    pattern: computed(() => options.pattern),
    autoComplete: computed(() => props.autoComplete),
    autoCapitalize: computed(() => props.autoCapitalize),
    maxLength: computed(() => props.maxLength),
    minLength: computed(() => props.minLength),
    name: computed(() => props.name),
    form: computed(() => props.form),
    placeholder: computed(() => props.placeholder),
    inputMode: computed(() => props.inputMode),
    autoCorrect: computed(() => props.autoCorrect),
    spellCheck: computed(() => props.spellCheck),
    enterKeyHint: computed(() => props.enterKeyHint),
    autoFocus: computed(() => props.autoFocus),
    "aria-label": computed(() => readAriaProp("aria-label", "ariaLabel")),
    "aria-labelledby": computed(() =>
      readAriaProp("aria-labelledby", "ariaLabelledby")
    ),
    "aria-describedby": computed(() =>
      readAriaProp("aria-describedby", "ariaDescribedby")
    ),
    "aria-errormessage": computed(() =>
      readAriaProp("aria-errormessage", "ariaErrormessage")
    ),
    onInput: (event) => {
      const inputTarget = event.target as
        | HTMLInputElement
        | HTMLTextAreaElement
        | null;
      currentValue.value = inputTarget?.value ?? "";
      if (serverErrorMessageFromForm.value) {
        isServerErrorCleared.value = true;
      }
      props.onInput?.(event);
    },
    onChange: props.onChange,
    onFocus: props.onFocus,
    onBlur: props.onBlur,
  });

  const forwardedInputAttrs = computed<Record<string, unknown>>(() => {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(attrs)) {
      if (value === undefined) {
        continue;
      }

      if (
        key.startsWith("aria-") ||
        key.startsWith("data-") ||
        key === "role" ||
        key === "tabIndex" ||
        key === "tabindex"
      ) {
        result[key] = value;
      }
    }

    return result;
  });

  const inputProps = computed<Record<string, unknown>>(() => {
    const mergedProps: Record<string, unknown> = {
      ...(textField.inputProps.value as Record<string, unknown>),
    };

    for (const [key, value] of Object.entries(forwardedInputAttrs.value)) {
      if (mergedProps[key] === undefined) {
        mergedProps[key] = value;
      }
    }

    if (props.excludeFromTabOrder) {
      mergedProps.tabIndex = -1;
    }

    return mergedProps;
  });

  watchEffect(() => {
    const inputElement = options.inputRef?.value;
    if (!inputElement) {
      return;
    }

    if (
      validationBehavior.value === "native" &&
      typeof props.validate === "function"
    ) {
      inputElement.setCustomValidity(validationErrorMessage.value ?? "");
      return;
    }

    inputElement.setCustomValidity("");
  });

  return {
    isDisabled,
    isReadOnly,
    isRequired,
    validationState: resolvedValidationState,
    errorMessage: resolvedErrorMessage,
    validationBehavior,
    textField,
    inputProps,
    inputRows: computed(() =>
      options.multiLine ? (options.rows as SpectrumTextAreaProps["rows"]) : undefined
    ),
  };
}
