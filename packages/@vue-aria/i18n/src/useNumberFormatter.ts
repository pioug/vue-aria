import { NumberFormatter, type NumberFormatOptions } from "@internationalized/number";
import { computed } from "vue";
import { useLocale } from "./context";

export function useNumberFormatter(options: NumberFormatOptions = {}): Intl.NumberFormat {
  const locale = useLocale();
  return computed(() => new NumberFormatter(locale.value.locale, options)).value;
}
