import type { DateFieldDisplayValidation } from "@vue-aria/datefield";
import type { MaybeReactive } from "@vue-aria/types";

export interface DateLike {
  toString: () => string;
}

export interface DateRangeValue<T = DateLike> {
  start?: T | null;
  end?: T | null;
}

export interface DatePickerPrivateValidationState {
  realtimeValidation?: unknown;
  displayValidation?: MaybeReactive<DateFieldDisplayValidation | undefined>;
  updateValidation?: (result: DateFieldDisplayValidation) => void;
  resetValidation?: () => void;
  commitValidation?: () => void;
}

export interface UseDatePickerState<T = DateLike> {
  value?: MaybeReactive<T | null | undefined>;
  defaultValue?: MaybeReactive<T | null | undefined>;
  dateValue?: MaybeReactive<T | null | undefined>;
  isOpen?: MaybeReactive<boolean | undefined>;
  isInvalid?: MaybeReactive<boolean | undefined>;
  displayValidation?: MaybeReactive<DateFieldDisplayValidation | undefined>;
  setOpen: (isOpen: boolean) => void;
  setValue?: (value: T | null | undefined) => void;
  setDateValue: (value: T | null | undefined) => void;
  formatValue?: (
    locale: string,
    options?: Intl.DateTimeFormatOptions
  ) => string | undefined;
}

export interface UseDateRangePickerState<T = DateLike> {
  value?: MaybeReactive<DateRangeValue<T> | null | undefined>;
  defaultValue?: MaybeReactive<DateRangeValue<T> | null | undefined>;
  dateRange?: MaybeReactive<DateRangeValue<T> | null | undefined>;
  isOpen?: MaybeReactive<boolean | undefined>;
  isInvalid?: MaybeReactive<boolean | undefined>;
  displayValidation?: MaybeReactive<DateFieldDisplayValidation | undefined>;
  realtimeValidation?: unknown;
  setOpen: (isOpen: boolean) => void;
  setDateTime: (part: "start" | "end", value: T | null | undefined) => void;
  setDateRange: (value: DateRangeValue<T> | null | undefined) => void;
  updateValidation?: (result: DateFieldDisplayValidation) => void;
  resetValidation?: () => void;
  commitValidation?: () => void;
  formatValue?: (
    locale: string,
    options?: Intl.DateTimeFormatOptions
  ) => { start: string; end: string } | undefined;
}

export interface DatePickerGroupState {
  setOpen?: (isOpen: boolean) => void;
}

export interface DatePickerValidationResult {
  isInvalid: boolean;
  validationErrors: string[];
  validationDetails: unknown;
}
