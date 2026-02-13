import { computed } from "vue";
import { useLocale } from "./context";

export function useListFormatter(options: Intl.ListFormatOptions = {}): Intl.ListFormat {
  const locale = useLocale();
  return computed(() => new Intl.ListFormat(locale.value.locale, options)).value;
}
