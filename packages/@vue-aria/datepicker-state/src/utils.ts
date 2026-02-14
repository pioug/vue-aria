import {
  type Calendar,
  DateFormatter,
  getLocalTimeZone,
  now,
  Time,
  toCalendar,
  toCalendarDate,
  toCalendarDateTime,
} from "@internationalized/date";
import {
  LocalizedStringDictionary,
  LocalizedStringFormatter,
} from "@internationalized/string";
import {
  VALID_VALIDITY_STATE,
  mergeValidation,
  type ValidationResult,
} from "@vue-aria/form-state";
import type { DateValue, RangeValue } from "@vue-aria/calendar-state";
import type {
  DatePickerProps,
  FieldOptions,
  FormatterOptions,
  Granularity,
  TimeValue,
} from "./types";
import { intlMessages } from "./intlMessages";

const dictionary = new LocalizedStringDictionary(intlMessages as any);

function getLocale() {
  let locale =
    (typeof navigator !== "undefined"
      && (((navigator as any).language || (navigator as any).userLanguage) as string | undefined))
    || "en-US";

  try {
    Intl.DateTimeFormat.supportedLocalesOf([locale]);
  } catch {
    locale = "en-US";
  }

  return locale;
}

export function getValidationResult(
  value: DateValue | null,
  minValue: DateValue | null | undefined,
  maxValue: DateValue | null | undefined,
  isDateUnavailable: ((value: DateValue) => boolean) | undefined,
  options: FormatterOptions
): ValidationResult {
  const rangeOverflow = value != null && maxValue != null && value.compare(maxValue) > 0;
  const rangeUnderflow = value != null && minValue != null && value.compare(minValue) < 0;
  const unavailable = (value != null && isDateUnavailable?.(value)) || false;
  const invalid = rangeOverflow || rangeUnderflow || unavailable;
  const errors: string[] = [];

  if (invalid) {
    const locale = getLocale();
    const strings =
      LocalizedStringDictionary.getGlobalDictionaryForPackage("@react-stately/datepicker")
      || dictionary;
    const formatter = new LocalizedStringFormatter(locale, strings);
    const dateFormatter = new DateFormatter(locale, getFormatOptions({}, options));
    const timeZone = dateFormatter.resolvedOptions().timeZone;

    if (rangeUnderflow && minValue != null) {
      errors.push(
        formatter.format("rangeUnderflow", {
          minValue: dateFormatter.format(minValue.toDate(timeZone)),
        })
      );
    }

    if (rangeOverflow && maxValue != null) {
      errors.push(
        formatter.format("rangeOverflow", {
          maxValue: dateFormatter.format(maxValue.toDate(timeZone)),
        })
      );
    }

    if (unavailable) {
      errors.push(formatter.format("unavailableDate"));
    }
  }

  return {
    isInvalid: invalid,
    validationErrors: errors,
    validationDetails: {
      badInput: unavailable,
      customError: false,
      patternMismatch: false,
      rangeOverflow,
      rangeUnderflow,
      stepMismatch: false,
      tooLong: false,
      tooShort: false,
      typeMismatch: false,
      valueMissing: false,
      valid: !invalid,
    },
  };
}

export function getRangeValidationResult(
  value: RangeValue<DateValue | null> | null,
  minValue: DateValue | null | undefined,
  maxValue: DateValue | null | undefined,
  isDateUnavailable: ((value: DateValue) => boolean) | undefined,
  options: FormatterOptions
): ValidationResult {
  const startValidation = getValidationResult(
    value?.start ?? null,
    minValue,
    maxValue,
    isDateUnavailable,
    options
  );

  const endValidation = getValidationResult(
    value?.end ?? null,
    minValue,
    maxValue,
    isDateUnavailable,
    options
  );

  let result = mergeValidation(startValidation, endValidation);

  if (value?.end != null && value.start != null && value.end.compare(value.start) < 0) {
    const strings =
      LocalizedStringDictionary.getGlobalDictionaryForPackage("@react-stately/datepicker")
      || dictionary;
    result = mergeValidation(result, {
      isInvalid: true,
      validationErrors: [(strings as any).getStringForLocale("rangeReversed", getLocale())],
      validationDetails: {
        ...VALID_VALIDITY_STATE,
        rangeUnderflow: true,
        rangeOverflow: true,
        valid: false,
      },
    });
  }

  return result;
}

