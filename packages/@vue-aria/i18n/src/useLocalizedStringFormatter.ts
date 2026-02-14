import {
  LocalizedStringDictionary,
  LocalizedStringFormatter,
  type LocalizedString,
  type LocalizedStrings,
} from "@internationalized/string";
import { useLocale } from "./context";

const dictionaryCache = new WeakMap<object, LocalizedStringDictionary<any, any>>();
const formatterCache = new WeakMap<object, Map<string, LocalizedStringFormatter<any, any>>>();

function interpolateNamedVariables(
  message: string,
  variables?: Record<string, unknown>
): string {
  if (!variables || !message.includes("{")) {
    return message;
  }

  return message.replace(/\{([A-Za-z_][A-Za-z0-9_-]*)\}/g, (match, key: string) => {
    if (!Object.prototype.hasOwnProperty.call(variables, key)) {
      return match;
    }

    const value = variables[key];
    return value == null ? "" : String(value);
  });
}

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

  return new Proxy({} as LocalizedStringFormatter<K, T>, {
    get(_target, prop) {
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

      const value = (formatter as any)[prop as any];
      if (prop === "format" && typeof value === "function") {
        return (key: K, variables?: Record<string, unknown>) => {
          const formatted = value.call(formatter, key, variables);
          return typeof formatted === "string"
            ? interpolateNamedVariables(formatted, variables)
            : formatted;
        };
      }

      return typeof value === "function" ? value.bind(formatter) : value;
    },
  });
}
