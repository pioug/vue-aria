import { DateFormatter } from "@internationalized/date";
import { useDeepMemo } from "@vue-aria/utils";
import { useLocale } from "./context";
import { createFormatterProxy } from "./formatterProxy";

type IntlDateFormatterOptions = Intl.DateTimeFormatOptions;

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

const cache = new Map<string, DateFormatter>();

export function useDateFormatter(options?: DateFormatterOptions): DateFormatter {
  options = useDeepMemo(options ?? {}, isEqual);
  const locale = useLocale();

  return createFormatterProxy<DateFormatter>(() => {
    const localeKey = locale.value.locale;
    const optionsKey = JSON.stringify(options);
    const cacheKey = `${localeKey}:${optionsKey}`;

    let formatter = cache.get(cacheKey);
    if (!formatter) {
      formatter = new DateFormatter(localeKey, options);
      cache.set(cacheKey, formatter);
    }

    return formatter;
  });
}
