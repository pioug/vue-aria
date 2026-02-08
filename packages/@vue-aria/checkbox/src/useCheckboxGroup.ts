import { computed, toValue, watchEffect } from "vue";
import { useFocusWithin } from "@vue-aria/interactions";
import { useField } from "@vue-aria/label";
import { filterDOMProps } from "@vue-aria/utils";
import { mergeProps } from "@vue-aria/utils";
import { checkboxGroupData } from "./utils";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";

type ValidationBehavior = "aria" | "native";

export interface UseCheckboxGroupState {
  value: MaybeReactive<readonly string[]>;
  isDisabled?: MaybeReactive<boolean | undefined>;
  isReadOnly?: MaybeReactive<boolean | undefined>;
  isRequired?: MaybeReactive<boolean | undefined>;
  isInvalid?: MaybeReactive<boolean | undefined>;
  validationState?: MaybeReactive<"valid" | "invalid" | undefined>;
  isSelected: (value: string) => boolean;
  addValue: (value: string) => void;
  removeValue: (value: string) => void;
  toggleValue: (value: string) => void;
}

export interface UseCheckboxGroupOptions {
  id?: MaybeReactive<string | undefined>;
  label?: MaybeReactive<string | undefined>;
  description?: MaybeReactive<string | undefined>;
  errorMessage?: MaybeReactive<string | undefined>;
  name?: MaybeReactive<string | undefined>;
  form?: MaybeReactive<string | undefined>;
  isDisabled?: MaybeReactive<boolean | undefined>;
  isInvalid?: MaybeReactive<boolean | undefined>;
  validationState?: MaybeReactive<"valid" | "invalid" | undefined>;
  validationBehavior?: MaybeReactive<ValidationBehavior | undefined>;
  "aria-label"?: MaybeReactive<string | undefined>;
  "aria-labelledby"?: MaybeReactive<string | undefined>;
  "aria-describedby"?: MaybeReactive<string | undefined>;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onFocusChange?: (isFocused: boolean) => void;
  class?: MaybeReactive<string | undefined>;
  style?: MaybeReactive<Record<string, unknown> | string | undefined>;
  [key: string]: unknown;
}

export interface UseCheckboxGroupResult {
  groupProps: ReadonlyRef<Record<string, unknown>>;
  labelProps: ReadonlyRef<Record<string, unknown>>;
  descriptionProps: ReadonlyRef<Record<string, unknown>>;
  errorMessageProps: ReadonlyRef<Record<string, unknown>>;
  isInvalid: ReadonlyRef<boolean>;
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

function resolveValidationBehavior(
  value: MaybeReactive<ValidationBehavior | undefined> | undefined
): ValidationBehavior {
  if (value === undefined) {
    return "aria";
  }

  return toValue(value) ?? "aria";
}

export function useCheckboxGroup(
  options: UseCheckboxGroupOptions = {},
  state: UseCheckboxGroupState
): UseCheckboxGroupResult {
  const isDisabled = computed(
    () => resolveBoolean(options.isDisabled) || resolveBoolean(state.isDisabled)
  );

  const isInvalid = computed(() => {
    const explicitInvalid = resolveBoolean(options.isInvalid);
    const optionValidationState =
      options.validationState === undefined
        ? undefined
        : toValue(options.validationState);
    const stateInvalid = resolveBoolean(state.isInvalid);
    const stateValidationState =
      state.validationState === undefined ? undefined : toValue(state.validationState);

    return (
      explicitInvalid ||
      optionValidationState === "invalid" ||
      stateInvalid ||
      stateValidationState === "invalid"
    );
  });

  const validationBehavior = computed(() =>
    resolveValidationBehavior(options.validationBehavior)
  );

  const { labelProps, fieldProps, descriptionProps, errorMessageProps } = useField({
    id: options.id,
    label: options.label,
    labelElementType: "span",
    description: options.description,
    errorMessage: options.errorMessage,
    isInvalid,
    validationState: options.validationState,
    "aria-label": options["aria-label"],
    "aria-labelledby": options["aria-labelledby"],
    "aria-describedby": options["aria-describedby"],
  });

  watchEffect(() => {
    checkboxGroupData.set(state as object, {
      name: options.name === undefined ? undefined : toValue(options.name),
      form: options.form === undefined ? undefined : toValue(options.form),
      descriptionId:
        typeof descriptionProps.value.id === "string"
          ? (descriptionProps.value.id as string)
          : undefined,
      errorMessageId:
        typeof errorMessageProps.value.id === "string"
          ? (errorMessageProps.value.id as string)
          : undefined,
      validationBehavior: validationBehavior.value,
    });
  });

  const { focusWithinProps } = useFocusWithin({
    onBlurWithin: options.onBlur,
    onFocusWithin: options.onFocus,
    onFocusWithinChange: options.onFocusChange,
  });

  const domProps = filterDOMProps(options as Record<string, unknown>);
  const groupProps = computed<Record<string, unknown>>(() =>
    mergeProps(domProps, fieldProps.value, focusWithinProps, {
      role: "group",
      "aria-disabled": isDisabled.value || undefined,
    })
  );

  return {
    groupProps,
    labelProps,
    descriptionProps,
    errorMessageProps,
    isInvalid,
  };
}
