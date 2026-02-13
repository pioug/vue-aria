import { NumberFormatter, type NumberFormatOptions } from "@internationalized/number";
import { useLocale } from "./context";
import { createFormatterProxy } from "./formatterProxy";

const cache = new Map<string, NumberFormatter>();

export function useNumberFormatter(options: NumberFormatOptions = {}): Intl.NumberFormat {
  const locale = useLocale();

  return createFormatterProxy<Intl.NumberFormat>(() => {
    const localeKey = locale.value.locale;
    const optionsKey = JSON.stringify(options);
    const cacheKey = `${localeKey}:${optionsKey}`;

    let formatter = cache.get(cacheKey);
    if (!formatter) {
      formatter = new NumberFormatter(localeKey, options);
      cache.set(cacheKey, formatter);
    }

    return formatter;
  });
}
