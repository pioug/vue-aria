import {
  LocalizedStringDictionary,
  LocalizedStringFormatter,
  type LocalizedString,
  type LocalizedStrings,
} from "@internationalized/string";
import { computed } from "vue";
import { useLocale } from "./context";

const cache = new WeakMap<object, LocalizedStringDictionary<any, any>>();

function getCachedDictionary<K extends string, T extends LocalizedString>(
  strings: LocalizedStrings<K, T>
): LocalizedStringDictionary<K, T> {
  let dictionary = cache.get(strings as object) as LocalizedStringDictionary<K, T> | undefined;
  if (!dictionary) {
    dictionary = new LocalizedStringDictionary(strings);
    cache.set(strings as object, dictionary);
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
  const formatter = computed(() => new LocalizedStringFormatter(locale.value.locale, dictionary));
  return formatter.value;
}
