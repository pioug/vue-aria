import {
  LocalizedStringDictionary,
  LocalizedStringFormatter,
  type LocalizedString,
  type LocalizedStrings,
} from "@internationalized/string";
import { useLocale } from "./context";
import { createFormatterProxy } from "./formatterProxy";

const dictionaryCache = new WeakMap<object, LocalizedStringDictionary<any, any>>();
const formatterCache = new WeakMap<object, Map<string, LocalizedStringFormatter<any, any>>>();

function getCachedDictionary<K extends string, T extends LocalizedString>(
  strings: LocalizedStrings<K, T>
): LocalizedStringDictionary<K, T> {
  let dictionary = dictionaryCache.get(strings as object) as LocalizedStringDictionary<K, T> | undefined;
  if (!dictionary) {
    dictionary = new LocalizedStringDictionary(strings);
    dictionaryCache.set(strings as object, dictionary);
  }

  return dictionary;
}

export function useLocalizedStringDictionary<K extends string = string, T extends LocalizedString = string>(
  strings: LocalizedStrings<K, T>,
  packageName?: string
): LocalizedStringDictionary<K, T> {
  return (packageName && LocalizedStringDictionary.getGlobalDictionaryForPackage(packageName)) || getCachedDictionary(strings);
}

export function useLocalizedStringFormatter<K extends string = string, T extends LocalizedString = string>(
  strings: LocalizedStrings<K, T>,
  packageName?: string
): LocalizedStringFormatter<K, T> {
  const locale = useLocale();
  const dictionary = useLocalizedStringDictionary(strings, packageName);

  return createFormatterProxy<LocalizedStringFormatter<K, T>>(() => {
    const localeKey = locale.value.locale;
    let dictionaryFormatters = formatterCache.get(dictionary as unknown as object);
    if (!dictionaryFormatters) {
      dictionaryFormatters = new Map<string, LocalizedStringFormatter<any, any>>();
      formatterCache.set(dictionary as unknown as object, dictionaryFormatters);
    }

    let formatter = dictionaryFormatters.get(localeKey) as LocalizedStringFormatter<K, T> | undefined;

    if (!formatter) {
      formatter = new LocalizedStringFormatter(localeKey, dictionary);
      dictionaryFormatters.set(localeKey, formatter);
    }

    return formatter;
  });
}
