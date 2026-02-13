import { useLocale } from "./context";

const cache = new Map<string, Intl.Collator>();

export function useCollator(options?: Intl.CollatorOptions): Intl.Collator {
  const { locale } = useLocale().value;
  const cacheKey = locale + (options ? Object.entries(options).sort((a, b) => a[0] < b[0] ? -1 : 1).join() : "");

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  const formatter = new Intl.Collator(locale, options);
  cache.set(cacheKey, formatter);
  return formatter;
}
