import { MessageDictionary, MessageFormatter, type LocalizedStrings } from "@internationalized/message";
import { useLocale } from "./context";

export type FormatMessage = (key: string, variables?: { [key: string]: any }) => string;

const dictionaryCache = new WeakMap<object, MessageDictionary>();
const formatterCache = new Map<string, MessageFormatter>();

function getCachedDictionary(strings: LocalizedStrings): MessageDictionary {
  let dictionary = dictionaryCache.get(strings as object);
  if (!dictionary) {
    dictionary = new MessageDictionary(strings);
    dictionaryCache.set(strings as object, dictionary);
  }

  return dictionary;
}

export function useMessageFormatter(strings: LocalizedStrings): FormatMessage {
  const locale = useLocale();
  const dictionary = getCachedDictionary(strings);

  return (key, variables) => {
    const localeKey = locale.value.locale;
    const cacheKey = `${localeKey}:${dictionary as unknown as object}`;
    let formatter = formatterCache.get(cacheKey);

    if (!formatter) {
      formatter = new MessageFormatter(localeKey, dictionary);
      formatterCache.set(cacheKey, formatter);
    }

    return formatter.format(key, variables);
  };
}
