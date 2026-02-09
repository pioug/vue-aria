export {
  DEFAULT_BREAKPOINTS,
  provideSpectrumProvider,
  useSpectrumProvider,
  useSpectrumProviderContext,
  useSpectrumProviderProps,
  useSpectrumProviderDOMProps,
} from "./useProvider";
export {
  DEFAULT_SPECTRUM_THEME_CLASS_MAP,
  SPECTRUM_COLOR_SCHEMES,
  SPECTRUM_SCALES,
} from "./themeBaseline";
export { useColorScheme, useScale, useMediaQuery } from "./mediaQueries";

export type {
  SpectrumBreakpoints,
  SpectrumColorScheme,
  SpectrumProviderContext,
  SpectrumScale,
  SpectrumTheme,
  SpectrumThemeSection,
  SpectrumValidationState,
  ProvideSpectrumProviderOptions,
  SpectrumProviderDOMProps,
  UseSpectrumProviderDOMPropsOptions,
} from "./types";
export type {
  SpectrumColorSchemeName,
  SpectrumScaleName,
} from "./themeBaseline";
