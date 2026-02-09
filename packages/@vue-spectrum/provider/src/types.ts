import type { LocaleDirection } from "@vue-aria/i18n";
import type { MaybeReactive } from "@vue-aria/types";

export type SpectrumColorScheme = "light" | "dark";
export type SpectrumScale = "medium" | "large";
export type SpectrumValidationState = "valid" | "invalid";
export type SpectrumThemeSection = Record<string, string>;

export interface SpectrumTheme {
  global?: SpectrumThemeSection;
  light?: SpectrumThemeSection;
  dark?: SpectrumThemeSection;
  medium?: SpectrumThemeSection;
  large?: SpectrumThemeSection;
  [key: string]: SpectrumThemeSection | undefined;
}

export interface SpectrumBreakpoints {
  [key: string]: number;
}

export interface SpectrumProviderContext {
  theme: SpectrumTheme;
  breakpoints: SpectrumBreakpoints;
  colorScheme: string;
  scale: string;
  locale: string;
  direction: LocaleDirection;
  isQuiet?: boolean;
  isEmphasized?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  isReadOnly?: boolean;
  validationState?: SpectrumValidationState;
}

export interface ProvideSpectrumProviderOptions {
  theme?: MaybeReactive<SpectrumTheme | undefined>;
  defaultColorScheme?: MaybeReactive<SpectrumColorScheme | undefined>;
  colorScheme?: MaybeReactive<string | undefined>;
  scale?: MaybeReactive<string | undefined>;
  locale?: MaybeReactive<string | undefined>;
  direction?: MaybeReactive<LocaleDirection | undefined>;
  breakpoints?: MaybeReactive<SpectrumBreakpoints | undefined>;
  isQuiet?: MaybeReactive<boolean | undefined>;
  isEmphasized?: MaybeReactive<boolean | undefined>;
  isDisabled?: MaybeReactive<boolean | undefined>;
  isRequired?: MaybeReactive<boolean | undefined>;
  isReadOnly?: MaybeReactive<boolean | undefined>;
  validationState?: MaybeReactive<SpectrumValidationState | undefined>;
}

export interface SpectrumProviderProps {
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
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export interface UseSpectrumProviderDOMPropsOptions {
  UNSAFE_className?: MaybeReactive<string | undefined>;
  UNSAFE_style?: MaybeReactive<Record<string, string | number> | undefined>;
  colorScheme?: MaybeReactive<string | undefined>;
}

export interface SpectrumProviderDOMProps {
  class?: string;
  style: Record<string, string | number>;
  lang: string;
  dir: LocaleDirection;
}
