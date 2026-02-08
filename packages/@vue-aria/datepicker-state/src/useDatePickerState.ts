import {
  DateFormatter,
  parseTime,
  toCalendarDate,
  toCalendarDateTime,
  toTime,
} from "@internationalized/date";
import { computed, ref, toValue } from "vue";
import { useOverlayTriggerState } from "@vue-aria/overlays-state";
import type { DateFieldDisplayValidation } from "@vue-aria/datefield";
import type { DateValue } from "@vue-aria/calendar-state";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";

export type DatePickerGranularity = "day" | "hour" | "minute" | "second";

export interface TimeValue {
  toString: () => string;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
  timeZone?: string;
}

export interface UseDatePickerStateOptions<T extends DateValue = DateValue> {
  value?: MaybeReactive<T | null | undefined>;
  defaultValue?: MaybeReactive<T | null | undefined>;
  onChange?: (value: T | null) => void;
  isOpen?: MaybeReactive<boolean | undefined>;
  defaultOpen?: MaybeReactive<boolean | undefined>;
  onOpenChange?: (isOpen: boolean) => void;
  shouldCloseOnSelect?: MaybeReactive<boolean | (() => boolean) | undefined>;
  placeholderValue?: MaybeReactive<T | null | undefined>;
  granularity?: MaybeReactive<DatePickerGranularity | undefined>;
  minValue?: MaybeReactive<T | null | undefined>;
  maxValue?: MaybeReactive<T | null | undefined>;
  isDateUnavailable?: (value: T) => boolean;
  validationState?: MaybeReactive<"valid" | "invalid" | undefined>;
  isInvalid?: MaybeReactive<boolean | undefined>;
}

export interface UseDatePickerStateResult<T extends DateValue = DateValue> {
  value: ReadonlyRef<T | null>;
  defaultValue: ReadonlyRef<T | null>;
  setValue: (value: T | null | undefined) => void;
  dateValue: ReadonlyRef<T | null>;
  setDateValue: (value: T | null | undefined) => void;
  timeValue: ReadonlyRef<TimeValue | null>;
  setTimeValue: (value: TimeValue | null | undefined) => void;
  granularity: ReadonlyRef<DatePickerGranularity>;
  hasTime: ReadonlyRef<boolean>;
  isOpen: ReadonlyRef<boolean>;
  setOpen: (isOpen: boolean) => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  isInvalid: ReadonlyRef<boolean>;
  validationState: ReadonlyRef<"invalid" | null>;
  displayValidation: ReadonlyRef<DateFieldDisplayValidation>;
  formatValue: (
    locale: string,
    options?: Intl.DateTimeFormatOptions
  ) => string;
  getDateFormatter: (
    locale: string,
    options?: Intl.DateTimeFormatOptions
  ) => DateFormatter;
}

function resolveBoolean(
  value: MaybeReactive<boolean | undefined> | undefined,
  fallback = false
): boolean {
  if (value === undefined) {
    return fallback;
  }
  return Boolean(toValue(value));
}

function resolveDate<T extends DateValue>(
  value: MaybeReactive<T | null | undefined> | undefined
): T | null {
  if (value === undefined) {
    return null;
  }
  return toValue(value) ?? null;
}

function resolveGranularity<T extends DateValue>(
  options: UseDatePickerStateOptions<T>,
  value: T | null
): DatePickerGranularity {
  if (options.granularity !== undefined) {
    return toValue(options.granularity) ?? "day";
  }

  if (value && value.hour !== undefined) {
    return value.second !== undefined && value.second !== 0 ? "second" : "minute";
  }

  return "day";
}

function hasCompare(
  value: unknown
): value is { compare: (other: unknown) => number } {
  return (
    typeof value === "object" &&
    value !== null &&
    "compare" in value &&
    typeof (value as { compare?: unknown }).compare === "function"
  );
}

function getPlaceholderTime(value: DateValue | null): TimeValue {
  if (value && value.hour !== undefined) {
    return toTime(value as never) as unknown as TimeValue;
  }

  return parseTime("00:00:00") as unknown as TimeValue;
}

function resolveShouldCloseOnSelect<T extends DateValue>(
  options: UseDatePickerStateOptions<T>
): boolean {
  const value = options.shouldCloseOnSelect;
  if (value === undefined) {
    return true;
  }

  const resolved = toValue(value);
  if (typeof resolved === "function") {
    return resolved();
  }

  return Boolean(resolved);
}

function commitDateTime(
  date: DateValue,
  time: TimeValue,
  template?: DateValue | null
): DateValue {
  if (
    template &&
    typeof template.set === "function" &&
    typeof template.timeZone === "string" &&
    template.timeZone.length > 0
  ) {
    return template.set({
      era: date.era,
      year: date.year,
      month: date.month,
      day: date.day,
      hour: time.hour,
      minute: time.minute,
      second: time.second,
      millisecond: time.millisecond,
    });
  }

  const maybeSet = (time as { set?: (value: unknown) => unknown }).set;
  if (
    typeof maybeSet === "function" &&
    typeof time.timeZone === "string" &&
    time.timeZone.length > 0
  ) {
    return maybeSet(toCalendarDate(date as never)) as DateValue;
  }

  return toCalendarDateTime(date as never, time as never) as unknown as DateValue;
}

