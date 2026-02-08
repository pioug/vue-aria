import { computed, ref, toValue } from "vue";
import { useField } from "@vue-aria/label";
import {
  roleSymbol,
  type DateFieldDisplayValidation,
} from "@vue-aria/datefield";
import { useDatePickerGroup } from "./useDatePickerGroup";
import { useDescription } from "@vue-aria/utils";
import { filterDOMProps } from "@vue-aria/utils";
import { mergeProps } from "@vue-aria/utils";
import { nodeContains } from "@vue-aria/utils";
import { useId } from "@vue-aria/ssr";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { DateLike, UseDatePickerState } from "./types";
import { privateValidationStateSymbol } from "./privateValidation";

type MaybeValidationMessage =
  | string
  | ((validation: DateFieldDisplayValidation) => string)
  | undefined;

export interface UseDatePickerOptions {
  id?: MaybeReactive<string | undefined>;
  label?: MaybeReactive<string | undefined>;
  description?: MaybeReactive<string | undefined>;
  errorMessage?: MaybeReactive<MaybeValidationMessage>;
  isDisabled?: MaybeReactive<boolean | undefined>;
  isReadOnly?: MaybeReactive<boolean | undefined>;
  isRequired?: MaybeReactive<boolean | undefined>;
  isInvalid?: MaybeReactive<boolean | undefined>;
  validationState?: MaybeReactive<"valid" | "invalid" | undefined>;
  validationBehavior?: MaybeReactive<"aria" | "native" | undefined>;
  name?: MaybeReactive<string | undefined>;
  form?: MaybeReactive<string | undefined>;
  autoFocus?: MaybeReactive<boolean | undefined>;
  placeholderValue?: MaybeReactive<DateLike | null | undefined>;
  hideTimeZone?: MaybeReactive<boolean | undefined>;
  hourCycle?: MaybeReactive<12 | 24 | undefined>;
  shouldForceLeadingZeros?: MaybeReactive<boolean | undefined>;
  granularity?: MaybeReactive<string | undefined>;
  minValue?: MaybeReactive<DateLike | null | undefined>;
  maxValue?: MaybeReactive<DateLike | null | undefined>;
  isDateUnavailable?: (value: DateLike) => boolean;
  firstDayOfWeek?: MaybeReactive<number | undefined>;
  pageBehavior?: MaybeReactive<"single" | "visible" | undefined>;
  locale?: MaybeReactive<string | undefined>;
  calendarAriaLabel?: MaybeReactive<string | undefined>;
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

export interface UseDatePickerResult {
  labelProps: ReadonlyRef<Record<string, unknown>>;
  groupProps: ReadonlyRef<Record<string, unknown>>;
  fieldProps: ReadonlyRef<Record<string, unknown>>;
  buttonProps: ReadonlyRef<Record<string, unknown>>;
  descriptionProps: ReadonlyRef<Record<string, unknown>>;
  errorMessageProps: ReadonlyRef<Record<string, unknown>>;
  dialogProps: ReadonlyRef<Record<string, unknown>>;
  calendarProps: ReadonlyRef<Record<string, unknown>>;
  isInvalid: ReadonlyRef<boolean>;
  validationErrors: ReadonlyRef<string[]>;
  validationDetails: ReadonlyRef<unknown>;
}

const FOCUSABLE_SELECTOR = [
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  "input:not([disabled])",
  "button:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "a[href]",
].join(",");

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }
  return Boolean(toValue(value));
}

function resolveDisplayValidation<T extends DateLike>(
  state: UseDatePickerState<T>
): DateFieldDisplayValidation | undefined {
  if (state.displayValidation === undefined) {
    return undefined;
  }
  return toValue(state.displayValidation);
}

function resolveLocale(options: UseDatePickerOptions): string {
  if (options.locale !== undefined) {
    return toValue(options.locale) ?? "en-US";
  }

  if (typeof navigator !== "undefined" && navigator.language) {
    return navigator.language;
  }

  return "en-US";
}

function isWithin(currentTarget: EventTarget | null, target: EventTarget | null): boolean {
  return (
    currentTarget instanceof Element &&
    target instanceof Node &&
    currentTarget.contains(target)
  );
}

function getValidationResult<T extends DateLike>(
  state: UseDatePickerState<T>,
  options: UseDatePickerOptions
): DateFieldDisplayValidation {
  const display = resolveDisplayValidation(state);
  if (display) {
    return {
      isInvalid: Boolean(display.isInvalid),
      validationErrors: display.validationErrors ?? [],
      validationDetails: display.validationDetails,
    };
  }

  const validationState =
    options.validationState === undefined ? undefined : toValue(options.validationState);
  return {
    isInvalid: validationState === "invalid",
    validationErrors: [],
    validationDetails: undefined,
  };
}

