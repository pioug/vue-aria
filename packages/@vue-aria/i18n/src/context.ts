import { computed, defineComponent, h, inject, provide, type PropType } from "vue";
import { isRTL } from "./utils";
import { type Locale, useDefaultLocale } from "./useDefaultLocale";
import type { ReadonlyRef } from "@vue-aria/types";

const I18nContext = Symbol("vue-aria-i18n");

export interface I18nProviderProps {
  locale?: string;
}

export const I18nProvider = defineComponent({
  name: "I18nProvider",
  props: {
    locale: {
      type: String as PropType<string | undefined>,
      required: false,
    },
  },
  setup(props, { slots }) {
    const defaultLocale = useDefaultLocale();
    const value = computed<Locale>(() => {
      if (props.locale) {
        return {
          locale: props.locale,
          direction: isRTL(props.locale) ? "rtl" : "ltr",
        };
      }

      return defaultLocale.value;
    });

    provide(I18nContext, value);

    return () => slots.default?.() ?? h("span");
  },
});

export function useLocale(): ReadonlyRef<Locale> {
  const defaultLocale = useDefaultLocale();
  const context = inject<ReadonlyRef<Locale> | null>(I18nContext, null);
  return computed(() => context?.value || defaultLocale.value);
}
