import {
  GregorianCalendar,
  Time,
  getLocalTimeZone,
  toCalendarDateTime,
  toTime,
  toZoned,
  today,
} from "@internationalized/date";
import { useControlledState } from "@vue-stately/utils";
import { computed } from "vue";
import { useDateFieldState } from "./useDateFieldState";
import type { DateValue } from "@vue-stately/calendar";
import type {
  DateFieldState,
  MappedTimeValue,
  TimeFieldState,
  TimeFieldStateOptions,
  TimeValue,
} from "./types";

/**
 * Provides state management for a time field component.
 */
export function useTimeFieldState<T extends TimeValue = TimeValue>(
  props: TimeFieldStateOptions<T>
): TimeFieldState {
  const {
    placeholderValue = new Time(),
    minValue,
    maxValue,
    defaultValue,
    granularity,
    validate,
  } = props;

  const [valueRef, setValue] = useControlledState<
    TimeValue | null,
    MappedTimeValue<T> | null
  >(
    () => props.value as TimeValue | null | undefined,
    () => (defaultValue ?? null) as TimeValue | null,
    props.onChange as ((value: MappedTimeValue<T> | null) => void) | undefined
  );

  const v = computed(() => valueRef.value || placeholderValue);
  const day = computed<DateValue | undefined>(() =>
    v.value && "day" in (v.value as any) ? (v.value as DateValue) : undefined
  );
  const defaultValueTimeZone =
    defaultValue && "timeZone" in (defaultValue as any)
      ? (defaultValue as any).timeZone
      : undefined;

  const placeholderDate = computed(() => {
    const valueTimeZone =
      v.value && "timeZone" in (v.value as any)
        ? (v.value as any).timeZone
        : undefined;
    const convertedPlaceholder = convertValue(placeholderValue as TimeValue);
    return (valueTimeZone || defaultValueTimeZone) && placeholderValue
      ? toZoned(convertedPlaceholder as any, valueTimeZone || defaultValueTimeZone!)
      : convertedPlaceholder;
  });

  const minDate = computed(() => convertValue(minValue as TimeValue, day.value));
  const maxDate = computed(() => convertValue(maxValue as TimeValue, day.value));
  const timeValue = computed(() =>
    valueRef.value && "day" in (valueRef.value as any)
      ? toTime(valueRef.value as any)
      : (valueRef.value as Time | null)
  );
  const dateTime = computed(() =>
    valueRef.value == null ? null : convertValue(valueRef.value as TimeValue)
  );
  const defaultDateTime = computed(() =>
    defaultValue == null ? null : convertValue(defaultValue as TimeValue)
  );

  const onChange = (newValue: DateValue | null) => {
    setValue(
      (day.value || defaultValueTimeZone
        ? newValue
        : newValue && toTime(newValue as any)) as MappedTimeValue<T> | null
    );
  };

  const fieldState = useDateFieldState({
    ...props,
    get value() {
      return dateTime.value as DateValue | null;
    },
    get defaultValue() {
      return defaultDateTime.value as DateValue | null;
    },
    get minValue() {
      return minDate.value as DateValue | null | undefined;
    },
    get maxValue() {
      return maxDate.value as DateValue | null | undefined;
    },
    onChange,
    granularity: granularity || "minute",
    maxGranularity: "hour",
    get placeholderValue() {
      return placeholderDate.value ?? undefined;
    },
    createCalendar: () => new GregorianCalendar(),
    validate: () => validate?.(valueRef.value as MappedTimeValue<T> | null),
  } as any);

  const state = fieldState as DateFieldState & {
    readonly timeValue: Time | null;
  };

  Object.defineProperty(state, "timeValue", {
    enumerable: true,
    configurable: true,
    get() {
      return timeValue.value;
    },
  });

  return state as TimeFieldState;
}

function convertValue(
  value: TimeValue | null | undefined,
  date: DateValue = today(getLocalTimeZone())
) {
  if (!value) {
    return null;
  }

  if ("day" in (value as any)) {
    return value;
  }

  return toCalendarDateTime(date as any, value as any);
}
