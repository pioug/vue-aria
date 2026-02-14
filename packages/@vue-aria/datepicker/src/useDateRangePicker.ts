import { createFocusManager } from "@vue-aria/focus";
import { useLocale, useLocalizedStringFormatter } from "@vue-aria/i18n";
import { useFocusWithin } from "@vue-aria/interactions";
import { useField } from "@vue-aria/label";
import {
  DEFAULT_VALIDATION_RESULT,
  mergeValidation,
  privateValidationStateProp,
  type ValidationResult,
} from "@vue-aria/form-state";
import {
  filterDOMProps,
  mergeProps,
  nodeContains,
  useDescription,
  useId,
} from "@vue-aria/utils";
import { ref as vueRef } from "vue";
import { intlMessages } from "./intlMessages";
import { focusManagerSymbol, roleSymbol } from "./useDateField";
import { useDatePickerGroup } from "./useDatePickerGroup";
import type { DateRangePickerState } from "@vue-aria/datepicker-state";
import type {
  AriaDatePickerProps,
  AriaDateRangePickerProps,
  DateValue,
  DOMAttributes,
  GroupDOMAttributes,
  RefObject,
} from "./types";

export interface DateRangePickerAria extends ValidationResult {
  labelProps: DOMAttributes;
  groupProps: GroupDOMAttributes;
  startFieldProps: AriaDatePickerProps<DateValue>;
  endFieldProps: AriaDatePickerProps<DateValue>;
  buttonProps: Record<string, unknown>;
  descriptionProps: DOMAttributes;
  errorMessageProps: DOMAttributes;
  dialogProps: Record<string, unknown>;
  calendarProps: Record<string, unknown>;
}

/**
 * Provides behavior and accessibility implementation for a date range picker.
 */
