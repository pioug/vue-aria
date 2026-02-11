import { computed, ref, watch, type Ref } from "vue";
import { useTextField } from "@vue-aria/textfield";
import { useFormProps, useFormValidationErrors } from "@vue-spectrum/form";
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
  const provider = useProviderContext();
  const formValidationErrors = useFormValidationErrors();
  const isServerErrorCleared = ref(false);

  watch(
    () => [formValidationErrors.value, props.name] as const,
    () => {
      isServerErrorCleared.value = false;
    },
    { deep: true }
  );

  const resolvedFormProps = computed(() =>
    useFormProps({
      labelPosition: props.labelPosition,
      labelAlign: props.labelAlign,
      necessityIndicator: props.necessityIndicator,
      validationBehavior: props.validationBehavior,
    })
  );

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
  const resolvedValidationState = computed(
    () => validationState.value ?? (serverErrorMessage.value ? "invalid" : undefined)
  );
  const resolvedErrorMessage = computed(
    () => props.errorMessage ?? serverErrorMessage.value
  );
  const resolvedInvalid = computed(
    () =>
      Boolean(props.isInvalid) ||
      resolvedValidationState.value === "invalid" ||
      Boolean(serverErrorMessage.value)
  );
  const validationBehavior = computed<SpectrumTextFieldValidationBehavior>(
    () =>
      props.validationBehavior ??
      (resolvedFormProps.value.validationBehavior as
        | SpectrumTextFieldValidationBehavior
        | undefined) ??
      "aria"
  );

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
    "aria-label": computed(
      () => props["aria-label"] ?? (attrs["aria-label"] as string | undefined)
    ),
    "aria-labelledby": computed(
      () =>
        props["aria-labelledby"] ??
        (attrs["aria-labelledby"] as string | undefined)
    ),
    "aria-describedby": computed(
      () =>
        props["aria-describedby"] ??
        (attrs["aria-describedby"] as string | undefined)
    ),
    "aria-errormessage": computed(
      () =>
        props["aria-errormessage"] ??
        (attrs["aria-errormessage"] as string | undefined)
    ),
    onInput: (event) => {
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
