import { DateFormatter, type DateFormatterOptions as IntlDateFormatterOptions } from "@internationalized/date";
import { useDeepMemo } from "@vue-aria/utils";
import { computed } from "vue";
import { useLocale } from "./context";

export interface DateFormatterOptions extends IntlDateFormatterOptions {
  calendar?: string;
}

function isEqual(a: DateFormatterOptions, b: DateFormatterOptions) {
  if (a === b) {
    return true;
  }

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false;
  }

  for (const key of aKeys) {
    if ((b as any)[key] !== (a as any)[key]) {
      return false;
    }
  }

  return true;
}

export function useDateFormatter(options?: DateFormatterOptions): DateFormatter {
  options = useDeepMemo(options ?? {}, isEqual);
  const locale = useLocale();
  return computed(() => new DateFormatter(locale.value.locale, options)).value;
}
