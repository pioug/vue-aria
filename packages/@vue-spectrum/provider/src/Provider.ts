import { I18nProvider, useLocale } from "@vue-aria/i18n";
import { ModalProvider, useModalProvider } from "@vue-aria/overlays";
import type { ReadonlyRef } from "@vue-aria/types";
import { filterDOMProps, RouterProvider } from "@vue-aria/utils";
import {
  baseStyleProps,
  BreakpointProvider,
  shouldKeepSpectrumClassNames,
  useMatchedBreakpoints,
  useStyleProps,
} from "@vue-spectrum/utils";
import { computed, defineComponent, h, inject, onMounted, provide, ref, type PropType, type VNodeChild } from "vue";
import { ProviderContextSymbol } from "./context";
import { useColorScheme, useScale } from "./mediaQueries";
import type { ProviderContext, ProviderProps } from "./types";

const DEFAULT_BREAKPOINTS = { S: 640, M: 768, L: 1024, XL: 1280, XXL: 1536 };
const VERSION = "0.1.0";

const ProviderWrapper = defineComponent({
  name: "SpectrumProviderWrapper",
  inheritAttrs: false,
  props: {
    colorScheme: {
      type: String as PropType<ProviderProps["colorScheme"]>,
      required: false,
    },
    matchedBreakpoints: {
      type: Array as PropType<string[]>,
      required: true,
    },
    isRoot: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
    },
  },
  setup(props, { slots, attrs }) {
    const localeInfo = useLocale();
    const providerContext = inject<ReadonlyRef<ProviderContext> | null>(ProviderContextSymbol, null);
    if (!providerContext) {
      throw new Error("No root provider found, please wrap your app within a <Provider>.");
    }

    const { modalProviderProps } = useModalProvider();
    const domRef = ref<HTMLElement | null>(null);
    const hasWarned = ref(false);
    const { styleProps } = useStyleProps(attrs as Record<string, unknown>, baseStyleProps, {
      matchedBreakpoints: computed(() => props.matchedBreakpoints),
    });
    const domProps = computed(() => filterDOMProps(attrs as Record<string, unknown>));

    const className = computed(() => {
      const { theme, colorScheme, scale } = providerContext.value;
      const resolvedStyleProps = styleProps.value;
      const themeClasses = theme[colorScheme] ? Object.values(theme[colorScheme]!) : [];
      const scaleClasses = theme[scale] ? Object.values(theme[scale]!) : [];
      const themeKey = theme[colorScheme] ? Object.keys(theme[colorScheme]!)[0] : undefined;
      const scaleKey = theme[scale] ? Object.keys(theme[scale]!)[0] : undefined;
      const classes = [
        resolvedStyleProps.class,
        attrs.class,
        "vue-spectrum-provider",
        "spectrum",
        ...themeClasses,
        ...scaleClasses,
        ...(theme.global ? Object.values(theme.global) : []),
        {
          "react-spectrum-provider": shouldKeepSpectrumClassNames,
          spectrum: shouldKeepSpectrumClassNames,
          ...(themeKey ? { [themeKey]: shouldKeepSpectrumClassNames } : {}),
          ...(scaleKey ? { [scaleKey]: shouldKeepSpectrumClassNames } : {}),
        },
      ];
      return classes.filter(Boolean);
    });

    const style = computed(() => {
      const { theme, colorScheme } = providerContext.value;
      const resolvedStyleProps = styleProps.value;
      const availableColorSchemes = [theme.light ? "light" : null, theme.dark ? "dark" : null].filter(Boolean).join(" ");
      return {
        ...(resolvedStyleProps.style as Record<string, unknown> | undefined),
        ...(attrs.style as Record<string, unknown> | undefined),
        ...(props.isRoot ? { isolation: "isolate" } : {}),
        // Keep browser-native widgets (e.g. scrollbars) in sync with provider color mode.
        colorScheme: props.colorScheme ?? colorScheme ?? availableColorSchemes,
      };
    });

    onMounted(() => {
      const direction = localeInfo.value.direction;
      if (!direction || !domRef.value || hasWarned.value || process.env.NODE_ENV === "production") {
        return;
      }

      const closestDir = domRef.value.parentElement?.closest("[dir]");
      const parentDirection = closestDir?.getAttribute("dir");
      if (parentDirection && parentDirection !== direction) {
        console.warn(`Language directions cannot be nested. ${direction} inside ${parentDirection}.`);
        hasWarned.value = true;
      }
    });

    return () =>
      h(
        "div",
        {
          ...domProps.value,
          ...modalProviderProps,
          class: className.value,
          style: style.value,
          lang: localeInfo.value.locale,
          dir: localeInfo.value.direction,
          ref: domRef,
        },
        slots.default?.()
      );
  },
});

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
    router: {
      type: Object as PropType<ProviderProps["router"]>,
      required: false,
    },
  },
  setup(props, { slots, attrs }) {
    const parentContext = inject<ReadonlyRef<ProviderContext> | null>(ProviderContextSymbol, null);
    const currentLocale = useLocale();
    if (props.router) {
      RouterProvider(props.router);
    }

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
    const matchedBreakpoints = useMatchedBreakpoints(computed(() => context.value.breakpoints));

    const shouldWrap = computed(() => {
      const parent = parentContext?.value;
      if (!parent) {
        return true;
      }

      return Boolean(
        props.locale
        || resolvedTheme.value !== parent.theme
        || colorScheme.value !== parent.colorScheme
        || scale.value !== parent.scale
        || Object.keys(attrs).length > 0
      );
    });

    return () => {
      let contents: VNodeChild = slots.default?.() ?? null;
      if (shouldWrap.value) {
        const children = contents;
        contents = h(
          ProviderWrapper,
          {
            ...attrs,
            colorScheme: props.colorScheme,
            matchedBreakpoints: matchedBreakpoints.value,
            isRoot: !parentContext,
          },
          {
            default: () => children,
          }
        );
      }

      return h(
        I18nProvider,
        { locale: locale.value },
        {
          default: () =>
            h(
              BreakpointProvider,
              { matchedBreakpoints: matchedBreakpoints.value },
              () =>
                h(ModalProvider, null, {
                  default: () => contents,
                })
            ),
        }
      );
    };
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
