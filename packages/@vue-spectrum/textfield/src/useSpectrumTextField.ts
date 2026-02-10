import { computed } from "vue";
import { useTextField } from "@vue-aria/textfield";
import { useFormProps } from "@vue-spectrum/form";
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
}

export function useSpectrumTextField(
  props: SpectrumTextFieldBaseProps,
  attrs: Record<string, unknown>,
  options: UseSpectrumTextFieldOptions = {}
) {
  const provider = useProviderContext();

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
    errorMessage: computed(() => props.errorMessage),
    isInvalid:
      props.isInvalid !== undefined
        ? computed(() => props.isInvalid)
        : undefined,
    validationState,
    validationBehavior,
    isDisabled,
    isReadOnly,
    isRequired,
    value:
      props.value !== undefined ? computed(() => props.value) : undefined,
    defaultValue: props.defaultValue,
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
    onInput: props.onInput,
    onChange: props.onChange,
    onFocus: props.onFocus,
    onBlur: props.onBlur,
  });

  return {
    isDisabled,
    isReadOnly,
    isRequired,
    validationState,
    validationBehavior,
    textField,
    inputRows: computed(() =>
      options.multiLine ? (options.rows as SpectrumTextAreaProps["rows"]) : undefined
    ),
  };
}
