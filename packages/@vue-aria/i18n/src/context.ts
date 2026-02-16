import { computed, defineComponent, getCurrentInstance, h, inject, provide, type PropType } from "vue";
import { isRTL } from "./utils";
import { type Locale, useDefaultLocale } from "./useDefaultLocale";
import type { ReadonlyRef } from "@vue-types/shared";

const I18nContext = Symbol("vue-aria-i18n");

export interface I18nProviderProps {
  locale?: string;
}

const I18nProviderWithLocale = defineComponent({
  name: "I18nProviderWithLocale",
  props: {
    locale: {
      type: String as PropType<string>,
      required: true,
    },
  },
  setup(props, { slots }) {
    const value = computed<Locale>(() => ({
      locale: props.locale,
      direction: isRTL(props.locale) ? "rtl" : "ltr",
    }));

    provide(I18nContext, value);
    return () => slots.default?.() ?? h("span");
  },
});

const I18nProviderWithDefaultLocale = defineComponent({
  name: "I18nProviderWithDefaultLocale",
  setup(_props, { slots }) {
    const defaultLocale = useDefaultLocale();
    provide(I18nContext, defaultLocale);
    return () => slots.default?.() ?? h("span");
  },
});

export const I18nProvider = defineComponent({
  name: "I18nProvider",
  props: {
    locale: {
      type: String as PropType<string | undefined>,
      required: false,
    },
  },
  setup(props, { slots }) {
    return () => {
      if (props.locale) {
        return h(I18nProviderWithLocale, { locale: props.locale }, slots);
      }

      return h(I18nProviderWithDefaultLocale, null, slots);
    };
  },
});

export function useLocale(): ReadonlyRef<Locale> {
  const defaultLocale = useDefaultLocale();
  if (!getCurrentInstance()) {
    return defaultLocale;
  }

  const context = inject<ReadonlyRef<Locale> | null>(I18nContext, null);
  return computed(() => context?.value || defaultLocale.value);
}