export function useDateRangePicker<T extends DateValue>(
  props: AriaDateRangePickerProps<T>,
  state: DateRangePickerState,
  ref: RefObject<Element>
): DateRangePickerAria {
  const stringFormatter = useLocalizedStringFormatter(
    intlMessages as any,
    "@react-aria/datepicker"
  );
  const { isInvalid, validationErrors, validationDetails } = state.displayValidation;
  const { labelProps, fieldProps, descriptionProps, errorMessageProps } = useField({
    ...props,
    validationState: props.validationState ?? undefined,
    labelElementType: "span",
    isInvalid,
    errorMessage: (props as any).errorMessage || validationErrors,
  });

  const labelledBy =
    ((fieldProps as any)["aria-labelledby"] as string | undefined)
    || ((fieldProps as any).id as string | undefined);

  const locale = useLocale();
  const range = state.formatValue(locale.value.locale, { month: "long" });
  const description = range
    ? stringFormatter.format("selectedRangeDescription", {
      startDate: range.start,
      endDate: range.end,
    })
    : "";
  const { descriptionProps: selectedDescriptionProps } = useDescription(description);

  const startFieldProps = {
    "aria-label": stringFormatter.format("startDate"),
    "aria-labelledby": labelledBy,
  };
  const endFieldProps = {
    "aria-label": stringFormatter.format("endDate"),
    "aria-labelledby": labelledBy,
  };

  const buttonId = useId();
  const dialogId = useId();
  const groupProps = useDatePickerGroup(state, ref);

  const ariaDescribedBy =
    [
      selectedDescriptionProps.value["aria-describedby"],
      (fieldProps as any)["aria-describedby"],
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  const focusManager = createFocusManager(ref as any, {
    accept: (element) => element.id !== buttonId,
  });

  const commonFieldProps = {
    [focusManagerSymbol]: focusManager,
    [roleSymbol]: "presentation",
    "aria-describedby": ariaDescribedBy,
    placeholderValue: props.placeholderValue,
    hideTimeZone: props.hideTimeZone,
    hourCycle: props.hourCycle,
    granularity: props.granularity,
    shouldForceLeadingZeros: props.shouldForceLeadingZeros,
    isDisabled: props.isDisabled,
    isReadOnly: props.isReadOnly,
    isRequired: props.isRequired,
    validationBehavior: props.validationBehavior,
  };

  const domProps = filterDOMProps(props as Record<string, unknown>);

  const isFocused = vueRef(false);
  const { focusWithinProps } = useFocusWithin({
    ...props,
    isDisabled: state.isOpen,
    onBlurWithin(event) {
      const dialog = document.getElementById(dialogId);
      if (!nodeContains(dialog, event.relatedTarget as Node | null)) {
        isFocused.value = false;
        (props.onBlur as ((event: FocusEvent) => void) | undefined)?.(
          event as FocusEvent
        );
        (props.onFocusChange as ((isFocused: boolean) => void) | undefined)?.(
          false
        );
      }
    },
    onFocusWithin(event) {
      if (!isFocused.value) {
        isFocused.value = true;
        (props.onFocus as ((event: FocusEvent) => void) | undefined)?.(
          event as FocusEvent
        );
        (props.onFocusChange as ((isFocused: boolean) => void) | undefined)?.(
          true
        );
      }
    },
  });

  const startFieldValidation = vueRef(DEFAULT_VALIDATION_RESULT);
  const endFieldValidation = vueRef(DEFAULT_VALIDATION_RESULT);

  return {
    groupProps: mergeProps(
      domProps,
      groupProps,
      fieldProps,
      selectedDescriptionProps.value,
      focusWithinProps,
      {
        role: "group",
        "aria-disabled": props.isDisabled || null,
        "aria-describedby": ariaDescribedBy,
        onKeyDown(event: KeyboardEvent) {
          if (state.isOpen) {
            return;
          }
          (props.onKeyDown as ((event: KeyboardEvent) => void) | undefined)?.(
            event
          );
        },
        onKeyUp(event: KeyboardEvent) {
          if (state.isOpen) {
            return;
          }
          (props.onKeyUp as ((event: KeyboardEvent) => void) | undefined)?.(
            event
          );
        },
      }
    ) as GroupDOMAttributes,
    labelProps: {
      ...labelProps,
      onClick: () => {
        focusManager.focusFirst();
      },
    },
    buttonProps: {
      ...selectedDescriptionProps.value,
      id: buttonId,
      "aria-haspopup": "dialog",
      "aria-label": stringFormatter.format("calendar"),
      "aria-labelledby": `${buttonId} ${labelledBy}`,
      "aria-describedby": ariaDescribedBy,
      "aria-expanded": state.isOpen,
      isDisabled: props.isDisabled || props.isReadOnly,
      onPress: () => state.setOpen(true),
    },
    dialogProps: {
      id: dialogId,
      "aria-labelledby": `${buttonId} ${labelledBy}`,
    },
    startFieldProps: {
      ...startFieldProps,
      ...commonFieldProps,
      value: state.value?.start ?? null,
      defaultValue: state.defaultValue?.start,
      onChange: (start: DateValue | null) => state.setDateTime("start", start),
      autoFocus: props.autoFocus,
      name: props.startName,
      form: props.form,
      [privateValidationStateProp]: {
        get realtimeValidation() {
          return state.realtimeValidation;
        },
        get displayValidation() {
          return state.displayValidation;
        },
        updateValidation(validation: ValidationResult) {
          startFieldValidation.value = validation;
          state.updateValidation(
            mergeValidation(validation, endFieldValidation.value)
          );
        },
        resetValidation: state.resetValidation,
        commitValidation: state.commitValidation,
      },
    } as AriaDatePickerProps<DateValue>,
    endFieldProps: {
      ...endFieldProps,
      ...commonFieldProps,
      value: state.value?.end ?? null,
      defaultValue: state.defaultValue?.end,
      onChange: (end: DateValue | null) => state.setDateTime("end", end),
      name: props.endName,
      form: props.form,
      [privateValidationStateProp]: {
        get realtimeValidation() {
          return state.realtimeValidation;
        },
        get displayValidation() {
          return state.displayValidation;
        },
        updateValidation(validation: ValidationResult) {
          endFieldValidation.value = validation;
          state.updateValidation(
            mergeValidation(startFieldValidation.value, validation)
          );
        },
        resetValidation: state.resetValidation,
        commitValidation: state.commitValidation,
      },
    } as AriaDatePickerProps<DateValue>,
    descriptionProps: descriptionProps as DOMAttributes,
    errorMessageProps: errorMessageProps as DOMAttributes,
    calendarProps: {
      autoFocus: true,
      value:
        state.dateRange?.start && state.dateRange.end ? state.dateRange : null,
      onChange: state.setDateRange,
      minValue: props.minValue,
      maxValue: props.maxValue,
      isDisabled: props.isDisabled,
      isReadOnly: props.isReadOnly,
      isDateUnavailable: props.isDateUnavailable,
      allowsNonContiguousRanges: props.allowsNonContiguousRanges,
      defaultFocusedValue: state.dateRange ? undefined : props.placeholderValue,
      isInvalid: state.isInvalid,
      errorMessage:
        typeof props.errorMessage === "function"
          ? props.errorMessage(state.displayValidation)
          : (props.errorMessage
            || state.displayValidation.validationErrors.join(" ")),
      firstDayOfWeek: props.firstDayOfWeek,
      pageBehavior: props.pageBehavior,
    },
    isInvalid,
    validationErrors,
    validationDetails,
  };
}
