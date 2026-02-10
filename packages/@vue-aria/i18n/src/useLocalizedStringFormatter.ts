import {
  LocalizedStringDictionary,
  LocalizedStringFormatter,
  type LocalizedString,
  type LocalizedStrings,
} from "@internationalized/string";
import { computed } from "vue";
import type { ReadonlyRef } from "@vue-aria/types";
import { useLocale } from "./useLocale";

const dictionaryCache = new WeakMap<
  object,
  LocalizedStringDictionary<string, LocalizedString>
>();

function getCachedDictionary<K extends string = string, T extends LocalizedString = string>(
  strings: LocalizedStrings<K, T>
): LocalizedStringDictionary<K, T> {
  const key = strings as unknown as object;
  const existing = dictionaryCache.get(key);
  if (existing) {
    return existing as LocalizedStringDictionary<K, T>;
  }

  const dictionary = new LocalizedStringDictionary(strings);
  dictionaryCache.set(
    key,
    dictionary as LocalizedStringDictionary<string, LocalizedString>
  );
  return dictionary;
}

export function useLocalizedStringDictionary<
  K extends string = string,
  T extends LocalizedString = string,
>(
  strings: LocalizedStrings<K, T>,
  packageName?: string
): LocalizedStringDictionary<K, T> {
  return (
    (packageName
      ? LocalizedStringDictionary.getGlobalDictionaryForPackage(packageName)
      : null) ?? getCachedDictionary(strings)
  );
}

export function useLocalizedStringFormatter<
  K extends string = string,
  T extends LocalizedString = string,
>(
  strings: LocalizedStrings<K, T>,
  packageName?: string
): ReadonlyRef<LocalizedStringFormatter<K, T>> {
  const locale = useLocale();
  const dictionary = useLocalizedStringDictionary(strings, packageName);

  return computed(
    () => new LocalizedStringFormatter(locale.value.locale, dictionary)
  );
}
