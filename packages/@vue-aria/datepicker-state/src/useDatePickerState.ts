import {
  CalendarDate,
  DateFormatter,
  toCalendarDate,
  toCalendarDateTime,
} from "@internationalized/date";
import { useFormValidationState } from "@vue-stately/form";
import { useOverlayTriggerState } from "@vue-stately/overlays";
import { useControlledState } from "@vue-stately/utils";
import { computed, ref, watch, watchEffect } from "vue";
import type { DateValue, ValidationState } from "@vue-stately/calendar";
import {
  getFormatOptions,
  getPlaceholderTime,
  getValidationResult,
  resolveShouldClose,
  useDefaultProps,
} from "./utils";
import type {
  DatePickerState,
  DatePickerStateOptions,
  FieldOptions,
  FormatterOptions,
  MappedDateValue,
  TimeValue,
} from "./types";

/**
 * Provides state management for a date picker component.
 */
export function useDatePickerState<T extends DateValue = DateValue>(
  props: DatePickerStateOptions<T>
): DatePickerState {
  const overlayState = useOverlayTriggerState(props);

  const [valueRef, setControlledValue] = useControlledState<
    DateValue | null,
    MappedDateValue<T> | null
  >(
    () => props.value as DateValue | null | undefined,
    () => (props.defaultValue ?? null) as DateValue | null,
    props.onChange as ((value: MappedDateValue<T> | null) => void) | undefined
  );

  const initialValue = valueRef.value;

  const isSameDateValue = (
    left: DateValue | null | undefined,
    right: DateValue | null | undefined
  ): boolean => {
    if (left === right) {
      return true;
    }

    if (!left || !right) {
      return false;
    }

    return left.toString() === right.toString();
  };

  const selectedDateRef = ref<DateValue | null>(null);
  const selectedTimeRef = ref<TimeValue | null>(null);

  watch(
    () => props.defaultValue as DateValue | null | undefined,
    (nextDefault, previousDefault) => {
      if (
        props.value !== undefined
        || isSameDateValue(nextDefault, previousDefault)
      ) {
        return;
      }

      setControlledValue((nextDefault ?? null) as MappedDateValue<T> | null);
    }
  );

  watchEffect(() => {
    const value = valueRef.value;
    if (value) {
      selectedDateRef.value = value;
      selectedTimeRef.value = "hour" in value ? value : null;
    }
  });

  const currentValue = computed(() => valueRef.value || props.placeholderValue || null);

  const defaultProps = computed(() =>
    useDefaultProps(currentValue.value, props.granularity)
  );

  const granularity = computed(() => defaultProps.value[0]);
  const defaultTimeZone = computed(() => defaultProps.value[1]);

  const hasTime = computed(
    () =>
      granularity.value === "hour"
      || granularity.value === "minute"
      || granularity.value === "second"
  );

  watchEffect(() => {
    const value = currentValue.value;
    if (value && !(granularity.value in value)) {
      throw new Error(`Invalid granularity ${granularity.value} for value ${value.toString()}`);
    }
  });

  const formatOpts = computed<FormatterOptions>(() => {
    const value = valueRef.value;
    const showEra = Boolean(
      value?.calendar?.identifier === "gregory" && value?.era === "BC"
    );

    return {
      granularity: granularity.value,
      timeZone: defaultTimeZone.value,
      hideTimeZone: props.hideTimeZone,
      hourCycle: props.hourCycle,
      shouldForceLeadingZeros: props.shouldForceLeadingZeros,
      showEra,
    };
  });

  const builtinValidation = computed(() =>
    getValidationResult(
      valueRef.value,
      props.minValue,
      props.maxValue,
      props.isDateUnavailable,
      formatOpts.value
    )
  );

  const validation = useFormValidationState({
    ...props,
    validationState: props.validationState ?? undefined,
    value: () => valueRef.value as MappedDateValue<T> | null,
    builtinValidation,
  });

  const isValueInvalid = computed(() => validation.displayValidation.isInvalid);
  const validationState = computed<ValidationState | null>(() =>
    (props.validationState as ValidationState | null | undefined)
      || (isValueInvalid.value ? "invalid" : null)
  );

  const commitValue = (date: DateValue, time: TimeValue) => {
    const nextValue = "timeZone" in time
      ? time.set(toCalendarDate(date as any))
      : toCalendarDateTime(date as any, time as any);

    setControlledValue(nextValue as MappedDateValue<T>);
    selectedDateRef.value = null;
    selectedTimeRef.value = null;
    validation.commitValidation();
  };

  const selectDate = (newValue: CalendarDate) => {
    const shouldClose = resolveShouldClose(props.shouldCloseOnSelect ?? true);

    if (hasTime.value) {
      if (selectedTimeRef.value || shouldClose) {
        commitValue(
          newValue,
          selectedTimeRef.value
            || getPlaceholderTime(props.defaultValue || props.placeholderValue)
        );
      } else {
        selectedDateRef.value = newValue;
      }
    } else {
      setControlledValue(newValue as MappedDateValue<T>);
      validation.commitValidation();
    }

    if (shouldClose) {
      overlayState.setOpen(false);
    }
  };

  const selectTime = (newValue: TimeValue) => {
    if (selectedDateRef.value && newValue) {
      commitValue(selectedDateRef.value, newValue);
    } else {
      selectedTimeRef.value = newValue;
    }
  };

  const state: DatePickerState = {
    get realtimeValidation() {
      return validation.realtimeValidation;
    },
    get displayValidation() {
      return validation.displayValidation;
    },
    updateValidation(result) {
      validation.updateValidation(result);
    },
    resetValidation() {
      validation.resetValidation();
    },
    commitValidation() {
      validation.commitValidation();
    },
    get isOpen() {
      return overlayState.isOpen;
    },
    setOpen(isOpen) {
      if (!isOpen && !valueRef.value && selectedDateRef.value && hasTime.value) {
        commitValue(
          selectedDateRef.value,
          selectedTimeRef.value
            || getPlaceholderTime(props.defaultValue || props.placeholderValue)
        );
      }

      overlayState.setOpen(isOpen);
    },
    open() {
      overlayState.open();
    },
    close() {
      overlayState.close();
    },
    toggle() {
      overlayState.toggle();
    },
    get value() {
      return valueRef.value;
    },
    get defaultValue() {
      return (props.defaultValue ?? initialValue) as DateValue | null;
    },
    setValue(value) {
      setControlledValue(value as MappedDateValue<T> | null);
    },
    get dateValue() {
      return selectedDateRef.value;
    },
    setDateValue(value) {
      selectDate(value as CalendarDate);
    },
    get timeValue() {
      return selectedTimeRef.value;
    },
    setTimeValue(value) {
      selectTime(value);
    },
    get granularity() {
      return granularity.value;
    },
    get hasTime() {
      return hasTime.value;
    },
    get validationState() {
      return validationState.value;
    },
    get isInvalid() {
      return isValueInvalid.value;
    },
    formatValue(locale, fieldOptions: FieldOptions) {
      const value = valueRef.value;
      if (!value) {
        return "";
      }

      const dateValue = value.toDate(defaultTimeZone.value ?? "UTC");
      const formatOptions = getFormatOptions(fieldOptions, formatOpts.value);
      const formatter = new DateFormatter(locale, formatOptions);
      return formatter.format(dateValue);
    },
    getDateFormatter(locale, formatOptions: FormatterOptions) {
      const mergedOptions = { ...formatOpts.value, ...formatOptions };
      const nextFormatOptions = getFormatOptions({}, mergedOptions);
      return new DateFormatter(locale, nextFormatOptions);
    },
  };

  return state;
}
