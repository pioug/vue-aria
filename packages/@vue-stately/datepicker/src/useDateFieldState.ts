import {
  type Calendar,
  type CalendarIdentifier,
  DateFormatter,
  GregorianCalendar,
  isEqualCalendar,
  toCalendar,
} from "@internationalized/date";
import { NumberFormatter } from "@internationalized/number";
import { useFormValidationState } from "@vue-stately/form";
import { useControlledState } from "@vue-stately/utils";
import { computed, ref, watchEffect } from "vue";
import type { DateValue, ValidationState } from "@vue-stately/calendar";
import { IncompleteDate } from "./IncompleteDate";
import { getPlaceholder } from "./placeholders";
import {
  convertValue,
  createPlaceholderDate,
  getFormatOptions,
  getValidationResult,
  useDefaultProps,
} from "./utils";
import type {
  DateFieldState,
  DateFieldStateOptions,
  DateSegment,
  FieldOptions,
  FormatterOptions,
  Granularity,
  MappedDateValue,
  SegmentType,
} from "./types";

const EDITABLE_SEGMENTS: Record<string, boolean> = {
  year: true,
  month: true,
  day: true,
  hour: true,
  minute: true,
  second: true,
  dayPeriod: true,
  era: true,
};

const PAGE_STEP: Record<string, number> = {
  year: 5,
  month: 2,
  day: 7,
  hour: 2,
  minute: 15,
  second: 15,
};

const TYPE_MAPPING: Record<string, SegmentType> = {
  dayperiod: "dayPeriod",
  relatedYear: "year",
  yearName: "literal",
  unknown: "literal",
};

type HourCycle = "h12" | "h11" | "h23" | "h24";

/**
 * Provides state management for a date field component.
 */
