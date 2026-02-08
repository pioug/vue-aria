import { computed, toValue } from "vue";
import { usePress } from "@vue-aria/interactions";
import { mergeProps } from "@vue-aria/utils";
import type { MaybeReactive, PressEvent, ReadonlyRef } from "@vue-aria/types";

type ValidationBehavior = "aria" | "native";

export interface UseCheckboxState {
  isSelected: MaybeReactive<boolean>;
  setSelected: (isSelected: boolean) => void;
  toggle: () => void;
}

export interface UseCheckboxOptions {
  value?: MaybeReactive<string | undefined>;
  name?: MaybeReactive<string | undefined>;
  form?: MaybeReactive<string | undefined>;
  isDisabled?: MaybeReactive<boolean | undefined>;
  isReadOnly?: MaybeReactive<boolean | undefined>;
  isRequired?: MaybeReactive<boolean | undefined>;
  isInvalid?: MaybeReactive<boolean | undefined>;
  validationState?: MaybeReactive<"valid" | "invalid" | undefined>;
  validationBehavior?: MaybeReactive<ValidationBehavior | undefined>;
  isIndeterminate?: MaybeReactive<boolean | undefined>;
  "aria-label"?: MaybeReactive<string | undefined>;
  "aria-labelledby"?: MaybeReactive<string | undefined>;
  "aria-describedby"?: MaybeReactive<string | undefined>;
  "aria-errormessage"?: MaybeReactive<string | undefined>;
  "aria-controls"?: MaybeReactive<string | undefined>;
  onPressStart?: (event: PressEvent) => void;
  onPressEnd?: (event: PressEvent) => void;
  onPress?: (event: PressEvent) => void;
  onChange?: (isSelected: boolean) => void;
}

export interface UseCheckboxResult {
  labelProps: ReadonlyRef<Record<string, unknown>>;
  inputProps: ReadonlyRef<Record<string, unknown>>;
  isSelected: ReadonlyRef<boolean>;
  isPressed: ReadonlyRef<boolean>;
  isDisabled: ReadonlyRef<boolean>;
  isReadOnly: ReadonlyRef<boolean>;
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

export function useCheckbox(
  options: UseCheckboxOptions = {},
  state: UseCheckboxState,
  inputRef?: MaybeReactive<HTMLInputElement | null | undefined>
): UseCheckboxResult {
  const isSelected = computed(() => Boolean(toValue(state.isSelected)));
  const isDisabled = computed(() => resolveBoolean(options.isDisabled));
  const isReadOnly = computed(() => resolveBoolean(options.isReadOnly));
  const isRequired = computed(() => resolveBoolean(options.isRequired));
  const validationBehavior = computed(() =>
    resolveValidationBehavior(options.validationBehavior)
  );
  const isInvalid = computed(() => {
    const explicitInvalid = resolveBoolean(options.isInvalid);
    const validationState =
      options.validationState === undefined
        ? undefined
        : toValue(options.validationState);
    return explicitInvalid || validationState === "invalid";
  });

  const { pressProps, isPressed: isInputPressed } = usePress({
    isDisabled,
    disableKeyboard: true,
    onPressStart: options.onPressStart,
    onPressEnd: options.onPressEnd,
    onPress: options.onPress,
  });

  const { pressProps: labelPressProps, isPressed: isLabelPressed } = usePress({
    isDisabled: computed(() => isDisabled.value || isReadOnly.value),
    disableKeyboard: true,
    onPressStart: options.onPressStart,
    onPressEnd: options.onPressEnd,
    onPress: (event) => {
      state.toggle();
      options.onPress?.(event);
      const element = inputRef === undefined ? undefined : toValue(inputRef);
      element?.focus();
    },
  });

  const onChange = (event: Event) => {
    event.stopPropagation();

    if (isDisabled.value || isReadOnly.value) {
      return;
    }

    const target = event.target as HTMLInputElement | null;
    const nextSelected = target?.checked ?? !isSelected.value;
    state.setSelected(nextSelected);
    options.onChange?.(nextSelected);
  };

  const labelProps = computed<Record<string, unknown>>(() =>
    mergeProps(labelPressProps, {
      onClick: (event: MouseEvent) => event.preventDefault(),
      onMousedown: (event: MouseEvent) => event.preventDefault(),
    })
  );

  const inputProps = computed<Record<string, unknown>>(() =>
    mergeProps(pressProps, {
      type: "checkbox",
      checked: isSelected.value,
      disabled: isDisabled.value,
      "aria-invalid": isInvalid.value || undefined,
      "aria-errormessage":
        options["aria-errormessage"] === undefined
          ? undefined
          : toValue(options["aria-errormessage"]),
      "aria-controls":
        options["aria-controls"] === undefined
          ? undefined
          : toValue(options["aria-controls"]),
      "aria-readonly": isReadOnly.value || undefined,
      "aria-required":
        isRequired.value && validationBehavior.value === "aria"
          ? true
          : undefined,
      required:
        isRequired.value && validationBehavior.value === "native" ? true : undefined,
      value: options.value === undefined ? undefined : toValue(options.value),
      name: options.name === undefined ? undefined : toValue(options.name),
      form: options.form === undefined ? undefined : toValue(options.form),
      indeterminate:
        options.isIndeterminate === undefined
          ? undefined
          : Boolean(toValue(options.isIndeterminate)),
      "aria-label":
        options["aria-label"] === undefined
          ? undefined
          : toValue(options["aria-label"]),
      "aria-labelledby":
        options["aria-labelledby"] === undefined
          ? undefined
          : toValue(options["aria-labelledby"]),
      "aria-describedby":
        options["aria-describedby"] === undefined
          ? undefined
          : toValue(options["aria-describedby"]),
      onChange,
    })
  );

  const isPressed = computed(() => isInputPressed.value || isLabelPressed.value);

  return {
    labelProps,
    inputProps,
    isSelected,
    isPressed,
    isDisabled,
    isReadOnly,
    isInvalid,
  };
}
