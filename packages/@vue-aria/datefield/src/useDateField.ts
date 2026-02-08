import { computed, getCurrentScope, onMounted, ref, toValue } from "vue";
import { useField } from "@vue-aria/label";
import { useFocusWithin } from "@vue-aria/interactions";
import { useDescription } from "@vue-aria/utils";
import { mergeProps } from "@vue-aria/utils";
import { createFocusManager } from "./focusManager";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type {
  DateFieldDisplayValidation,
  DateFieldHookData,
  FocusManager,
  UseDateFieldState,
} from "./types";

export interface UseDateFieldOptions {
  id?: MaybeReactive<string | undefined>;
  label?: MaybeReactive<string | undefined>;
  description?: MaybeReactive<string | undefined>;
  errorMessage?: MaybeReactive<string | undefined>;
  isDisabled?: MaybeReactive<boolean | undefined>;
  isRequired?: MaybeReactive<boolean | undefined>;
  isInvalid?: MaybeReactive<boolean | undefined>;
  validationState?: MaybeReactive<"valid" | "invalid" | undefined>;
  validationBehavior?: MaybeReactive<"aria" | "native" | undefined>;
  name?: MaybeReactive<string | undefined>;
  form?: MaybeReactive<string | undefined>;
  autoFocus?: MaybeReactive<boolean | undefined>;
  "aria-label"?: MaybeReactive<string | undefined>;
  "aria-labelledby"?: MaybeReactive<string | undefined>;
  "aria-describedby"?: MaybeReactive<string | undefined>;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onFocusChange?: (isFocused: boolean) => void;
  onKeydown?: (event: KeyboardEvent) => void;
  onKeyup?: (event: KeyboardEvent) => void;
  class?: MaybeReactive<string | undefined>;
  style?: MaybeReactive<Record<string, unknown> | string | undefined>;
  [key: string]: unknown;
}

export interface UseDateFieldResult {
  labelProps: ReadonlyRef<Record<string, unknown>>;
  fieldProps: ReadonlyRef<Record<string, unknown>>;
  inputProps: ReadonlyRef<Record<string, unknown>>;
  descriptionProps: ReadonlyRef<Record<string, unknown>>;
  errorMessageProps: ReadonlyRef<Record<string, unknown>>;
  isInvalid: ReadonlyRef<boolean>;
  validationErrors: ReadonlyRef<string[]>;
  validationDetails: ReadonlyRef<unknown>;
}

const symbolSeed = Date.now();
export const roleSymbol = `__role_${symbolSeed}`;
export const focusManagerSymbol = `__focusManager_${symbolSeed}`;

export const hookData: WeakMap<object, DateFieldHookData> = new WeakMap();

function toDisplayValidation(
  state: UseDateFieldState
): DateFieldDisplayValidation | undefined {
  return state.displayValidation === undefined
    ? undefined
    : toValue(state.displayValidation);
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }
  return Boolean(toValue(value));
}

function valueToString(value: unknown): string {
  if (value == null) {
    return "";
  }
  if (typeof value === "object" && "toString" in (value as object)) {
    return String((value as { toString: () => string }).toString());
  }
  return String(value);
}

function collectDOMProps(options: UseDateFieldOptions): Record<string, unknown> {
  const domProps: Record<string, unknown> = {};

  for (const [key, rawValue] of Object.entries(options)) {
    if (
      key.startsWith("data-") ||
      key === "class" ||
      key === "style" ||
      key === "slot"
    ) {
      domProps[key] = rawValue;
    }
  }

  return domProps;
}

