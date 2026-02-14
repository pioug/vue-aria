export type ColorScheme = "light" | "dark";
export type Scale = "medium" | "large";
export type ValidationState = "valid" | "invalid";

export type ThemeSection = Record<string, string>;

export interface Theme {
  global?: ThemeSection;
  light?: ThemeSection;
  dark?: ThemeSection;
  medium?: ThemeSection;
  large?: ThemeSection;
  [key: string]: ThemeSection | undefined;
}

export interface ProviderContext {
  version: string;
  theme: Theme;
  breakpoints: Record<string, number>;
  colorScheme: ColorScheme;
  scale: Scale;
  isQuiet?: boolean;
  isEmphasized?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  isReadOnly?: boolean;
  validationState?: ValidationState;
}

export interface ProviderProps {
  theme?: Theme;
  defaultColorScheme?: ColorScheme;
  colorScheme?: ColorScheme;
  scale?: Scale;
  locale?: string;
  breakpoints?: Record<string, number>;
  isQuiet?: boolean;
  isEmphasized?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  isReadOnly?: boolean;
  validationState?: ValidationState;
}
