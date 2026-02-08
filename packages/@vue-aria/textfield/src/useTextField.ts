import { computed, ref, toValue } from "vue";
import { useField } from "@vue-aria/label";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";

type InputElementType = "input" | "textarea";
type ValidationBehavior = "aria" | "native";

export interface UseTextFieldOptions {
  inputElementType?: MaybeReactive<InputElementType | undefined>;
  id?: MaybeReactive<string | undefined>;
  label?: MaybeReactive<string | undefined>;
  labelElementType?: MaybeReactive<"label" | "span" | "div">;
  description?: MaybeReactive<string | undefined>;
  errorMessage?: MaybeReactive<string | undefined>;
  isInvalid?: MaybeReactive<boolean | undefined>;
  validationState?: MaybeReactive<"valid" | "invalid" | undefined>;
  validationBehavior?: MaybeReactive<ValidationBehavior | undefined>;
  isDisabled?: MaybeReactive<boolean | undefined>;
  isRequired?: MaybeReactive<boolean | undefined>;
  isReadOnly?: MaybeReactive<boolean | undefined>;
  value?: MaybeReactive<string | undefined>;
  defaultValue?: MaybeReactive<string | undefined>;
  type?: MaybeReactive<string | undefined>;
  pattern?: MaybeReactive<string | undefined>;
  autoComplete?: MaybeReactive<string | undefined>;
  autoCapitalize?: MaybeReactive<
    "off" | "none" | "on" | "sentences" | "words" | "characters" | undefined
  >;
  maxLength?: MaybeReactive<number | undefined>;
  minLength?: MaybeReactive<number | undefined>;
  name?: MaybeReactive<string | undefined>;
  form?: MaybeReactive<string | undefined>;
  placeholder?: MaybeReactive<string | undefined>;
  inputMode?: MaybeReactive<string | undefined>;
  autoCorrect?: MaybeReactive<string | undefined>;
  spellCheck?: MaybeReactive<boolean | undefined>;
  enterKeyHint?: MaybeReactive<
    "enter" | "done" | "go" | "next" | "previous" | "search" | "send" | undefined
  >;
  autoFocus?: MaybeReactive<boolean | undefined>;
  "aria-label"?: MaybeReactive<string | undefined>;
  "aria-labelledby"?: MaybeReactive<string | undefined>;
  "aria-describedby"?: MaybeReactive<string | undefined>;
  "aria-errormessage"?: MaybeReactive<string | undefined>;
  "aria-activedescendant"?: MaybeReactive<string | undefined>;
  "aria-autocomplete"?: MaybeReactive<string | undefined>;
  "aria-haspopup"?: MaybeReactive<string | undefined>;
  "aria-controls"?: MaybeReactive<string | undefined>;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onKeydown?: (event: KeyboardEvent) => void;
  onKeyup?: (event: KeyboardEvent) => void;
  onCopy?: (event: ClipboardEvent) => void;
  onCut?: (event: ClipboardEvent) => void;
  onPaste?: (event: ClipboardEvent) => void;
  onCompositionStart?: (event: CompositionEvent) => void;
  onCompositionEnd?: (event: CompositionEvent) => void;
  onCompositionUpdate?: (event: CompositionEvent) => void;
  onSelect?: (event: Event) => void;
  onBeforeInput?: (event: InputEvent) => void;
  onInput?: (event: Event) => void;
  onChange?: (value: string) => void;
}

export interface UseTextFieldResult {
  labelProps: ReadonlyRef<Record<string, unknown>>;
  inputProps: ReadonlyRef<Record<string, unknown>>;
  descriptionProps: ReadonlyRef<Record<string, unknown>>;
  errorMessageProps: ReadonlyRef<Record<string, unknown>>;
  isInvalid: ReadonlyRef<boolean>;
}

