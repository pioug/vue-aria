import clsx from "clsx";
import type { LocaleDirection } from "@vue-aria/i18n";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import {
  computed,
  defineComponent,
  h,
  inject,
  provide,
  type InjectionKey,
  type PropType,
  type Ref,
} from "vue";
import {
  provideSpectrumProvider,
  useSpectrumProviderDOMProps,
  type SpectrumBreakpoints,
  type SpectrumColorScheme,
  type SpectrumTheme,
  type SpectrumValidationState,
} from "@vue-spectrum/provider";

export type ProviderBackground = "base" | "layer-1" | "layer-2";

export interface S2ProviderProps {
  theme?: SpectrumTheme | undefined;
  defaultColorScheme?: SpectrumColorScheme | undefined;
  colorScheme?: string | undefined;
  scale?: string | undefined;
  locale?: string | undefined;
  direction?: LocaleDirection | undefined;
  breakpoints?: SpectrumBreakpoints | undefined;
  isQuiet?: boolean | undefined;
  isEmphasized?: boolean | undefined;
  isDisabled?: boolean | undefined;
  isRequired?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  validationState?: SpectrumValidationState | undefined;
  background?: ProviderBackground | undefined;
  elementType?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export const ColorSchemeContext: InjectionKey<Ref<string | undefined>> =
  Symbol("S2ColorSchemeContext");

export function useColorSchemeContext(): string | null {
  const colorScheme = inject(ColorSchemeContext, null);
  return colorScheme?.value ?? null;
}

export const Provider = defineComponent({
  name: "S2Provider",
  inheritAttrs: false,
  props: {
    theme: {
      type: Object as PropType<SpectrumTheme | undefined>,
      default: undefined,
    },
    defaultColorScheme: {
      type: String as PropType<SpectrumColorScheme | undefined>,
      default: undefined,
    },
    colorScheme: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    scale: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    locale: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    direction: {
      type: String as PropType<LocaleDirection | undefined>,
      default: undefined,
    },
    breakpoints: {
      type: Object as PropType<SpectrumBreakpoints | undefined>,
      default: undefined,
    },
    isQuiet: {
      type: null as unknown as PropType<boolean | undefined>,
      default: undefined,
    },
    isEmphasized: {
      type: null as unknown as PropType<boolean | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: null as unknown as PropType<boolean | undefined>,
      default: undefined,
    },
    isRequired: {
      type: null as unknown as PropType<boolean | undefined>,
      default: undefined,
    },
    isReadOnly: {
      type: null as unknown as PropType<boolean | undefined>,
      default: undefined,
    },
    validationState: {
      type: String as PropType<SpectrumValidationState | undefined>,
      default: undefined,
    },
    background: {
      type: String as PropType<ProviderBackground | undefined>,
      default: undefined,
    },
    elementType: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    UNSAFE_className: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    UNSAFE_style: {
      type: Object as PropType<Record<string, string | number> | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    provideSpectrumProvider({
      theme: computed(() => props.theme),
      defaultColorScheme: computed(() => props.defaultColorScheme),
      colorScheme: computed(() => props.colorScheme),
      scale: computed(() => props.scale),
      locale: computed(() => props.locale),
      direction: computed(() => props.direction),
      breakpoints: computed(() => props.breakpoints),
      isQuiet: computed(() => props.isQuiet),
      isEmphasized: computed(() => props.isEmphasized),
      isDisabled: computed(() => props.isDisabled),
      isRequired: computed(() => props.isRequired),
      isReadOnly: computed(() => props.isReadOnly),
      validationState: computed(() => props.validationState),
    });

    const domProps = useSpectrumProviderDOMProps({
      colorScheme: computed(() => props.colorScheme),
      UNSAFE_className: computed(() => props.UNSAFE_className),
      UNSAFE_style: computed(() => props.UNSAFE_style),
    });

    const resolvedColorScheme = computed<string | undefined>(() => {
      const value = props.colorScheme ?? domProps.value.style.colorScheme;
      return typeof value === "string" ? value : undefined;
    });
    provide(ColorSchemeContext, resolvedColorScheme);

    return () => {
      const Element = props.elementType ?? "div";
      const forwardedDOMProps = filterDOMProps(attrs as Record<string, unknown>);

      return h(
        Element,
        mergeProps(
          forwardedDOMProps,
          domProps.value as unknown as Record<string, unknown>,
          {
          class: clsx("s2-Provider", domProps.value.class),
          "data-s2-background": props.background,
          }
        ) as unknown as Record<string, unknown>,
        slots.default?.() ?? []
      );
    };
  },
});
