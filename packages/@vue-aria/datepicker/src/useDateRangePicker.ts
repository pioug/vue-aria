import { computed, ref, toValue } from "vue";
import {
  focusManagerSymbol,
  roleSymbol,
  type DateFieldDisplayValidation,
  type FocusManager,
} from "@vue-aria/datefield";
import { useField } from "@vue-aria/label";
import { useDatePickerGroup } from "./useDatePickerGroup";
import { useDescription } from "@vue-aria/utils";
import { mergeProps } from "@vue-aria/utils";
import { useId } from "@vue-aria/ssr";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type {
  DateLike,
  DatePickerPrivateValidationState,
  DateRangeValue,
  UseDateRangePickerState,
} from "./types";
import { privateValidationStateSymbol } from "./privateValidation";

type MaybeValidationMessage =
  | string
  | ((validation: DateFieldDisplayValidation) => string)
  | undefined;

export interface UseDateRangePickerOptions {
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
  allowsNonContiguousRanges?: MaybeReactive<boolean | undefined>;
  locale?: MaybeReactive<string | undefined>;
  calendarAriaLabel?: MaybeReactive<string | undefined>;
  startAriaLabel?: MaybeReactive<string | undefined>;
  endAriaLabel?: MaybeReactive<string | undefined>;
  startName?: MaybeReactive<string | undefined>;
  endName?: MaybeReactive<string | undefined>;
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

export interface UseDateRangePickerResult {
  labelProps: ReadonlyRef<Record<string, unknown>>;
  groupProps: ReadonlyRef<Record<string, unknown>>;
  startFieldProps: ReadonlyRef<Record<string, unknown>>;
  endFieldProps: ReadonlyRef<Record<string, unknown>>;
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

const DEFAULT_VALIDATION: DateFieldDisplayValidation = {
  isInvalid: false,
  validationErrors: [],
  validationDetails: undefined,
};

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }
  return Boolean(toValue(value));
}

function resolveDisplayValidation<T extends DateLike>(
  state: UseDateRangePickerState<T>
): DateFieldDisplayValidation | undefined {
  if (state.displayValidation === undefined) {
    return undefined;
  }
  return toValue(state.displayValidation);
}

function resolveLocale(options: UseDateRangePickerOptions): string {
  if (options.locale !== undefined) {
    return toValue(options.locale) ?? "en-US";
  }

  if (typeof navigator !== "undefined" && navigator.language) {
    return navigator.language;
  }

  return "en-US";
}