export function useTextField(options: UseTextFieldOptions = {}): UseTextFieldResult {
  const inputElementType = computed<InputElementType>(() => {
    const value =
      options.inputElementType === undefined
        ? undefined
        : toValue(options.inputElementType);
    return value ?? "input";
  });

  const isDisabled = computed(() =>
    options.isDisabled === undefined ? false : Boolean(toValue(options.isDisabled))
  );
  const isRequired = computed(() =>
    options.isRequired === undefined ? false : Boolean(toValue(options.isRequired))
  );
  const isReadOnly = computed(() =>
    options.isReadOnly === undefined ? false : Boolean(toValue(options.isReadOnly))
  );
  const validationBehavior = computed<ValidationBehavior>(() => {
    const value =
      options.validationBehavior === undefined
        ? undefined
        : toValue(options.validationBehavior);
    return value ?? "aria";
  });
  const isInvalid = computed(() => {
    const explicitInvalid =
      options.isInvalid === undefined ? false : Boolean(toValue(options.isInvalid));
    const validationState =
      options.validationState === undefined
        ? undefined
        : toValue(options.validationState);
    return explicitInvalid || validationState === "invalid";
  });

  const uncontrolledValue = ref(
    options.defaultValue === undefined
      ? ""
      : (toValue(options.defaultValue) ?? "")
  );

  const value = computed<string>(() => {
    if (options.value !== undefined) {
      return toValue(options.value) ?? "";
    }
    return uncontrolledValue.value;
  });

  const setValue = (nextValue: string) => {
    if (options.value === undefined) {
      uncontrolledValue.value = nextValue;
    }
    options.onChange?.(nextValue);
  };

  const { labelProps, fieldProps, descriptionProps, errorMessageProps } = useField({
    id: options.id,
    label: options.label,
    labelElementType: options.labelElementType,
    description: options.description,
    errorMessage: options.errorMessage,
    isInvalid,
    validationState: options.validationState,
    "aria-label": options["aria-label"],
    "aria-labelledby": options["aria-labelledby"],
    "aria-describedby": options["aria-describedby"],
  });

  const inputProps = computed<Record<string, unknown>>(() => {
    const props: Record<string, unknown> = {
      ...fieldProps.value,
      disabled: isDisabled.value,
      readOnly: isReadOnly.value,
      required:
        isRequired.value && validationBehavior.value === "native"
          ? true
          : undefined,
      "aria-required":
        isRequired.value && validationBehavior.value === "aria" ? true : undefined,
      "aria-invalid": isInvalid.value || undefined,
      "aria-errormessage":
        options["aria-errormessage"] === undefined
          ? undefined
          : toValue(options["aria-errormessage"]),
      "aria-activedescendant":
        options["aria-activedescendant"] === undefined
          ? undefined
          : toValue(options["aria-activedescendant"]),
      "aria-autocomplete":
        options["aria-autocomplete"] === undefined
          ? undefined
          : toValue(options["aria-autocomplete"]),
      "aria-haspopup":
        options["aria-haspopup"] === undefined
          ? undefined
          : toValue(options["aria-haspopup"]),
      "aria-controls":
        options["aria-controls"] === undefined
          ? undefined
          : toValue(options["aria-controls"]),
      value: value.value,
      autoComplete:
        options.autoComplete === undefined ? undefined : toValue(options.autoComplete),
      autoCapitalize:
        options.autoCapitalize === undefined
          ? undefined
          : toValue(options.autoCapitalize),
      maxLength: options.maxLength === undefined ? undefined : toValue(options.maxLength),
      minLength: options.minLength === undefined ? undefined : toValue(options.minLength),
      name: options.name === undefined ? undefined : toValue(options.name),
      form: options.form === undefined ? undefined : toValue(options.form),
      placeholder:
        options.placeholder === undefined ? undefined : toValue(options.placeholder),
      inputMode:
        options.inputMode === undefined ? undefined : toValue(options.inputMode),
      autoCorrect:
        options.autoCorrect === undefined ? undefined : toValue(options.autoCorrect),
      spellCheck:
        options.spellCheck === undefined ? undefined : toValue(options.spellCheck),
      enterKeyHint:
        options.enterKeyHint === undefined ? undefined : toValue(options.enterKeyHint),
      autoFocus:
        options.autoFocus === undefined ? false : Boolean(toValue(options.autoFocus)),
      onChange: (event: Event) => {
        const target = event.target as HTMLInputElement | HTMLTextAreaElement | null;
        setValue(target?.value ?? "");
      },
      onInput: (event: Event) => {
        const target = event.target as HTMLInputElement | HTMLTextAreaElement | null;
        setValue(target?.value ?? "");
        options.onInput?.(event);
      },
      onFocus: options.onFocus,
      onBlur: options.onBlur,
      onKeydown: options.onKeydown,
      onKeyup: options.onKeyup,
      onCopy: options.onCopy,
      onCut: options.onCut,
      onPaste: options.onPaste,
      onCompositionStart: options.onCompositionStart,
      onCompositionEnd: options.onCompositionEnd,
      onCompositionUpdate: options.onCompositionUpdate,
      onSelect: options.onSelect,
      onBeforeInput: options.onBeforeInput,
    };

    if (inputElementType.value === "input") {
      props.type = options.type === undefined ? "text" : toValue(options.type);
      props.pattern = options.pattern === undefined ? undefined : toValue(options.pattern);
    }

    return props;
  });

  return {
    labelProps,
    inputProps,
    descriptionProps,
    errorMessageProps,
    isInvalid,
  };
}