export function useDateField(
  options: UseDateFieldOptions,
  state: UseDateFieldState,
  fieldRef: MaybeReactive<Element | null | undefined>
): UseDateFieldResult {
  const displayValidation = computed(() => toDisplayValidation(state));
  const validationErrors = computed(
    () => displayValidation.value?.validationErrors ?? []
  );
  const validationDetails = computed(
    () => displayValidation.value?.validationDetails
  );
  const isInvalid = computed(() => {
    const fromState = Boolean(displayValidation.value?.isInvalid);
    const explicitInvalid = resolveBoolean(options.isInvalid);
    const optionValidationState =
      options.validationState === undefined
        ? undefined
        : toValue(options.validationState);
    return fromState || explicitInvalid || optionValidationState === "invalid";
  });
  const isDisabled = computed(
    () => resolveBoolean(options.isDisabled) || resolveBoolean(state.isDisabled)
  );
  const isRequired = computed(
    () => resolveBoolean(options.isRequired) || resolveBoolean(state.isRequired)
  );
  const resolvedErrorMessage = computed<string | undefined>(() => {
    if (options.errorMessage !== undefined) {
      return toValue(options.errorMessage);
    }
    if (validationErrors.value.length === 0) {
      return undefined;
    }
    return validationErrors.value.join(" ");
  });

  const { labelProps: baseLabelProps, fieldProps, descriptionProps, errorMessageProps } =
    useField({
      id: options.id,
      label: options.label,
      labelElementType: "span",
      description: options.description,
      errorMessage: resolvedErrorMessage,
      isInvalid,
      validationState: options.validationState,
      "aria-label": options["aria-label"],
      "aria-labelledby": options["aria-labelledby"],
      "aria-describedby": options["aria-describedby"],
    });

  const valueOnFocus = ref("");
  const { focusWithinProps } = useFocusWithin({
    onFocusWithin: (event) => {
      valueOnFocus.value = valueToString(
        state.value === undefined ? undefined : toValue(state.value)
      );
      options.onFocus?.(event);
    },
    onBlurWithin: (event) => {
      state.confirmPlaceholder();
      const currentValue = valueToString(
        state.value === undefined ? undefined : toValue(state.value)
      );
      if (currentValue !== valueOnFocus.value) {
        state.commitValidation();
      }
      options.onBlur?.(event);
    },
    onFocusWithinChange: options.onFocusChange,
  });

  const selectedValueDescription = computed(() => {
    const value = state.value === undefined ? undefined : toValue(state.value);
    if (!value) {
      return "";
    }

    const granularity = state.maxGranularity === undefined ? undefined : toValue(state.maxGranularity);
    const field = granularity === "hour" ? "time" : "date";
    return `Selected ${field}: ${valueToString(value)}`;
  });

  const selectedDescription = useDescription(selectedValueDescription);
  const describedBy = computed(() => {
    const baseDescribedBy =
      typeof fieldProps.value["aria-describedby"] === "string"
        ? (fieldProps.value["aria-describedby"] as string)
        : undefined;

    if (options[roleSymbol] === "presentation") {
      return baseDescribedBy;
    }

    const extra =
      typeof selectedDescription.descriptionProps.value["aria-describedby"] === "string"
        ? (selectedDescription.descriptionProps.value["aria-describedby"] as string)
        : undefined;
    return [extra, baseDescribedBy].filter(Boolean).join(" ") || undefined;
  });

  const focusManager = computed<FocusManager>(() => {
    const provided = options[focusManagerSymbol];
    if (
      provided &&
      typeof provided === "object" &&
      "focusFirst" in (provided as object) &&
      "focusNext" in (provided as object) &&
      "focusPrevious" in (provided as object)
    ) {
      return provided as FocusManager;
    }
    return createFocusManager(fieldRef);
  });

  hookData.set(state as object, {
    ariaLabel:
      options["aria-label"] === undefined ? undefined : toValue(options["aria-label"]),
    ariaLabelledBy: [
      baseLabelProps.value.id,
      options["aria-labelledby"] === undefined
        ? undefined
        : toValue(options["aria-labelledby"]),
    ]
      .filter(Boolean)
      .join(" ") || undefined,
    ariaDescribedBy: describedBy.value,
    focusManager: focusManager.value,
  });

  if (getCurrentScope()) {
    onMounted(() => {
      if (options.autoFocus !== undefined && Boolean(toValue(options.autoFocus))) {
        focusManager.value.focusFirst();
      }
    });
  } else if (options.autoFocus !== undefined && Boolean(toValue(options.autoFocus))) {
    focusManager.value.focusFirst();
  }

  const fieldDOMProps = computed<Record<string, unknown>>(() => {
    if (options[roleSymbol] === "presentation") {
      return { role: "presentation" };
    }

    return {
      ...fieldProps.value,
      role: "group",
      "aria-disabled": isDisabled.value || undefined,
      "aria-describedby": describedBy.value,
    };
  });

  const inputProps = computed<Record<string, unknown>>(() => {
    const value = state.value === undefined ? undefined : toValue(state.value);
    const props: Record<string, unknown> = {
      type: "hidden",
      name: options.name === undefined ? undefined : toValue(options.name),
      form: options.form === undefined ? undefined : toValue(options.form),
      value: valueToString(value),
      disabled: isDisabled.value,
    };

    const behavior =
      options.validationBehavior === undefined
        ? "aria"
        : (toValue(options.validationBehavior) ?? "aria");

    if (behavior === "native") {
      props.type = "text";
      props.hidden = true;
      props.required = isRequired.value;
      props.onChange = () => {};
    }

    return props;
  });

  const domProps = collectDOMProps(options);
  const labelProps = computed<Record<string, unknown>>(() =>
    mergeProps(baseLabelProps.value, {
      onClick: () => {
        focusManager.value.focusFirst();
      },
    })
  );

  const combinedFieldProps = computed<Record<string, unknown>>(() =>
    mergeProps(domProps, fieldDOMProps.value, focusWithinProps, {
      onKeydown: (event: KeyboardEvent) => {
        options.onKeydown?.(event);
      },
      onKeyup: (event: KeyboardEvent) => {
        options.onKeyup?.(event);
      },
      style: {
        unicodeBidi: "isolate",
      },
    })
  );

  return {
    labelProps,
    fieldProps: combinedFieldProps,
    inputProps,
    descriptionProps,
    errorMessageProps,
    isInvalid,
    validationErrors,
    validationDetails,
  };
}