function resolveErrorMessage(
  errorMessage: MaybeReactive<MaybeValidationMessage> | undefined,
  validation: DateFieldDisplayValidation
): string | undefined {
  if (errorMessage === undefined) {
    return validation.validationErrors?.join(" ") || undefined;
  }

  const resolved = toValue(errorMessage);
  if (typeof resolved === "function") {
    return resolved(validation);
  }

  return resolved;
}

function focusFirst(rootRef: MaybeReactive<Element | null | undefined>) {
  const root = toValue(rootRef);
  if (!root) {
    return;
  }

  const first = root.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
  first?.focus();
}

export function useDatePicker<T extends DateLike>(
  options: UseDatePickerOptions,
  state: UseDatePickerState<T>,
  groupRef: MaybeReactive<Element | null | undefined>
): UseDatePickerResult {
  const buttonId = useId(undefined, "v-aria-date-button");
  const dialogId = useId(undefined, "v-aria-date-dialog");
  const fieldId = useId(undefined, "v-aria-date-field");

  const validation = computed(() => getValidationResult(state, options));
  const validationErrors = computed(() => validation.value.validationErrors ?? []);
  const validationDetails = computed(() => validation.value.validationDetails);
  const isInvalid = computed(() => {
    const optionInvalid = resolveBoolean(options.isInvalid);
    const optionValidationState =
      options.validationState === undefined
        ? undefined
        : toValue(options.validationState);
    return (
      Boolean(validation.value.isInvalid) ||
      optionInvalid ||
      optionValidationState === "invalid" ||
      resolveBoolean(state.isInvalid)
    );
  });

  const resolvedErrorMessage = computed(() =>
    resolveErrorMessage(options.errorMessage, validation.value)
  );

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

  const datePickerGroup = useDatePickerGroup(state, groupRef);
  const labelledBy = computed(() => {
    const explicit = fieldProps.value["aria-labelledby"];
    if (typeof explicit === "string") {
      return explicit;
    }

    const id = fieldProps.value.id;
    return typeof id === "string" ? id : undefined;
  });

  const selectedValueDescription = computed(() => {
    const locale = resolveLocale(options);
    const formatted = state.formatValue?.(locale, { month: "long" });
    if (formatted && formatted.trim().length > 0) {
      return `Selected date: ${formatted}`;
    }

    const dateValue = state.dateValue === undefined ? undefined : toValue(state.dateValue);
    if (!dateValue) {
      return "";
    }

    return `Selected date: ${String(dateValue.toString())}`;
  });

  const selectedDescription = useDescription(selectedValueDescription);
  const ariaDescribedBy = computed(() => {
    const dynamic = selectedDescription.descriptionProps.value["aria-describedby"];
    const fromField = fieldProps.value["aria-describedby"];
    const ids = [
      typeof dynamic === "string" ? dynamic : undefined,
      typeof fromField === "string" ? fromField : undefined,
    ].filter(Boolean);

    return ids.join(" ") || undefined;
  });

  const isOpen = computed(() => resolveBoolean(state.isOpen));
  const isFocused = ref(false);
  const focusWithinProps = computed<Record<string, unknown>>(() => ({
    onFocusin: (event: FocusEvent) => {
      if (isOpen.value || !isWithin(event.currentTarget, event.target)) {
        return;
      }

      if (isFocused.value) {
        return;
      }

      isFocused.value = true;
      options.onFocus?.(event);
      options.onFocusChange?.(true);
    },
    onFocusout: (event: FocusEvent) => {
      if (!isWithin(event.currentTarget, event.target)) {
        return;
      }

      if (isWithin(event.currentTarget, event.relatedTarget)) {
        return;
      }

      const dialog =
        typeof document === "undefined" ? null : document.getElementById(dialogId.value);
      if (nodeContains(dialog, event.relatedTarget)) {
        return;
      }

      if (!isFocused.value) {
        return;
      }

      isFocused.value = false;
      options.onBlur?.(event);
      options.onFocusChange?.(false);
    },
  }));

  const domProps = filterDOMProps(options as Record<string, unknown>);
  const labelProps = computed<Record<string, unknown>>(() =>
    mergeProps(baseLabelProps.value, {
      onClick: () => {
        focusFirst(groupRef);
      },
    })
  );

  const groupProps = computed<Record<string, unknown>>(() =>
    mergeProps(
      domProps,
      datePickerGroup.groupProps.value,
      fieldProps.value,
      selectedDescription.descriptionProps.value,
      focusWithinProps.value,
      {
        role: "group",
        "aria-disabled": resolveBoolean(options.isDisabled) || undefined,
        "aria-labelledby": labelledBy.value,
        "aria-describedby": ariaDescribedBy.value,
        onKeydown: (event: KeyboardEvent) => {
          if (isOpen.value) {
            return;
          }
          options.onKeydown?.(event);
        },
        onKeyup: (event: KeyboardEvent) => {
          if (isOpen.value) {
            return;
          }
          options.onKeyup?.(event);
        },
      }
    )
  );

  const fieldPropsResult = computed<Record<string, unknown>>(() => ({
    ...fieldProps.value,
    id: fieldId.value,
    [roleSymbol]: "presentation",
    "aria-describedby": ariaDescribedBy.value,
    value: state.value === undefined ? undefined : toValue(state.value),
    defaultValue:
      state.defaultValue === undefined ? undefined : toValue(state.defaultValue),
    onChange: state.setValue,
    placeholderValue:
      options.placeholderValue === undefined ? undefined : toValue(options.placeholderValue),
    hideTimeZone:
      options.hideTimeZone === undefined ? undefined : toValue(options.hideTimeZone),
    hourCycle: options.hourCycle === undefined ? undefined : toValue(options.hourCycle),
    shouldForceLeadingZeros:
      options.shouldForceLeadingZeros === undefined
        ? undefined
        : toValue(options.shouldForceLeadingZeros),
    granularity:
      options.granularity === undefined ? undefined : toValue(options.granularity),
    isDisabled: options.isDisabled,
    isReadOnly: options.isReadOnly,
    isRequired: options.isRequired,
    validationBehavior: options.validationBehavior,
    [privateValidationStateSymbol]: state,
    autoFocus: options.autoFocus,
    name: options.name,
    form: options.form,
  }));

  const buttonProps = computed<Record<string, unknown>>(() => {
    const buttonLabel =
      options.calendarAriaLabel === undefined
        ? "Calendar"
        : (toValue(options.calendarAriaLabel) ?? "Calendar");
    const labelledByValue = labelledBy.value
      ? `${buttonId.value} ${labelledBy.value}`
      : buttonId.value;

    return {
      ...selectedDescription.descriptionProps.value,
      id: buttonId.value,
      "aria-haspopup": "dialog",
      "aria-label": buttonLabel,
      "aria-labelledby": labelledByValue,
      "aria-describedby": ariaDescribedBy.value,
      "aria-expanded": isOpen.value,
      isDisabled: resolveBoolean(options.isDisabled) || resolveBoolean(options.isReadOnly),
      onPress: () => state.setOpen(true),
    };
  });

  const dialogProps = computed<Record<string, unknown>>(() => {
    const labelledByValue = labelledBy.value
      ? `${buttonId.value} ${labelledBy.value}`
      : buttonId.value;

    return {
      id: dialogId.value,
      "aria-labelledby": labelledByValue,
    };
  });

  const calendarErrorMessage = computed(() =>
    resolveErrorMessage(options.errorMessage, validation.value)
  );

  const calendarProps = computed<Record<string, unknown>>(() => ({
    autoFocus: true,
    value: state.dateValue === undefined ? undefined : toValue(state.dateValue),
    onChange: state.setDateValue,
    minValue: options.minValue === undefined ? undefined : toValue(options.minValue),
    maxValue: options.maxValue === undefined ? undefined : toValue(options.maxValue),
    isDisabled: options.isDisabled === undefined ? undefined : toValue(options.isDisabled),
    isReadOnly: options.isReadOnly === undefined ? undefined : toValue(options.isReadOnly),
    isDateUnavailable: options.isDateUnavailable,
    defaultFocusedValue:
      state.dateValue === undefined || !toValue(state.dateValue)
        ? options.placeholderValue === undefined
          ? undefined
          : toValue(options.placeholderValue)
        : undefined,
    isInvalid: isInvalid.value,
    errorMessage: calendarErrorMessage.value,
    firstDayOfWeek:
      options.firstDayOfWeek === undefined ? undefined : toValue(options.firstDayOfWeek),
    pageBehavior:
      options.pageBehavior === undefined ? undefined : toValue(options.pageBehavior),
  }));

  return {
    labelProps,
    groupProps,
    fieldProps: fieldPropsResult,
    buttonProps,
    descriptionProps,
    errorMessageProps,
    dialogProps,
    calendarProps,
    isInvalid,
    validationErrors,
    validationDetails,
  };
}