const DEFAULT_FIELD_OPTIONS: FieldOptions = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
};

const TWO_DIGIT_FIELD_OPTIONS: FieldOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

export function getFormatOptions(
  fieldOptions: FieldOptions,
  options: FormatterOptions
): Intl.DateTimeFormatOptions {
  const defaults = options.shouldForceLeadingZeros
    ? TWO_DIGIT_FIELD_OPTIONS
    : DEFAULT_FIELD_OPTIONS;

  fieldOptions = { ...defaults, ...fieldOptions };

  const granularity = options.granularity || "minute";
  const keys = Object.keys(fieldOptions) as Array<keyof FieldOptions>;

  let startIdx = keys.indexOf((options.maxGranularity ?? "year") as keyof FieldOptions);
  if (startIdx < 0) {
    startIdx = 0;
  }

  let endIdx = keys.indexOf(granularity as keyof FieldOptions);
  if (endIdx < 0) {
    endIdx = 2;
  }

  if (startIdx > endIdx) {
    throw new Error("maxGranularity must be greater than granularity");
  }

  const formatted = keys.slice(startIdx, endIdx + 1).reduce((acc, key) => {
    (acc as any)[key] = fieldOptions[key];
    return acc;
  }, {} as Intl.DateTimeFormatOptions);

  if (options.hourCycle != null) {
    formatted.hour12 = options.hourCycle === 12;
  }

  formatted.timeZone = options.timeZone || "UTC";

  const hasTime =
    granularity === "hour" || granularity === "minute" || granularity === "second";
  if (hasTime && options.timeZone && !options.hideTimeZone) {
    formatted.timeZoneName = "short";
  }

  if (options.showEra && startIdx === 0) {
    formatted.era = "short";
  }

  return formatted;
}

export function getPlaceholderTime(
  placeholderValue: DateValue | null | undefined
): TimeValue {
  if (placeholderValue && "hour" in placeholderValue) {
    return placeholderValue;
  }

  return new Time();
}

export function convertValue(
  value: DateValue | null | undefined,
  calendar: Calendar
): DateValue | null | undefined {
  if (value === null) {
    return null;
  }

  if (!value) {
    return undefined;
  }

  return toCalendar(value, calendar);
}

export function createPlaceholderDate(
  placeholderValue: DateValue | null | undefined,
  granularity: string,
  calendar: Calendar,
  timeZone: string | undefined
): DateValue {
  if (placeholderValue) {
    return convertValue(placeholderValue, calendar)!;
  }

  const date = toCalendar(
    now(timeZone ?? getLocalTimeZone()).set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    }),
    calendar
  );

  if (granularity === "year" || granularity === "month" || granularity === "day") {
    return toCalendarDate(date);
  }

  if (!timeZone) {
    return toCalendarDateTime(date);
  }

  return date;
}

export function useDefaultProps(
  value: DateValue | null,
  granularity: Granularity | undefined
): [Granularity, string | undefined] {
  const defaultTimeZone = value && "timeZone" in value ? value.timeZone : undefined;
  const defaultGranularity: Granularity = value && "minute" in value ? "minute" : "day";

  if (value && granularity && !(granularity in value)) {
    throw new Error(`Invalid granularity ${granularity} for value ${value.toString()}`);
  }

  return [granularity ?? defaultGranularity, defaultTimeZone];
}

export function resolveShouldClose(
  shouldCloseOnSelect: boolean | (() => boolean)
): boolean {
  return typeof shouldCloseOnSelect === "function"
    ? shouldCloseOnSelect()
    : shouldCloseOnSelect;
}

export function isCompleteRange<T>(
  value: RangeValue<T | null> | null | undefined
): value is RangeValue<T> {
  return Boolean(value?.start != null && value.end != null);
}

export type { FieldOptions, FormatterOptions };

export type DatePickerLikeProps = DatePickerProps<any>;
