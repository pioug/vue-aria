import { computed, getCurrentInstance, inject, provide, readonly, ref, toValue } from "vue";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import { isRTL } from "./utils";

export type LocaleDirection = "ltr" | "rtl";

export interface LocaleValue {
  locale: string;
  direction: LocaleDirection;
}

export interface ProvideI18nOptions {
  locale?: MaybeReactive<string | undefined>;
  direction?: MaybeReactive<LocaleDirection | undefined>;
}

const I18N_CONTEXT_SYMBOL: unique symbol = Symbol("vue-aria-i18n-context");

function detectLocale(): string {
  if (typeof navigator !== "undefined" && navigator.language) {
    return navigator.language;
  }

  return "en-US";
}

function getDefaultLocaleValue(): LocaleValue {
  const locale = detectLocale();
  return {
    locale,
    direction: isRTL(locale) ? "rtl" : "ltr",
  };
}

export function useDefaultLocale(): ReadonlyRef<LocaleValue> {
  const value = ref(getDefaultLocaleValue());
  return readonly(value);
}

export function useLocale(): ReadonlyRef<LocaleValue> {
  const context = getCurrentInstance()
    ? inject<ReadonlyRef<LocaleValue> | null>(I18N_CONTEXT_SYMBOL, null)
    : null;
  if (context) {
    return context;
  }

  return useDefaultLocale();
}

export function provideI18n(
  options: ProvideI18nOptions = {}
): ReadonlyRef<LocaleValue> {
  const parentLocale = useLocale();

  const value = computed<LocaleValue>(() => {
    const locale =
      options.locale === undefined
        ? parentLocale.value.locale
        : (toValue(options.locale) ?? parentLocale.value.locale);

    if (options.direction !== undefined) {
      return {
        locale,
        direction: toValue(options.direction) ?? parentLocale.value.direction,
      };
    }

    if (options.locale !== undefined) {
      return {
        locale,
        direction: isRTL(locale) ? "rtl" : "ltr",
      };
    }

    return {
      locale,
      direction: parentLocale.value.direction,
    };
  });

  if (getCurrentInstance()) {
    provide(I18N_CONTEXT_SYMBOL, value);
  }
  return readonly(value);
}
