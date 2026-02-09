export {
  DEFAULT_BREAKPOINTS,
  provideSpectrumProvider,
  useSpectrumProvider,
  useSpectrumProviderContext,
  useSpectrumProviderProps,
  useSpectrumProviderDOMProps,
  DEFAULT_SPECTRUM_THEME_CLASS_MAP,
  SPECTRUM_COLOR_SCHEMES,
  SPECTRUM_SCALES,
  useColorScheme,
  useScale,
  useMediaQuery,
} from "@vue-spectrum/provider";

export { Icon, UIIcon, Illustration } from "@vue-spectrum/icon";
export { classNames } from "@vue-spectrum/utils";
export { Form, useFormProps, useFormValidationErrors } from "@vue-spectrum/form";
export { Label, HelpText, Field } from "@vue-spectrum/label";
export { Text, Heading, Keyboard } from "@vue-spectrum/text";

export type {
  FormContextValue,
  FormValidationErrors,
  LabelAlign,
  LabelPosition,
  NecessityIndicator,
  SpectrumFormProps,
  SpectrumLabelableProps,
  ValidationBehavior,
  ValidationState,
} from "@vue-spectrum/form";
export type {
  HelpTextProps,
  LabelElementType,
  SpectrumLabelProps,
} from "@vue-spectrum/label";
export type {
  HeadingProps,
  KeyboardProps,
  TextProps,
} from "@vue-spectrum/text";
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
  SpectrumColorSchemeName,
  SpectrumScaleName,
} from "@vue-spectrum/provider";
export type {
  BaseSpectrumIconProps,
  IconColorValue,
  IconProps,
  IconSize,
  IllustrationProps,
  UIIconProps,
} from "@vue-spectrum/icon";
export type { ClassValue } from "@vue-spectrum/utils";
