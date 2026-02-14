import { I18nProvider, useLocale } from "@vue-aria/i18n";
import type { ReadonlyRef } from "@vue-aria/types";
import { computed, defineComponent, h, inject, provide, type PropType } from "vue";
import { ProviderContextSymbol } from "./context";
import { useColorScheme, useScale } from "./mediaQueries";
import type { ProviderContext, ProviderProps } from "./types";

const DEFAULT_BREAKPOINTS = { S: 640, M: 768, L: 1024, XL: 1280, XXL: 1536 };
const VERSION = "0.1.0";

/**
 * Root visual provider for Vue Spectrum packages.
 */
export const Provider = defineComponent({
  name: "SpectrumProvider",
  inheritAttrs: false,
  props: {
    theme: {
      type: Object as PropType<ProviderProps["theme"]>,
      required: false,
    },
    defaultColorScheme: {
      type: String as PropType<ProviderProps["defaultColorScheme"]>,
      required: false,
    },
    colorScheme: {
      type: String as PropType<ProviderProps["colorScheme"]>,
      required: false,
    },
    scale: {
      type: String as PropType<ProviderProps["scale"]>,
      required: false,
    },
    locale: {
      type: String as PropType<string | undefined>,
      required: false,
    },
    breakpoints: {
      type: Object as PropType<Record<string, number>>,
      required: false,
    },
    isQuiet: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
    },
    isEmphasized: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
    },
    isRequired: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
    },
    isReadOnly: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
    },
    validationState: {
      type: String as PropType<ProviderProps["validationState"]>,
      required: false,
    },
  },
  setup(props, { slots, attrs }) {
    const parentContext = inject<ReadonlyRef<ProviderContext> | null>(ProviderContextSymbol, null);
    const currentLocale = useLocale();

    const resolvedTheme = computed(() => props.theme ?? parentContext?.value.theme);
    if (!resolvedTheme.value) {
      throw new Error("theme not found, the parent provider must have a theme provided");
    }

    const autoColorScheme = useColorScheme(resolvedTheme.value, props.defaultColorScheme ?? "light");
    const autoScale = useScale(resolvedTheme.value);
    const canReuseParentColorScheme = computed(() =>
      Boolean(parentContext?.value.colorScheme && resolvedTheme.value?.[parentContext.value.colorScheme])
    );

    const colorScheme = computed(
      () =>
        props.colorScheme
        ?? (canReuseParentColorScheme.value ? parentContext?.value.colorScheme : undefined)
        ?? autoColorScheme.value
    );

    const scale = computed(() => props.scale ?? parentContext?.value.scale ?? autoScale.value);
    const locale = computed(() => props.locale ?? currentLocale.value.locale);
    const direction = computed(() => (props.locale ? (props.locale.startsWith("ar") || props.locale.startsWith("he") ? "rtl" : "ltr") : currentLocale.value.direction));

    const context = computed<ProviderContext>(() => {
      const parent = parentContext?.value;
      return {
        version: VERSION,
        theme: resolvedTheme.value!,
        breakpoints: props.breakpoints ?? parent?.breakpoints ?? DEFAULT_BREAKPOINTS,
        colorScheme: colorScheme.value,
        scale: scale.value,
        isQuiet: props.isQuiet ?? parent?.isQuiet,
        isEmphasized: props.isEmphasized ?? parent?.isEmphasized,
        isDisabled: props.isDisabled ?? parent?.isDisabled,
        isRequired: props.isRequired ?? parent?.isRequired,
        isReadOnly: props.isReadOnly ?? parent?.isReadOnly,
        validationState: props.validationState ?? parent?.validationState,
      };
    });

    provide(ProviderContextSymbol, context);

    const className = computed(() => {
      const theme = resolvedTheme.value!;
      const classes = [
        attrs.class,
        "vue-spectrum-provider",
        ...(theme[colorScheme.value] ? Object.values(theme[colorScheme.value]!) : []),
        ...(theme[scale.value] ? Object.values(theme[scale.value]!) : []),
        ...(theme.global ? Object.values(theme.global) : []),
      ];
      return classes.filter(Boolean);
    });

    const style = computed(() => ({
      ...(attrs.style as Record<string, unknown> | undefined),
      colorScheme: props.colorScheme ?? colorScheme.value,
    }));

    return () =>
      h(
        I18nProvider,
        { locale: locale.value },
        {
          default: () =>
            h(
              "div",
              {
                ...attrs,
                class: className.value,
                style: style.value,
                lang: locale.value,
                dir: direction.value,
              },
              slots.default?.()
            ),
        }
      );
  },
});

/**
 * Returns provider context from the nearest ancestor Provider.
 */
export function useProvider(): ProviderContext {
  const context = inject<ReadonlyRef<ProviderContext> | null>(ProviderContextSymbol, null);
  if (!context) {
    throw new Error("No root provider found, please wrap your app within a <Provider>.");
  }

  return context.value;
}

/**
 * Merges inherited provider props with local props.
 */
export function useProviderProps<T extends Record<string, unknown>>(props: T): T {
  const context = inject<ReadonlyRef<ProviderContext> | null>(ProviderContextSymbol, null);
  if (!context) {
    return props;
  }

  return {
    isQuiet: context.value.isQuiet,
    isEmphasized: context.value.isEmphasized,
    isDisabled: context.value.isDisabled,
    isRequired: context.value.isRequired,
    isReadOnly: context.value.isReadOnly,
    validationState: context.value.validationState,
    ...props,
  } as T;
}
