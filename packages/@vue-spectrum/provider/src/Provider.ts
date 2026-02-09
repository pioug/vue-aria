import {
  computed,
  defineComponent,
  h,
  type PropType,
} from "vue";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import type { LocaleDirection } from "@vue-aria/i18n";
import {
  provideSpectrumProvider,
  useSpectrumProviderContext,
  useSpectrumProviderDOMProps,
} from "./useProvider";
import type {
  SpectrumBreakpoints,
  SpectrumColorScheme,
  SpectrumTheme,
  SpectrumValidationState,
} from "./types";

function hasNonEmptyStyle(value: unknown): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }

  return Object.keys(value as Record<string, unknown>).length > 0;
}

function hasDOMProps(value: Record<string, unknown>): boolean {
  for (const [key, propValue] of Object.entries(value)) {
    if (key === "class") {
      if (propValue !== undefined && propValue !== null && propValue !== "") {
        return true;
      }
      continue;
    }

    if (key === "style") {
      if (hasNonEmptyStyle(propValue)) {
        return true;
      }
      continue;
    }

    return true;
  }

  return false;
}

export const Provider = defineComponent({
  name: "Provider",
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
    const parentProvider = useSpectrumProviderContext();

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

    const unsafeStyle = computed<Record<string, string | number> | undefined>(() => {
      const style: Record<string, string | number> = {};

      if (!parentProvider) {
        style.isolation = "isolate";
      }

      if (props.UNSAFE_style) {
        Object.assign(style, props.UNSAFE_style);
      }

      return Object.keys(style).length > 0 ? style : undefined;
    });

    const domProps = useSpectrumProviderDOMProps({
      colorScheme: computed(() => props.colorScheme),
      UNSAFE_className: computed(() => props.UNSAFE_className),
      UNSAFE_style: unsafeStyle,
    });

    const shouldWrapInDOM = computed(() => {
      if (!parentProvider) {
        return true;
      }

      if (
        props.locale !== undefined ||
        props.direction !== undefined ||
        props.theme !== undefined ||
        props.defaultColorScheme !== undefined ||
        props.colorScheme !== undefined ||
        props.scale !== undefined ||
        props.UNSAFE_className !== undefined ||
        props.UNSAFE_style !== undefined
      ) {
        return true;
      }

      return hasDOMProps(filterDOMProps(attrs as Record<string, unknown>));
    });

    return () => {
      const children = slots.default?.() ?? [];
      if (!shouldWrapInDOM.value) {
        return children;
      }

      const forwardedDOMProps = filterDOMProps(attrs as Record<string, unknown>);

      return h(
        "div",
        mergeProps(
          forwardedDOMProps,
          domProps.value as unknown as Record<string, unknown>
        ),
        children
      );
    };
  },
});
