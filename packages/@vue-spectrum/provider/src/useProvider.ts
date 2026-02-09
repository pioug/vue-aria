import { computed, getCurrentInstance, inject, provide, readonly, toValue } from "vue";
import clsx from "clsx";
import { provideI18n } from "@vue-aria/i18n";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import { SPECTRUM_PROVIDER_SYMBOL } from "./context";
import { useColorScheme, useScale } from "./mediaQueries";
import type {
  ProvideSpectrumProviderOptions,
  SpectrumBreakpoints,
  SpectrumProviderContext,
  SpectrumProviderDOMProps,
  SpectrumTheme,
  UseSpectrumProviderDOMPropsOptions,
} from "./types";

export const DEFAULT_BREAKPOINTS: Readonly<SpectrumBreakpoints> = Object.freeze({
  S: 640,
  M: 768,
  L: 1024,
  XL: 1280,
  XXL: 1536,
});

function resolveOption<T>(
  option: MaybeReactive<T | undefined> | undefined,
  parentValue: T | undefined
): T | undefined {
  if (option === undefined) {
    return parentValue;
  }

  const resolved = toValue(option);
  if (resolved === undefined) {
    return parentValue;
  }

  return resolved;
}

function themeHasKey(theme: SpectrumTheme, key: string | undefined): key is string {
  if (!key) {
    return false;
  }

  return Boolean(theme[key]);
}

function useSpectrumProviderContextInternal(): ReadonlyRef<SpectrumProviderContext> | null {
  const instance = getCurrentInstance();
  if (instance) {
    const localContext = (
      instance as unknown as { provides?: Record<symbol, unknown> }
    ).provides?.[SPECTRUM_PROVIDER_SYMBOL] as
      | ReadonlyRef<SpectrumProviderContext>
      | undefined;
    if (localContext) {
      return localContext;
    }
  }

  return inject<ReadonlyRef<SpectrumProviderContext> | null>(
    SPECTRUM_PROVIDER_SYMBOL,
    null
  );
}

function resolveTheme(
  explicitTheme: SpectrumTheme | undefined,
  parent: SpectrumProviderContext | null
): SpectrumTheme {
  if (explicitTheme) {
    return explicitTheme;
  }

  if (parent?.theme) {
    return parent.theme;
  }

  throw new Error(
    "theme not found, the parent provider must have a theme provided"
  );
}

export function provideSpectrumProvider(
  options: ProvideSpectrumProviderOptions = {}
): ReadonlyRef<SpectrumProviderContext> {
  const parentRef = inject<ReadonlyRef<SpectrumProviderContext> | null>(
    SPECTRUM_PROVIDER_SYMBOL,
    null
  );

  const locale = provideI18n({
    locale: options.locale,
    direction: options.direction,
  });

  const theme = computed(() =>
    resolveTheme(
      options.theme === undefined ? undefined : toValue(options.theme),
      parentRef?.value ?? null
    )
  );

  const autoColorScheme = useColorScheme(theme, options.defaultColorScheme);
  const autoScale = useScale(theme);

  const context = computed<SpectrumProviderContext>(() => {
    const parent = parentRef?.value ?? null;
    const themeValue = theme.value;

    const explicitColorScheme =
      options.colorScheme === undefined ? undefined : toValue(options.colorScheme);
    const inheritedColorScheme = themeHasKey(themeValue, parent?.colorScheme)
      ? parent?.colorScheme
      : undefined;
    const colorScheme =
      explicitColorScheme ?? inheritedColorScheme ?? autoColorScheme.value;

    const explicitScale = options.scale === undefined ? undefined : toValue(options.scale);
    const inheritedScale = themeHasKey(themeValue, parent?.scale)
      ? parent?.scale
      : undefined;
    const scale = explicitScale ?? inheritedScale ?? autoScale.value;

    return {
      theme: themeValue,
      breakpoints:
        resolveOption(options.breakpoints, parent?.breakpoints) ??
        DEFAULT_BREAKPOINTS,
      colorScheme,
      scale,
      locale: locale.value.locale,
      direction: locale.value.direction,
      isQuiet: resolveOption(options.isQuiet, parent?.isQuiet),
      isEmphasized: resolveOption(options.isEmphasized, parent?.isEmphasized),
      isDisabled: resolveOption(options.isDisabled, parent?.isDisabled),
      isRequired: resolveOption(options.isRequired, parent?.isRequired),
      isReadOnly: resolveOption(options.isReadOnly, parent?.isReadOnly),
      validationState: resolveOption(options.validationState, parent?.validationState),
    };
  });

  if (getCurrentInstance()) {
    provide(SPECTRUM_PROVIDER_SYMBOL, context);
  }

  return readonly(context);
}

export function useSpectrumProvider(): ReadonlyRef<SpectrumProviderContext> {
  const context = useSpectrumProviderContextInternal();
  if (!context) {
    throw new Error(
      "No root provider found, please make sure your app is wrapped within a Spectrum provider context."
    );
  }

  return context;
}

export function useSpectrumProviderContext(): ReadonlyRef<SpectrumProviderContext> | null {
  return useSpectrumProviderContextInternal();
}

export function useSpectrumProviderProps<T extends Record<string, unknown>>(props: T): T {
  const context = useSpectrumProviderContextInternal();
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
  };
}

export function useSpectrumProviderDOMProps(
  options: UseSpectrumProviderDOMPropsOptions = {}
): ReadonlyRef<SpectrumProviderDOMProps> {
  const provider = useSpectrumProvider();

  return computed(() => {
    const theme = provider.value.theme;
    const colorScheme = toValue(options.colorScheme) ?? provider.value.colorScheme;

    const className = clsx(
      toValue(options.UNSAFE_className),
      Object.values(theme[colorScheme] ?? {}),
      Object.values(theme[provider.value.scale] ?? {}),
      theme.global ? Object.values(theme.global) : null
    );

    return {
      class: className || undefined,
      style: {
        ...(toValue(options.UNSAFE_style) ?? {}),
        colorScheme,
      },
      lang: provider.value.locale,
      dir: provider.value.direction,
    };
  });
}