function collectDOMProps(options: UseDateRangePickerOptions): Record<string, unknown> {
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

function nodeContains(parent: Element | null, target: EventTarget | null): boolean {
  return target instanceof Node ? Boolean(parent?.contains(target)) : false;
}

function isWithin(currentTarget: EventTarget | null, target: EventTarget | null): boolean {
  return (
    currentTarget instanceof Element &&
    target instanceof Node &&
    currentTarget.contains(target)
  );
}

function getValidationResult<T extends DateLike>(
  state: UseDateRangePickerState<T>,
  options: UseDateRangePickerOptions
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

function mergeValidation(
  first: DateFieldDisplayValidation,
  second: DateFieldDisplayValidation
): DateFieldDisplayValidation {
  return {
    isInvalid: Boolean(first.isInvalid) || Boolean(second.isInvalid),
    validationErrors: [
      ...(first.validationErrors ?? []),
      ...(second.validationErrors ?? []),
    ],
    validationDetails: second.validationDetails ?? first.validationDetails,
  };
}

function createRangeFocusManager(
  groupRef: MaybeReactive<Element | null | undefined>,
  excludedElementId: string
): FocusManager {
  const getFocusableElements = () => {
    const root = toValue(groupRef);
    if (!root) {
      return [] as HTMLElement[];
    }

    return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (element) =>
        !element.hidden &&
        element.getAttribute("aria-hidden") !== "true" &&
        element.id !== excludedElementId
    );
  };

  const focusAt = (index: number): boolean => {
    const elements = getFocusableElements();
    if (elements.length === 0) {
      return false;
    }

    const safeIndex = Math.max(0, Math.min(index, elements.length - 1));
    const target = elements[safeIndex];
    target?.focus();
    return document.activeElement === target;
  };

  const focusRelative = (step: 1 | -1): boolean => {
    const elements = getFocusableElements();
    if (elements.length === 0) {
      return false;
    }

    const active = document.activeElement as HTMLElement | null;
    const currentIndex = active ? elements.findIndex((item) => item === active) : -1;
    const nextIndex =
      currentIndex < 0
        ? step > 0
          ? 0
          : elements.length - 1
        : currentIndex + step;

    if (nextIndex < 0 || nextIndex >= elements.length) {
      return false;
    }

    const target = elements[nextIndex];
    target?.focus();
    return document.activeElement === target;
  };

  return {
    focusFirst: () => focusAt(0),
    focusNext: () => focusRelative(1),
    focusPrevious: () => focusRelative(-1),
  };
}

export function useDateRangePicker<T extends DateLike>(
  options: UseDateRangePickerOptions,
  state: UseDateRangePickerState<T>,
  groupRef: MaybeReactive<Element | null | undefined>
): UseDateRangePickerResult {
  const buttonId = useId(undefined, "v-aria-date-range-button");
  const dialogId = useId(undefined, "v-aria-date-range-dialog");

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

  const labelledBy = computed(() => {
    const explicit = fieldProps.value["aria-labelledby"];
    if (typeof explicit === "string") {
      return explicit;
    }

    const id = fieldProps.value.id;
    return typeof id === "string" ? id : undefined;
  });

  const selectedRangeDescription = computed(() => {
    const locale = resolveLocale(options);
    const formatted = state.formatValue?.(locale, { month: "long" });
    if (!formatted) {
      return "";
    }

    return `Selected range: ${formatted.start} - ${formatted.end}`;
  });

  const selectedDescription = useDescription(selectedRangeDescription);
  const ariaDescribedBy = computed(() => {
    const dynamic = selectedDescription.descriptionProps.value["aria-describedby"];
    const fromField = fieldProps.value["aria-describedby"];
    const ids = [
      typeof dynamic === "string" ? dynamic : undefined,
      typeof fromField === "string" ? fromField : undefined,
    ].filter(Boolean);

    return ids.join(" ") || undefined;
  });

  const datePickerGroup = useDatePickerGroup(state, groupRef);
  const focusManager = createRangeFocusManager(groupRef, buttonId.value);
  const commonFieldProps = computed<Record<string, unknown>>(() => ({
    [focusManagerSymbol]: focusManager,
    [roleSymbol]: "presentation",
    "aria-describedby": ariaDescribedBy.value,
    placeholderValue:
      options.placeholderValue === undefined ? undefined : toValue(options.placeholderValue),
    hideTimeZone:
      options.hideTimeZone === undefined ? undefined : toValue(options.hideTimeZone),
    hourCycle: options.hourCycle === undefined ? undefined : toValue(options.hourCycle),
    granularity:
      options.granularity === undefined ? undefined : toValue(options.granularity),
    shouldForceLeadingZeros:
      options.shouldForceLeadingZeros === undefined
        ? undefined
        : toValue(options.shouldForceLeadingZeros),
    isDisabled: options.isDisabled,
    isReadOnly: options.isReadOnly,
    isRequired: options.isRequired,
    validationBehavior: options.validationBehavior,
  }));

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

  const startFieldValidation = ref<DateFieldDisplayValidation>(DEFAULT_VALIDATION);
  const endFieldValidation = ref<DateFieldDisplayValidation>(DEFAULT_VALIDATION);

  const startValidationState = computed<DatePickerPrivateValidationState>(() => ({
    realtimeValidation: state.realtimeValidation,
    displayValidation: state.displayValidation,
    updateValidation: (result: DateFieldDisplayValidation) => {
      startFieldValidation.value = result;
      state.updateValidation?.(mergeValidation(result, endFieldValidation.value));
    },
    resetValidation: state.resetValidation,
    commitValidation: state.commitValidation,
  }));

  const endValidationState = computed<DatePickerPrivateValidationState>(() => ({
    realtimeValidation: state.realtimeValidation,
    displayValidation: state.displayValidation,
    updateValidation: (result: DateFieldDisplayValidation) => {
      endFieldValidation.value = result;
      state.updateValidation?.(mergeValidation(startFieldValidation.value, result));
    },
    resetValidation: state.resetValidation,
    commitValidation: state.commitValidation,
  }));

  const startFieldProps = computed<Record<string, unknown>>(() => {
    const value = state.value === undefined ? undefined : toValue(state.value);
    const defaultValue =
      state.defaultValue === undefined ? undefined : toValue(state.defaultValue);

    return {
      "aria-label":
        options.startAriaLabel === undefined
          ? "Start date"
          : (toValue(options.startAriaLabel) ?? "Start date"),
      "aria-labelledby": labelledBy.value,
      ...commonFieldProps.value,
      value: value?.start ?? null,
      defaultValue: defaultValue?.start,
      onChange: (next: T | null | undefined) => state.setDateTime("start", next),
      autoFocus: options.autoFocus,
      name: options.startName,
      form: options.form,
      [privateValidationStateSymbol]: startValidationState.value,
    };
  });

  const endFieldProps = computed<Record<string, unknown>>(() => {
    const value = state.value === undefined ? undefined : toValue(state.value);
    const defaultValue =
      state.defaultValue === undefined ? undefined : toValue(state.defaultValue);

    return {
      "aria-label":
        options.endAriaLabel === undefined
          ? "End date"
          : (toValue(options.endAriaLabel) ?? "End date"),
      "aria-labelledby": labelledBy.value,
      ...commonFieldProps.value,
      value: value?.end ?? null,
      defaultValue: defaultValue?.end,
      onChange: (next: T | null | undefined) => state.setDateTime("end", next),
      name: options.endName,
      form: options.form,
      [privateValidationStateSymbol]: endValidationState.value,
    };
  });

  const domProps = collectDOMProps(options);
  const labelProps = computed<Record<string, unknown>>(() =>
    mergeProps(baseLabelProps.value, {
      onClick: () => {
        focusManager.focusFirst();
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

  const calendarProps = computed<Record<string, unknown>>(() => {
    const dateRange = state.dateRange === undefined ? undefined : toValue(state.dateRange);

    const fullRange =
      dateRange && dateRange.start && dateRange.end
        ? ({ start: dateRange.start, end: dateRange.end } as DateRangeValue<T>)
        : null;

    return {
      autoFocus: true,
      value: fullRange,
      onChange: state.setDateRange,
      minValue: options.minValue === undefined ? undefined : toValue(options.minValue),
      maxValue: options.maxValue === undefined ? undefined : toValue(options.maxValue),
      isDisabled: options.isDisabled === undefined ? undefined : toValue(options.isDisabled),
      isReadOnly: options.isReadOnly === undefined ? undefined : toValue(options.isReadOnly),
      isDateUnavailable: options.isDateUnavailable,
      allowsNonContiguousRanges:
        options.allowsNonContiguousRanges === undefined
          ? undefined
          : toValue(options.allowsNonContiguousRanges),
      defaultFocusedValue:
        dateRange && dateRange.start && dateRange.end
          ? undefined
          : options.placeholderValue === undefined
            ? undefined
            : toValue(options.placeholderValue),
      isInvalid: isInvalid.value,
      errorMessage: calendarErrorMessage.value,
      firstDayOfWeek:
        options.firstDayOfWeek === undefined ? undefined : toValue(options.firstDayOfWeek),
      pageBehavior:
        options.pageBehavior === undefined ? undefined : toValue(options.pageBehavior),
    };
  });

  return {
    labelProps,
    groupProps,
    startFieldProps,
    endFieldProps,
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