export function useDatePickerState<T extends DateValue = DateValue>(
  options: UseDatePickerStateOptions<T> = {}
): UseDatePickerStateResult<T> {
  const uncontrolledValue = ref<T | null>(resolveDate(options.defaultValue));
  const isValueControlled = computed(() => options.value !== undefined);
  const value = computed<T | null>(() => {
    if (isValueControlled.value) {
      return resolveDate(options.value);
    }

    return uncontrolledValue.value;
  });
  const initialValue = ref(value.value);
  const defaultValue = computed<T | null>(() => {
    const resolved = resolveDate(options.defaultValue);
    return resolved ?? initialValue.value;
  });

  const setValue = (nextValue: T | null | undefined): void => {
    const normalizedValue = (nextValue ?? null) as T | null;
    if (!isValueControlled.value) {
      uncontrolledValue.value = normalizedValue;
    }

    options.onChange?.(normalizedValue);
  };

  const selectedDate = ref<T | null>(null);
  const selectedTime = ref<TimeValue | null>(null);
  const dateValue = computed<T | null>(() => selectedDate.value ?? value.value);
  const timeValue = computed<TimeValue | null>(() => {
    if (selectedTime.value) {
      return selectedTime.value;
    }

    if (value.value && value.value.hour !== undefined) {
      return toTime(value.value as never) as unknown as TimeValue;
    }

    return null;
  });

  const granularity = computed<DatePickerGranularity>(() =>
    resolveGranularity(
      options,
      value.value ?? resolveDate(options.placeholderValue)
    )
  );
  const hasTime = computed(
    () =>
      granularity.value === "hour" ||
      granularity.value === "minute" ||
      granularity.value === "second"
  );

  const overlayState = useOverlayTriggerState({
    isOpen: options.isOpen,
    defaultOpen: options.defaultOpen,
    onOpenChange: options.onOpenChange,
  });

  const commitValue = (date: T, time: TimeValue): void => {
    const template = (value.value ??
      resolveDate(options.defaultValue) ??
      resolveDate(options.placeholderValue)) as DateValue | null;
    const nextValue = commitDateTime(date, time, template) as T;
    setValue(nextValue);
    selectedDate.value = null;
    selectedTime.value = null;
  };

  const setDateValue = (nextValue: T | null | undefined): void => {
    const normalizedDate = nextValue ?? null;
    const shouldClose = resolveShouldCloseOnSelect(options);

    if (!normalizedDate) {
      setValue(null);
      if (shouldClose) {
        overlayState.setOpen(false);
      }
      return;
    }

    if (hasTime.value) {
      if (selectedTime.value || shouldClose) {
        const placeholderTime = getPlaceholderTime(
          (resolveDate(options.defaultValue) ??
            resolveDate(options.placeholderValue)) as DateValue | null
        );
        commitValue(normalizedDate, selectedTime.value ?? placeholderTime);
      } else {
        selectedDate.value = normalizedDate;
      }
    } else {
      setValue(normalizedDate);
    }

    if (shouldClose) {
      overlayState.setOpen(false);
    }
  };

  const setTimeValue = (nextValue: TimeValue | null | undefined): void => {
    const normalizedTime = nextValue ?? null;
    if (selectedDate.value && normalizedTime) {
      commitValue(selectedDate.value, normalizedTime);
      return;
    }

    selectedTime.value = normalizedTime;
  };

  const setOpen = (isOpen: boolean): void => {
    if (!isOpen && !value.value && selectedDate.value && hasTime.value) {
      const placeholderTime = getPlaceholderTime(
        (resolveDate(options.defaultValue) ??
          resolveDate(options.placeholderValue)) as DateValue | null
      );
      commitValue(selectedDate.value, selectedTime.value ?? placeholderTime);
    }

    overlayState.setOpen(isOpen);
  };

  const boundsInvalid = computed(() => {
    const currentValue = value.value;
    if (!currentValue || !hasCompare(currentValue)) {
      return false;
    }

    const minValue = resolveDate(options.minValue);
    const maxValue = resolveDate(options.maxValue);
    if (minValue && hasCompare(minValue) && currentValue.compare(minValue) < 0) {
      return true;
    }
    if (maxValue && hasCompare(maxValue) && currentValue.compare(maxValue) > 0) {
      return true;
    }
    if (options.isDateUnavailable && options.isDateUnavailable(currentValue)) {
      return true;
    }

    return false;
  });

  const isInvalid = computed(
    () =>
      resolveBoolean(options.isInvalid) ||
      (options.validationState !== undefined &&
        toValue(options.validationState) === "invalid") ||
      boundsInvalid.value
  );
  const validationState = computed<"invalid" | null>(() =>
    isInvalid.value ? "invalid" : null
  );
  const displayValidation = computed<DateFieldDisplayValidation>(() => ({
    isInvalid: isInvalid.value,
    validationErrors: [],
    validationDetails: undefined,
  }));

  const formatValue = (
    locale: string,
    dateFormatOptions: Intl.DateTimeFormatOptions = {}
  ): string => {
    const currentValue = value.value;
    if (!currentValue) {
      return "";
    }

    const timeZone = currentValue.timeZone ?? "UTC";
    const formatter = new DateFormatter(locale, dateFormatOptions);
    return formatter.format(currentValue.toDate(timeZone));
  };

  const getDateFormatter = (
    locale: string,
    dateFormatOptions: Intl.DateTimeFormatOptions = {}
  ): DateFormatter => new DateFormatter(locale, dateFormatOptions);

  return {
    value,
    defaultValue,
    setValue,
    dateValue,
    setDateValue,
    timeValue,
    setTimeValue,
    granularity,
    hasTime,
    isOpen: overlayState.isOpen,
    setOpen,
    open: overlayState.open,
    close: overlayState.close,
    toggle: overlayState.toggle,
    isInvalid,
    validationState,
    displayValidation,
    formatValue,
    getDateFormatter,
  };
}
