import type { VNodeChild } from "vue";

import type { DOMProps, Href, RouterOptions, StyleProps, ValidationState } from "@vue-types/shared";

export type ColorScheme = "light" | "dark";
export type Scale = "medium" | "large";

export interface Breakpoints {
  S?: number;
  M?: number;
  L?: number;
  [custom: string]: number | undefined;
}

export type CSSModule = {
  [className: string]: string;
};

export interface Theme {
  global?: CSSModule;
  light?: CSSModule;
  dark?: CSSModule;
  medium?: CSSModule;
  large?: CSSModule;
}

interface ContextProps {
  isQuiet?: boolean;
  isEmphasized?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  isReadOnly?: boolean;
  validationState?: ValidationState;
}

interface Router {
  navigate: (path: string, routerOptions: RouterOptions | undefined) => void;
  useHref?: (href: Href) => string;
}

export interface ProviderProps extends ContextProps, DOMProps, StyleProps {
  children: VNodeChild;
  theme?: Theme;
  colorScheme?: ColorScheme;
  defaultColorScheme?: ColorScheme;
  scale?: Scale;
  locale?: string;
  breakpoints?: Breakpoints;
  router?: Router;
}

export interface ProviderContext extends ContextProps {
  version: string;
  theme: Theme;
  colorScheme: ColorScheme;
  scale: Scale;
  breakpoints: Breakpoints;
}
