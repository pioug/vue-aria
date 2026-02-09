export {
  DEFAULT_BREAKPOINTS,
  provideSpectrumProvider,
  useSpectrumProvider,
  useSpectrumProviderContext,
  useSpectrumProviderProps,
  useSpectrumProviderDOMProps,
} from "./useProvider";
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
