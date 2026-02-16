import { filterDOMProps, mergeProps, useFormReset } from "@vue-aria/utils";
import { useControlledState } from "@vue-stately/utils";
import { useField } from "@vue-aria/label";
import { useFocusable } from "@vue-aria/interactions";
import { useFormValidation } from "@vue-aria/form";
import { useFormValidationState } from "@vue-stately/form";

type ValidateResult = boolean | string | string[] | null | undefined;
type ValidateFn = (value: string) => ValidateResult;

export interface AriaTextFieldOptions {
  inputElementType?: "input" | "textarea";
  isDisabled?: boolean;
  isRequired?: boolean;
  isReadOnly?: boolean;
  type?: string;
  pattern?: string;
  validationBehavior?: "aria" | "native";
  validationState?: "valid" | "invalid";
  isInvalid?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
  description?: string;
  errorMessage?: string;
  autoComplete?: string;
  autoCapitalize?: "off" | "none" | "on" | "sentences" | "words" | "characters";
  maxLength?: number;
  minLength?: number;
  name?: string;
  form?: string;
  placeholder?: string;
  inputMode?: string;
  autoCorrect?: string;
  spellCheck?: boolean;
  enterKeyHint?: "enter" | "done" | "go" | "next" | "previous" | "search" | "send";
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-errormessage"?: string;
  "aria-activedescendant"?: string;
  "aria-autocomplete"?: string;
  "aria-haspopup"?: string;
  "aria-controls"?: string;
  onCopy?: (event: ClipboardEvent) => void;
  onCut?: (event: ClipboardEvent) => void;
  onPaste?: (event: ClipboardEvent) => void;
  onCompositionEnd?: (event: CompositionEvent) => void;
  onCompositionStart?: (event: CompositionEvent) => void;
  onCompositionUpdate?: (event: CompositionEvent) => void;
  onSelect?: (event: Event) => void;
  onBeforeInput?: (event: InputEvent) => void;
  onInput?: (event: InputEvent) => void;
  onKeydown?: (event: KeyboardEvent) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyup?: (event: KeyboardEvent) => void;
  validate?: ValidateFn;
  [key: string]: unknown;
}

export interface TextFieldAria {
  inputProps: Record<string, unknown>;
  labelProps: Record<string, unknown>;
  descriptionProps: Record<string, unknown>;
  errorMessageProps: Record<string, unknown>;
  isInvalid: boolean;
  validationErrors: string[];
  validationDetails?: ValidityState | null;
}

export function useTextField(
  props: AriaTextFieldOptions,
  ref: { current: HTMLInputElement | HTMLTextAreaElement | null }
): TextFieldAria {
  const {
    inputElementType = "input",
    isDisabled = false,
    isRequired = false,
    isReadOnly = false,
    type = "text",
    validationBehavior = "aria",
  } = props;

  const [valueRef, setValue] = useControlledState<string, string>(
    () => props.value,
    () => props.defaultValue ?? "",
    props.onChange
  );

  const focusRef = {
    get value() {
      return ref.current;
    },
    set value(value: HTMLInputElement | HTMLTextAreaElement | null) {
      ref.current = value;
    },
  };
  const { focusableProps } = useFocusable(props as any, focusRef as any);
  const validationState = useFormValidationState({
    ...props,
    value: () => valueRef.value,
  });
  const { isInvalid, validationErrors, validationDetails } = validationState.displayValidation;
  const { labelProps, fieldProps, descriptionProps, errorMessageProps } = useField({
    ...props,
    isInvalid,
    errorMessage: props.errorMessage || validationErrors,
  });
  const domProps = { ...filterDOMProps(props, { labelable: true }) };
  if (inputElementType !== "input") {
    delete (domProps as { type?: unknown }).type;
    delete (domProps as { pattern?: unknown }).pattern;
  }

  const inputOnlyProps = {
    type,
    pattern: props.pattern,
  };

  const initialValue = valueRef.value;
  useFormReset(focusRef as any, props.defaultValue ?? initialValue, setValue);
  useFormValidation(
    {
      validationBehavior: props.validationBehavior,
      focus: () => ref.current?.focus(),
      value: () => valueRef.value,
    },
    validationState as any,
    focusRef as any
  );

  return {
    labelProps,
    inputProps: mergeProps(
      domProps,
      inputElementType === "input" ? inputOnlyProps : undefined,
      {
        disabled: isDisabled,
        readOnly: isReadOnly,
        required: isRequired && validationBehavior === "native",
        "aria-required": (isRequired && validationBehavior === "aria") || undefined,
        "aria-invalid": isInvalid || undefined,
        "aria-errormessage": props["aria-errormessage"],
        "aria-activedescendant": props["aria-activedescendant"],
        "aria-autocomplete": props["aria-autocomplete"],
        "aria-haspopup": props["aria-haspopup"],
        "aria-controls": props["aria-controls"],
        value: valueRef.value,
        onChange: (event: Event) => setValue((event.target as HTMLInputElement).value),
        autoComplete: props.autoComplete,
        autoCapitalize: props.autoCapitalize,
        maxLength: props.maxLength,
        minLength: props.minLength,
        name: props.name,
        form: props.form,
        placeholder: props.placeholder,
        inputMode: props.inputMode,
        autoCorrect: props.autoCorrect,
        spellCheck: props.spellCheck,
        enterKeyHint: props.enterKeyHint,
        onCopy: props.onCopy,
        onCut: props.onCut,
        onPaste: props.onPaste,
        onCompositionEnd: props.onCompositionEnd,
        onCompositionStart: props.onCompositionStart,
        onCompositionUpdate: props.onCompositionUpdate,
        onSelect: props.onSelect,
        onBeforeInput: props.onBeforeInput,
        onInput: props.onInput,
        onKeydown: props.onKeydown ?? props.onKeyDown,
        onKeyDown: props.onKeydown ?? props.onKeyDown,
        onKeyup: props.onKeyup,
        ...focusableProps,
        ...fieldProps,
      }
    ),
    descriptionProps,
    errorMessageProps,
    isInvalid,
    validationErrors,
    validationDetails,
  };
}
