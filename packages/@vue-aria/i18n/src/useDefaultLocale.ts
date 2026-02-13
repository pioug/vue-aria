import { computed, onScopeDispose, ref } from "vue";
import { isRTL } from "./utils";
import { useIsSSR } from "@vue-aria/ssr";
import type { ReadonlyRef } from "@vue-aria/types";

export interface Locale {
  locale: string;
  direction: "ltr" | "rtl";
}

const localeSymbol = Symbol.for("react-aria.i18n.locale");

export function getDefaultLocale(): Locale {
  let locale = (
    typeof window !== "undefined" && (window as any)[localeSymbol]
  ) || (
    typeof navigator !== "undefined" && ((navigator as any).language || (navigator as any).userLanguage)
  ) || "en-US";

  try {
    Intl.DateTimeFormat.supportedLocalesOf([locale]);
  } catch {
    locale = "en-US";
  }

  return {
    locale,
    direction: isRTL(locale) ? "rtl" : "ltr",
  };
}

let currentLocale = getDefaultLocale();
const listeners = new Set<(locale: Locale) => void>();

function updateLocale() {
  currentLocale = getDefaultLocale();
  for (const listener of listeners) {
    listener(currentLocale);
  }
}

export function useDefaultLocale(): ReadonlyRef<Locale> {
  const isSSR = useIsSSR();
  const defaultLocale = ref(currentLocale);

  if (typeof window !== "undefined") {
    if (listeners.size === 0) {
      window.addEventListener("languagechange", updateLocale);
    }

    const listener = (locale: Locale) => {
      defaultLocale.value = locale;
    };

    listeners.add(listener);

    onScopeDispose(() => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        window.removeEventListener("languagechange", updateLocale);
      }
    });
  }

  if (isSSR) {
    const locale = typeof window !== "undefined" && (window as any)[localeSymbol];
    return computed(() => ({ locale: locale || "en-US", direction: "ltr" }));
  }

  return computed(() => defaultLocale.value);
}
