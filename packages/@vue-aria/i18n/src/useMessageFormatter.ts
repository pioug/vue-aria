import { MessageDictionary, MessageFormatter, type LocalizedStrings } from "@internationalized/message";
import { computed } from "vue";
import { useLocale } from "./context";

export type FormatMessage = (key: string, variables?: { [key: string]: any }) => string;

const cache = new WeakMap<object, MessageDictionary>();

function getCachedDictionary(strings: LocalizedStrings): MessageDictionary {
  let dictionary = cache.get(strings as object);
  if (!dictionary) {
    dictionary = new MessageDictionary(strings);
    cache.set(strings as object, dictionary);
  }

  return dictionary;
}

export function useMessageFormatter(strings: LocalizedStrings): FormatMessage {
  const locale = useLocale();
  const dictionary = getCachedDictionary(strings);

  const formatter = computed(() => new MessageFormatter(locale.value.locale, dictionary));

  return (key, variables) => formatter.value.format(key, variables);
}
