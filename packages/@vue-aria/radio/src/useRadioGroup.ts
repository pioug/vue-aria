import { computed, toValue, watchEffect } from "vue";
import { useId } from "@vue-aria/ssr";
import { useFocusWithin } from "@vue-aria/interactions";
import { useField } from "@vue-aria/label";
import { filterDOMProps } from "@vue-aria/utils";
import { mergeProps } from "@vue-aria/utils";
import { radioGroupData } from "./utils";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";

type ValidationBehavior = "aria" | "native";
type Orientation = "vertical" | "horizontal";
type Direction = "ltr" | "rtl";

export interface UseRadioGroupState {
  selectedValue: MaybeReactive<string | null | undefined>;
  setSelectedValue: (value: string | null) => void;
  lastFocusedValue?: MaybeReactive<string | null | undefined>;
  setLastFocusedValue?: (value: string | null) => void;
  isDisabled?: MaybeReactive<boolean | undefined>;
  isReadOnly?: MaybeReactive<boolean | undefined>;
  isRequired?: MaybeReactive<boolean | undefined>;
  isInvalid?: MaybeReactive<boolean | undefined>;
  validationState?: MaybeReactive<"valid" | "invalid" | undefined>;
}

export interface UseRadioGroupOptions {
  id?: MaybeReactive<string | undefined>;
  label?: MaybeReactive<string | undefined>;
  description?: MaybeReactive<string | undefined>;
  errorMessage?: MaybeReactive<string | undefined>;
  name?: MaybeReactive<string | undefined>;
  form?: MaybeReactive<string | undefined>;
  isDisabled?: MaybeReactive<boolean | undefined>;
  isReadOnly?: MaybeReactive<boolean | undefined>;
  isRequired?: MaybeReactive<boolean | undefined>;
  isInvalid?: MaybeReactive<boolean | undefined>;
  validationState?: MaybeReactive<"valid" | "invalid" | undefined>;
  validationBehavior?: MaybeReactive<ValidationBehavior | undefined>;
  orientation?: MaybeReactive<Orientation | undefined>;
  direction?: MaybeReactive<Direction | undefined>;
  "aria-label"?: MaybeReactive<string | undefined>;
  "aria-labelledby"?: MaybeReactive<string | undefined>;
  "aria-describedby"?: MaybeReactive<string | undefined>;
  "aria-errormessage"?: MaybeReactive<string | undefined>;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onFocusChange?: (isFocused: boolean) => void;
  class?: MaybeReactive<string | undefined>;
  style?: MaybeReactive<Record<string, unknown> | string | undefined>;
  [key: string]: unknown;
}

export interface UseRadioGroupResult {
  radioGroupProps: ReadonlyRef<Record<string, unknown>>;
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

function resolveOrientation(
  value: MaybeReactive<Orientation | undefined> | undefined
): Orientation {
  if (value === undefined) {
    return "vertical";
  }

  return toValue(value) ?? "vertical";
}

function resolveDirection(
  value: MaybeReactive<Direction | undefined> | undefined
): Direction {
  if (value === undefined) {
    return "ltr";
  }

  return toValue(value) ?? "ltr";
}

function getFocusableRadios(container: HTMLElement): HTMLInputElement[] {
  return Array.from(
    container.querySelectorAll<HTMLInputElement>('input[type="radio"]:not([disabled])')
  );
}

export function useRadioGroup(
  options: UseRadioGroupOptions = {},
  state: UseRadioGroupState
): UseRadioGroupResult {
  const orientation = computed(() => resolveOrientation(options.orientation));
  const direction = computed(() => resolveDirection(options.direction));
  const validationBehavior = computed(() =>
    resolveValidationBehavior(options.validationBehavior)
  );

  const isDisabled = computed(
    () => resolveBoolean(options.isDisabled) || resolveBoolean(state.isDisabled)
  );
  const isReadOnly = computed(
    () => resolveBoolean(options.isReadOnly) || resolveBoolean(state.isReadOnly)
  );
  const isRequired = computed(
    () => resolveBoolean(options.isRequired) || resolveBoolean(state.isRequired)
  );

  const selectedValue = computed(() => {
    const value = toValue(state.selectedValue);
    return value === undefined ? null : value;
  });

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

  const groupName = useId(options.name, "v-aria-radiogroup");

  watchEffect(() => {
    radioGroupData.set(state as object, {
      name: groupName.value,
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
    onBlurWithin: (event) => {
      options.onBlur?.(event);
      if (selectedValue.value === null) {
        state.setLastFocusedValue?.(null);
      }
    },
    onFocusWithin: options.onFocus,
    onFocusWithinChange: options.onFocusChange,
  });

  const onKeydown = (event: KeyboardEvent) => {
    let directionStep: "next" | "prev" | null = null;
    switch (event.key) {
      case "ArrowRight":
        directionStep =
          direction.value === "rtl" && orientation.value !== "vertical"
            ? "prev"
            : "next";
        break;
      case "ArrowLeft":
        directionStep =
          direction.value === "rtl" && orientation.value !== "vertical"
            ? "next"
            : "prev";
        break;
      case "ArrowDown":
        directionStep = "next";
        break;
      case "ArrowUp":
        directionStep = "prev";
        break;
      default:
        return;
    }

    const container = event.currentTarget;
    if (!(container instanceof HTMLElement)) {
      return;
    }

    const radios = getFocusableRadios(container);
    if (radios.length === 0) {
      return;
    }

    event.preventDefault();

    const target = event.target;
    let currentIndex = radios.findIndex((radio) => radio === target);

    if (currentIndex < 0 && selectedValue.value !== null) {
      currentIndex = radios.findIndex((radio) => radio.value === selectedValue.value);
    }

    if (currentIndex < 0) {
      currentIndex = 0;
    }

    const nextIndex =
      directionStep === "next"
        ? (currentIndex + 1) % radios.length
        : (currentIndex - 1 + radios.length) % radios.length;
    const nextRadio = radios[nextIndex];

    nextRadio.focus();
    state.setSelectedValue(nextRadio.value);
  };

  const domProps = filterDOMProps(options as Record<string, unknown>);

  const radioGroupProps = computed<Record<string, unknown>>(() =>
    mergeProps(domProps, fieldProps.value, focusWithinProps, {
      role: "radiogroup",
      onKeydown,
      "aria-invalid": isInvalid.value || undefined,
      "aria-errormessage":
        options["aria-errormessage"] === undefined
          ? undefined
          : toValue(options["aria-errormessage"]),
      "aria-readonly": isReadOnly.value || undefined,
      "aria-required": isRequired.value || undefined,
      "aria-disabled": isDisabled.value || undefined,
      "aria-orientation": orientation.value,
    })
  );

  return {
    radioGroupProps,
    labelProps,
    descriptionProps,
    errorMessageProps,
    isInvalid,
  };
}