export function useDateFieldState<T extends DateValue = DateValue>(
  props: DateFieldStateOptions<T>
): DateFieldState {
  const {
    locale,
    createCalendar,
    hideTimeZone,
    isDisabled = false,
    isReadOnly = false,
    isRequired = false,
    minValue,
    maxValue,
    isDateUnavailable,
  } = props;

  const originalValue: DateValue | null =
    props.value || props.defaultValue || props.placeholderValue || null;

  const [granularity, defaultTimeZone] = useDefaultProps(
    originalValue,
    props.granularity
  );
  const timeZone = defaultTimeZone || "UTC";

  if (originalValue && !(granularity in (originalValue as any))) {
    throw new Error(
      `Invalid granularity ${granularity} for value ${originalValue.toString()}`
    );
  }

  const resolver = new DateFormatter(locale, {
    dateStyle: "short",
    timeStyle: "short",
    hour12: props.hourCycle != null ? props.hourCycle === 12 : undefined,
  });
  const resolvedResolverOptions = resolver.resolvedOptions();
  const calendar = createCalendar(
    resolvedResolverOptions.calendar as CalendarIdentifier
  );
  const hourCycle = resolvedResolverOptions.hourCycle as HourCycle;

  const [valueRef, setDate] = useControlledState<
    DateValue | null,
    MappedDateValue<T> | null
  >(
    () => props.value as DateValue | null | undefined,
    () => (props.defaultValue ?? null) as DateValue | null,
    props.onChange as ((value: MappedDateValue<T> | null) => void) | undefined
  );

  const initialValue = valueRef.value;
  const calendarValue = computed(
    () => convertValue(valueRef.value, calendar) ?? null
  );

  const displayValueRef = ref(
    new IncompleteDate(calendar, hourCycle, calendarValue.value)
  );

  const displaySegments = computed<SegmentType[]>(() => {
    const is12HourClock = hourCycle === "h11" || hourCycle === "h12";
    const segments: SegmentType[] = [
      "era",
      "year",
      "month",
      "day",
      "hour",
      ...(is12HourClock ? (["dayPeriod"] as const) : []),
      "minute",
      "second",
    ];
    const minIndex = segments.indexOf(props.maxGranularity ?? "era");
    const maxIndex = segments.indexOf(
      granularity === "hour" && is12HourClock ? "dayPeriod" : granularity
    );
    return segments.slice(minIndex, maxIndex + 1);
  });

  const lastValueRef = ref(calendarValue.value);
  const lastCalendarRef = ref(calendar);
  const lastHourCycleRef = ref(hourCycle);
  watchEffect(() => {
    if (
      calendarValue.value !== lastValueRef.value
      || hourCycle !== lastHourCycleRef.value
      || !isEqualCalendar(calendar, lastCalendarRef.value)
    ) {
      const nextDisplayValue = new IncompleteDate(
        calendar,
        hourCycle,
        calendarValue.value
      );
      lastValueRef.value = calendarValue.value;
      lastCalendarRef.value = calendar;
      lastHourCycleRef.value = hourCycle;
      displayValueRef.value = nextDisplayValue;
    }
  });

  const showEra = computed(
    () =>
      calendar.identifier === "gregory" && displayValueRef.value.era === "BC"
  );
  const formatOpts = computed<FormatterOptions>(() => ({
    granularity,
    maxGranularity: props.maxGranularity ?? "year",
    timeZone: defaultTimeZone,
    hideTimeZone,
    hourCycle: props.hourCycle,
    showEra: showEra.value,
    shouldForceLeadingZeros: props.shouldForceLeadingZeros,
  }));
  const opts = computed(() => getFormatOptions({}, formatOpts.value));
  const dateFormatter = computed(() => new DateFormatter(locale, opts.value));
  const resolvedOptions = computed(() => dateFormatter.value.resolvedOptions());

  const placeholder = computed(() =>
    createPlaceholderDate(
      props.placeholderValue,
      granularity,
      calendar,
      defaultTimeZone
    )
  );

  const setDisplayValue = (value: IncompleteDate) => {
    displayValueRef.value = value;
  };

  const resetDisplayValue = () => {
    setDisplayValue(new IncompleteDate(calendar, hourCycle, calendarValue.value));
  };

  const setValue = (newValue: DateValue | IncompleteDate | null) => {
    if (props.isDisabled || props.isReadOnly) {
      return;
    }

    if (
      newValue == null
      || (newValue instanceof IncompleteDate
        && newValue.isCleared(displaySegments.value))
    ) {
      resetDisplayValue();
      setDate(null);
    } else if (!(newValue instanceof IncompleteDate)) {
      const emittedValue = toCalendar(
        newValue as any,
        (originalValue?.calendar || new GregorianCalendar()) as any
      );
      resetDisplayValue();
      setDate(emittedValue as MappedDateValue<T>);
    } else {
      if (newValue.isComplete(displaySegments.value)) {
        const dateValue = newValue.toValue(
          (calendarValue.value ?? placeholder.value) as any
        );
        if (newValue.validate(dateValue, displaySegments.value)) {
          const nextDateValue = toCalendar(
            dateValue as any,
            (originalValue?.calendar || new GregorianCalendar()) as any
          );
          if (
            !valueRef.value
            || (nextDateValue as any).compare(valueRef.value as any) !== 0
          ) {
            resetDisplayValue();
            setDate(nextDateValue as MappedDateValue<T>);
            return;
          }
        }
      }

      setDisplayValue(newValue);
    }
  };

  const dateValue = computed(() => {
    const value = displayValueRef.value.toValue(
      (calendarValue.value ?? placeholder.value) as any
    );
    return value.toDate(timeZone);
  });

  const segments = computed(() =>
    processSegments(
      dateValue.value,
      displayValueRef.value,
      dateFormatter.value,
      resolvedOptions.value,
      calendar,
      locale,
      granularity
    )
  );

  const adjustSegment = (type: SegmentType, amount: number) => {
    setValue(
      displayValueRef.value.cycle(
        type,
        amount,
        placeholder.value,
        displaySegments.value
      )
    );
  };

  const builtinValidation = computed(() =>
    getValidationResult(
      valueRef.value,
      minValue,
      maxValue,
      isDateUnavailable,
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

  return {
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
    get value() {
      return calendarValue.value;
    },
    get defaultValue() {
      return (props.defaultValue ?? initialValue) as DateValue | null;
    },
    get dateValue() {
      return dateValue.value;
    },
    get calendar() {
      return calendar;
    },
    setValue,
    get segments() {
      return segments.value;
    },
    get dateFormatter() {
      return dateFormatter.value;
    },
    get validationState() {
      return validationState.value;
    },
    get isInvalid() {
      return isValueInvalid.value;
    },
    get granularity() {
      return granularity;
    },
    get maxGranularity() {
      return props.maxGranularity ?? "year";
    },
    get isDisabled() {
      return isDisabled;
    },
    get isReadOnly() {
      return isReadOnly;
    },
    get isRequired() {
      return isRequired;
    },
    increment(part) {
      adjustSegment(part, 1);
    },
    decrement(part) {
      adjustSegment(part, -1);
    },
    incrementPage(part) {
      adjustSegment(part, PAGE_STEP[part] || 1);
    },
    decrementPage(part) {
      adjustSegment(part, -(PAGE_STEP[part] || 1));
    },
    incrementToMax(part) {
      const maxValue =
        part === "hour" && hourCycle === "h12"
          ? 11
          : displayValueRef.value.getSegmentLimits(part)?.maxValue;
      if (maxValue != null) {
        setValue(displayValueRef.value.set(part, maxValue, placeholder.value));
      }
    },
    decrementToMin(part) {
      const minValue =
        part === "hour" && hourCycle === "h12"
          ? 12
          : displayValueRef.value.getSegmentLimits(part)?.minValue;
      if (minValue != null) {
        setValue(displayValueRef.value.set(part, minValue, placeholder.value));
      }
    },
    setSegment(part, value: string | number) {
      setValue(displayValueRef.value.set(part, value, placeholder.value));
    },
    confirmPlaceholder() {
      if (props.isDisabled || props.isReadOnly) {
        return;
      }

      if (displayValueRef.value.isComplete(displaySegments.value)) {
        const resolvedDateValue = displayValueRef.value.toValue(
          (calendarValue.value ?? placeholder.value) as any
        );
        const nextDateValue = toCalendar(
          resolvedDateValue as any,
          (originalValue?.calendar || new GregorianCalendar()) as any
        );
        if (
          !valueRef.value
          || (nextDateValue as any).compare(valueRef.value as any) !== 0
        ) {
          setDate(nextDateValue as MappedDateValue<T>);
        }
        resetDisplayValue();
      }
    },
    clearSegment(part) {
      let nextValue = displayValueRef.value;
      if (part !== "timeZoneName" && part !== "literal") {
        nextValue = displayValueRef.value.clear(part);
      }
      setValue(nextValue);
    },
    formatValue(fieldOptions: FieldOptions) {
      if (!calendarValue.value) {
        return "";
      }

      const formatOptions = getFormatOptions(fieldOptions, formatOpts.value);
      const formatter = new DateFormatter(locale, formatOptions);
      return formatter.format(dateValue.value);
    },
    getDateFormatter(localeValue, formatOptions: FormatterOptions) {
      const mergedOptions = { ...formatOpts.value, ...formatOptions };
      const newFormatOptions = getFormatOptions({}, mergedOptions);
      return new DateFormatter(localeValue, newFormatOptions);
    },
  };
}

function processSegments(
  dateValue: Date,
  displayValue: IncompleteDate,
  dateFormatter: Intl.DateTimeFormat,
  resolvedOptions: Intl.ResolvedDateTimeFormatOptions,
  calendar: Calendar,
  locale: string,
  granularity: Granularity
): DateSegment[] {
  const timeSegments: SegmentType[] = ["hour", "minute", "second"];
  const segments = dateFormatter.formatToParts(dateValue);

  const numberFormatter = new NumberFormatter(locale, { useGrouping: false });
  const twoDigitFormatter = new NumberFormatter(locale, {
    useGrouping: false,
    minimumIntegerDigits: 2,
  });

  for (const segment of segments) {
    if (
      segment.type === "year"
      || segment.type === "month"
      || segment.type === "day"
      || segment.type === "hour"
    ) {
      const value = (displayValue as any)[segment.type] ?? 0;
      if ((resolvedOptions as any)[segment.type] === "2-digit") {
        segment.value = twoDigitFormatter.format(value);
      } else {
        segment.value = numberFormatter.format(value);
      }
    }
  }

  const processedSegments: DateSegment[] = [];
  for (const segment of segments) {
    const type = TYPE_MAPPING[segment.type] ?? (segment.type as SegmentType);
    let isEditable = Boolean(EDITABLE_SEGMENTS[type]);
    if (type === "era" && calendar.getEras().length === 1) {
      isEditable = false;
    }

    const isPlaceholder =
      Boolean(EDITABLE_SEGMENTS[type]) && (displayValue as any)[segment.type] == null;
    const placeholder = Boolean(EDITABLE_SEGMENTS[type])
      ? getPlaceholder(type, segment.value, locale)
      : "";

    const dateSegment: DateSegment = {
      type,
      text: isPlaceholder ? placeholder : segment.value,
      ...(displayValue.getSegmentLimits(type) ?? {}),
      isPlaceholder,
      placeholder,
      isEditable,
    };

    if (type === "hour") {
      processedSegments.push({
        type: "literal",
        text: "\u2066",
        isPlaceholder: false,
        placeholder: "",
        isEditable: false,
      });
      processedSegments.push(dateSegment);
      if (type === granularity) {
        processedSegments.push({
          type: "literal",
          text: "\u2069",
          isPlaceholder: false,
          placeholder: "",
          isEditable: false,
        });
      }
    } else if (timeSegments.includes(type) && type === granularity) {
      processedSegments.push(dateSegment);
      processedSegments.push({
        type: "literal",
        text: "\u2069",
        isPlaceholder: false,
        placeholder: "",
        isEditable: false,
      });
    } else {
      processedSegments.push(dateSegment);
    }
  }

  return processedSegments;
}
