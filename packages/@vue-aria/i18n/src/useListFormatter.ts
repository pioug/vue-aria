import { useLocale } from "./context";
import { createFormatterProxy } from "./formatterProxy";

const cache = new Map<string, Intl.ListFormat>();

export function useListFormatter(options: Intl.ListFormatOptions = {}): Intl.ListFormat {
  const locale = useLocale();

  return createFormatterProxy<Intl.ListFormat>(() => {
    const localeKey = locale.value.locale;
    const optionsKey = JSON.stringify(options);
    const cacheKey = `${localeKey}:${optionsKey}`;

    let formatter = cache.get(cacheKey);
    if (!formatter) {
      formatter = new Intl.ListFormat(localeKey, options);
      cache.set(cacheKey, formatter);
    }

    return formatter;
  });
}
