import { createFocusManager } from "@vue-aria/focus";
import { useLocale, useLocalizedStringFormatter } from "@vue-aria/i18n";
import { useFocusWithin } from "@vue-aria/interactions";
import { useField } from "@vue-aria/label";
import { privateValidationStateProp, type ValidationResult } from "@vue-aria/form-state";
import {
  filterDOMProps,
  mergeProps,
  nodeContains,
  useDescription,
  useId,
} from "@vue-aria/utils";
import { ref as vueRef } from "vue";
import { intlMessages } from "./intlMessages";
import { roleSymbol } from "./useDateField";
import { useDatePickerGroup } from "./useDatePickerGroup";
import type { DatePickerState } from "@vue-aria/datepicker-state";
import type {
  AriaDatePickerProps,
  DateValue,
  DOMAttributes,
  GroupDOMAttributes,
  RefObject,
} from "./types";

export interface DatePickerAria extends ValidationResult {
  labelProps: DOMAttributes;
  groupProps: GroupDOMAttributes;
  fieldProps: AriaDatePickerProps<DateValue>;
  buttonProps: Record<string, unknown>;
  descriptionProps: DOMAttributes;
  errorMessageProps: DOMAttributes;
  dialogProps: Record<string, unknown>;
  calendarProps: Record<string, unknown>;
}

/**
 * Provides behavior and accessibility implementation for a date picker.
 */
export function useDatePicker<T extends DateValue>(
  props: AriaDatePickerProps<T>,
  state: DatePickerState,
  ref: RefObject<Element>
): DatePickerAria {
  const buttonId = useId();
  const dialogId = useId();
  const fieldId = useId();
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

  const groupProps = useDatePickerGroup(state, ref);
  const labelledBy =
    ((fieldProps as any)["aria-labelledby"] as string | undefined)
    || ((fieldProps as any).id as string | undefined);

  const locale = useLocale();
  const date = state.formatValue(locale.value.locale, { month: "long" });
  const description = date
    ? stringFormatter.format("selectedDateDescription", { date })
    : "";
  const { descriptionProps: selectedDescriptionProps } = useDescription(description);
  const ariaDescribedBy =
    [
      selectedDescriptionProps.value["aria-describedby"],
      (fieldProps as any)["aria-describedby"],
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  const domProps = filterDOMProps(props as Record<string, unknown>);
  const focusManager = createFocusManager(ref as any);
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
        "aria-labelledby": labelledBy,
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
    fieldProps: {
      ...(fieldProps as any),
      id: fieldId,
      [roleSymbol]: "presentation",
      "aria-describedby": ariaDescribedBy,
      value: state.value,
      defaultValue: state.defaultValue,
      onChange: state.setValue,
      placeholderValue: props.placeholderValue,
      hideTimeZone: props.hideTimeZone,
      hourCycle: props.hourCycle,
      shouldForceLeadingZeros: props.shouldForceLeadingZeros,
      granularity: props.granularity,
      isDisabled: props.isDisabled,
      isReadOnly: props.isReadOnly,
      isRequired: props.isRequired,
      validationBehavior: props.validationBehavior,
      [privateValidationStateProp]: state,
      autoFocus: props.autoFocus,
      name: props.name,
      form: props.form,
    } as AriaDatePickerProps<DateValue>,
    descriptionProps: descriptionProps as DOMAttributes,
    errorMessageProps: errorMessageProps as DOMAttributes,
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
    calendarProps: {
      autoFocus: true,
      value: state.dateValue,
      onChange: state.setDateValue,
      minValue: props.minValue,
      maxValue: props.maxValue,
      isDisabled: props.isDisabled,
      isReadOnly: props.isReadOnly,
      isDateUnavailable: props.isDateUnavailable,
      defaultFocusedValue: state.dateValue ? undefined : props.placeholderValue,
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
