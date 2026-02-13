import { useLocale } from "./context";
import { createFormatterProxy } from "./formatterProxy";

const cache = new Map<string, Intl.Collator>();

export function useCollator(options?: Intl.CollatorOptions): Intl.Collator {
  const locale = useLocale();

  return createFormatterProxy<Intl.Collator>(() => {
    const localeKey = locale.value.locale;
    const optionsKey = options ? Object.entries(options).sort((a, b) => (a[0] < b[0] ? -1 : 1)).join() : "";
    const cacheKey = `${localeKey}:${optionsKey}`;

    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    }

    const formatter = new Intl.Collator(localeKey, options);
    cache.set(cacheKey, formatter);
    return formatter;
  });
}
