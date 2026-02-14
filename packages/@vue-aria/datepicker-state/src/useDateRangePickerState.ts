import { DateFormatter, toCalendarDate, toCalendarDateTime } from "@internationalized/date";
import { useFormValidationState } from "@vue-aria/form-state";
import { useOverlayTriggerState } from "@vue-aria/overlays-state";
import { useControlledState } from "@vue-aria/utils-state";
import { computed, ref, watchEffect } from "vue";
import type { DateValue, RangeValue, ValidationState } from "@vue-aria/calendar-state";
import type {
  DateRange,
  DateRangePickerState,
  DateRangePickerStateOptions,
  FieldOptions,
  FormatterOptions,
  MappedDateValue,
  TimeValue,
} from "./types";
import {
  getFormatOptions,
  getPlaceholderTime,
  getRangeValidationResult,
  isCompleteRange,
  resolveShouldClose,
  useDefaultProps,
} from "./utils";

type TimeRange = RangeValue<TimeValue>;

/**
 * Provides state management for a date range picker component.
 */
export function useDateRangePickerState<T extends DateValue = DateValue>(
  props: DateRangePickerStateOptions<T>
): DateRangePickerState {
  const overlayState = useOverlayTriggerState(props);

  const [controlledValueRef, setControlledValue] = useControlledState<
    DateRange | null,
    RangeValue<MappedDateValue<T>> | null
  >(
    () => props.value as DateRange | null | undefined,
    () => (props.defaultValue ?? null) as DateRange | null,
    props.onChange as ((value: RangeValue<MappedDateValue<T>> | null) => void) | undefined
  );

  const initialValue = controlledValueRef.value;
  const placeholderValueRef = ref<RangeValue<DateValue | null>>(
    controlledValueRef.value || { start: null, end: null }
  );

  watchEffect(() => {
    if (
      controlledValueRef.value == null
      && placeholderValueRef.value.start
      && placeholderValueRef.value.end
    ) {
      placeholderValueRef.value = { start: null, end: null };
    }
  });

  const value = computed<RangeValue<DateValue | null>>(
    () => controlledValueRef.value || placeholderValueRef.value
  );

  const setValue = (newValue: RangeValue<DateValue | null> | null) => {
    const nextValue = newValue || { start: null, end: null };
    placeholderValueRef.value = nextValue;

    if (isCompleteRange(nextValue)) {
      setControlledValue(nextValue as any);
    } else {
      setControlledValue(null);
    }
  };

  const currentValue = computed(
    () => value.value?.start || value.value?.end || props.placeholderValue || null
  );

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

  const dateRangeRef = ref<RangeValue<DateValue | null> | null>(null);
  const timeRangeRef = ref<RangeValue<TimeValue | null> | null>(null);

  watchEffect(() => {
    if (isCompleteRange(value.value)) {
      dateRangeRef.value = value.value;
      if ("hour" in value.value.start) {
        timeRangeRef.value = value.value as any;
      }
    }
  });

  const commitValue = (dateRange: DateRange, timeRange: TimeRange) => {
    setValue({
      start: "timeZone" in timeRange.start
        ? timeRange.start.set(toCalendarDate(dateRange.start as any))
        : toCalendarDateTime(dateRange.start as any, timeRange.start as any),
      end: "timeZone" in timeRange.end
        ? timeRange.end.set(toCalendarDate(dateRange.end as any))
        : toCalendarDateTime(dateRange.end as any, timeRange.end as any),
    });

    dateRangeRef.value = null;
    timeRangeRef.value = null;
    validation.commitValidation();
  };

  const setDateRange = (range: RangeValue<DateValue | null>) => {
    const shouldClose = resolveShouldClose(props.shouldCloseOnSelect ?? true);

    if (hasTime.value) {
      if (
        isCompleteRange(range)
        && (shouldClose || (timeRangeRef.value?.start && timeRangeRef.value?.end))
      ) {
        commitValue(range as DateRange, {
          start: timeRangeRef.value?.start || getPlaceholderTime(props.placeholderValue),
          end: timeRangeRef.value?.end || getPlaceholderTime(props.placeholderValue),
        });
      } else {
        dateRangeRef.value = range;
      }
    } else if (isCompleteRange(range)) {
      setValue(range);
      validation.commitValidation();
    } else {
      dateRangeRef.value = range;
    }

    if (shouldClose) {
      overlayState.setOpen(false);
    }
  };

  const setTimeRange = (range: RangeValue<TimeValue | null>) => {
    if (isCompleteRange(dateRangeRef.value) && isCompleteRange(range)) {
      commitValue(dateRangeRef.value, range as TimeRange);
    } else {
      timeRangeRef.value = range;
    }
  };

  const formatOpts = computed<FormatterOptions>(() => {
    const current = value.value;
    const showEra = Boolean(
      (current?.start?.calendar?.identifier === "gregory" && current.start?.era === "BC")
      || (current?.end?.calendar?.identifier === "gregory" && current.end?.era === "BC")
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
    getRangeValidationResult(
      value.value,
      props.minValue,
      props.maxValue,
      props.isDateUnavailable,
      formatOpts.value
    )
  );

  const validation = useFormValidationState({
    ...props,
    validationState: props.validationState ?? undefined,
    value: () => controlledValueRef.value as RangeValue<MappedDateValue<T>> | null,
    name: () => [props.startName, props.endName].filter((name) => name != null),
    builtinValidation,
  });

  const isValueInvalid = computed(() => validation.displayValidation.isInvalid);
  const validationState = computed<ValidationState | null>(() =>
    (props.validationState as ValidationState | null | undefined)
      || (isValueInvalid.value ? "invalid" : null)
  );

  const state: DateRangePickerState = {
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
      if (
        !isOpen
        && !(value.value?.start && value.value?.end)
        && isCompleteRange(dateRangeRef.value)
        && hasTime.value
      ) {
        commitValue(dateRangeRef.value, {
          start: timeRangeRef.value?.start || getPlaceholderTime(props.placeholderValue),
          end: timeRangeRef.value?.end || getPlaceholderTime(props.placeholderValue),
        });
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
      return value.value;
    },
    get defaultValue() {
      return (props.defaultValue ?? initialValue) as DateRange | null;
    },
    setValue,
    get dateRange() {
      return dateRangeRef.value;
    },
    setDateRange,
    get timeRange() {
      return timeRangeRef.value;
    },
    setTimeRange,
    get granularity() {
      return granularity.value;
    },
    get hasTime() {
      return hasTime.value;
    },
    setDate(part, date) {
      if (part === "start") {
        setDateRange({ start: date, end: dateRangeRef.value?.end ?? null });
      } else {
        setDateRange({ start: dateRangeRef.value?.start ?? null, end: date });
      }
    },
    setTime(part, time) {
      if (part === "start") {
        setTimeRange({ start: time, end: timeRangeRef.value?.end ?? null });
      } else {
        setTimeRange({ start: timeRangeRef.value?.start ?? null, end: time });
      }
    },
    setDateTime(part, dateTime) {
      if (part === "start") {
        setValue({ start: dateTime, end: value.value?.end ?? null });
      } else {
        setValue({ start: value.value?.start ?? null, end: dateTime });
      }
    },
    get validationState() {
      return validationState.value;
    },
    get isInvalid() {
      return isValueInvalid.value;
    },
    formatValue(locale, fieldOptions: FieldOptions) {
      const current = value.value;
      if (!current || !current.start || !current.end) {
        return null;
      }

      const startTimeZone = "timeZone" in current.start ? current.start.timeZone : undefined;
      const startGranularity =
        props.granularity
        || (current.start && "minute" in current.start ? "minute" : "day");
      const endTimeZone = "timeZone" in current.end ? current.end.timeZone : undefined;
      const endGranularity =
        props.granularity
        || (current.end && "minute" in current.end ? "minute" : "day");

      const startOptions = getFormatOptions(fieldOptions, {
        granularity: startGranularity,
        timeZone: startTimeZone,
        hideTimeZone: props.hideTimeZone,
        hourCycle: props.hourCycle,
        showEra:
          (current.start.calendar.identifier === "gregory" && current.start.era === "BC")
          || (current.end.calendar.identifier === "gregory" && current.end.era === "BC"),
      });

      const startDate = current.start.toDate(startTimeZone || "UTC");
      const endDate = current.end.toDate(endTimeZone || "UTC");
      const startFormatter = new DateFormatter(locale, startOptions);

      let endFormatter: Intl.DateTimeFormat;

      if (
        startTimeZone === endTimeZone
        && startGranularity === endGranularity
        && current.start.compare(current.end) !== 0
      ) {
        try {
          const parts = startFormatter.formatRangeToParts(startDate, endDate);

          let separatorIndex = -1;
          for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (part.source === "shared" && part.type === "literal") {
              separatorIndex = i;
            } else if (part.source === "endRange") {
              break;
            }
          }

          let start = "";
          let end = "";
          for (let i = 0; i < parts.length; i++) {
            if (i < separatorIndex) {
              start += parts[i].value;
            } else if (i > separatorIndex) {
              end += parts[i].value;
            }
          }

          return { start, end };
        } catch {
          // ignore fallback
        }

        endFormatter = startFormatter;
      } else {
        const endOptions = getFormatOptions(fieldOptions, {
          granularity: endGranularity,
          timeZone: endTimeZone,
          hideTimeZone: props.hideTimeZone,
          hourCycle: props.hourCycle,
        });

        endFormatter = new DateFormatter(locale, endOptions);
      }

      return {
        start: startFormatter.format(startDate),
        end: endFormatter.format(endDate),
      };
    },
    getDateFormatter(locale, formatOptions: FormatterOptions) {
      const mergedOptions = { ...formatOpts.value, ...formatOptions };
      const nextFormatOptions = getFormatOptions({}, mergedOptions);
      return new DateFormatter(locale, nextFormatOptions);
    },
  };

  return state;
}
