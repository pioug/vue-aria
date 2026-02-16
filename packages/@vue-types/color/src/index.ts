import type { VNodeChild } from "vue";

import type {
  AriaLabelingProps,
  AriaValidationProps,
  DimensionValue,
  DOMProps,
  FocusableDOMProps,
  FocusableProps,
  HelpTextProps,
  InputBase,
  InputDOMProps,
  LabelableProps,
  SpectrumFieldValidation,
  SpectrumLabelableProps,
  SpectrumTextInputBase,
  SliderProps,
  StyleProps,
  TextInputBase,
  TextInputDOMProps,
  Validation,
  ValueBase
} from "@vue-types/shared";

/** A list of supported color formats. */
export type ColorFormat = "hex" | "hexa" | "rgb" | "rgba" | "hsl" | "hsla" | "hsb" | "hsba";

export type ColorSpace = "rgb" | "hsl" | "hsb";

/** A list of color channels. */
export type ColorChannel = "hue" | "saturation" | "brightness" | "lightness" | "red" | "green" | "blue" | "alpha";

export interface ColorChannelRange {
  minValue: number;
  maxValue: number;
  step: number;
  pageSize: number;
}

/** Represents a color value. */
export interface Color {
  toFormat(format: ColorFormat): Color;
  toString(format?: ColorFormat | "css"): string;
  clone(): Color;
  toHexInt(): number;
  getChannelValue(channel: ColorChannel): number;
  withChannelValue(channel: ColorChannel, value: number): Color;
  getChannelRange(channel: ColorChannel): ColorChannelRange;
  getChannelName(channel: ColorChannel, locale: string): string;
  getChannelFormatOptions(channel: ColorChannel): Intl.NumberFormatOptions;
  formatChannelValue(channel: ColorChannel, locale: string): string;
  getColorSpace(): ColorSpace;
  getColorSpaceAxes(xyChannels: {xChannel?: ColorChannel; yChannel?: ColorChannel}): ColorChannel[];
  getColorChannels(): [ColorChannel, ColorChannel, ColorChannel];
  getColorName(locale: string): string;
  getHueName(locale: string): string;
}

export interface ColorFieldProps extends Omit<ValueBase<string | Color | null>, "onChange">, InputBase, Validation<Color | null>, FocusableProps, TextInputBase, LabelableProps, HelpTextProps {
  onChange?: (color: Color | null) => void;
}

export interface AriaColorFieldProps extends ColorFieldProps, AriaLabelingProps, FocusableDOMProps, Omit<TextInputDOMProps, "minLength" | "maxLength" | "pattern" | "type" | "inputMode" | "autoComplete" | "autoCorrect" | "spellCheck">, AriaValidationProps {
  isWheelDisabled?: boolean;
}

export interface SpectrumColorFieldProps extends SpectrumTextInputBase, Omit<AriaColorFieldProps, "isInvalid" | "validationState">, SpectrumFieldValidation<Color | null>, SpectrumLabelableProps, StyleProps {
  channel?: ColorChannel;
  colorSpace?: ColorSpace;
  isQuiet?: boolean;
}

export interface ColorWheelProps extends Omit<ValueBase<string | Color>, "onChange"> {
  isDisabled?: boolean;
  onChange?: (value: Color) => void;
  onChangeEnd?: (value: Color) => void;
  defaultValue?: string | Color;
}

export interface AriaColorWheelProps extends ColorWheelProps, InputDOMProps, DOMProps, AriaLabelingProps {}

export interface SpectrumColorWheelProps extends AriaColorWheelProps, Omit<StyleProps, "width" | "height"> {
  size?: DimensionValue;
}

export interface ColorSliderProps extends Omit<SliderProps<string | Color>, "minValue" | "maxValue" | "step" | "pageSize" | "onChange" | "onChangeEnd"> {
  colorSpace?: ColorSpace;
  channel: ColorChannel;
  onChange?: (value: Color) => void;
  onChangeEnd?: (value: Color) => void;
}

export interface AriaColorSliderProps extends ColorSliderProps, InputDOMProps, DOMProps, AriaLabelingProps {}

export interface SpectrumColorSliderProps extends AriaColorSliderProps, StyleProps {
  showValueLabel?: boolean;
  contextualHelp?: VNodeChild;
}

export interface ColorAreaProps extends Omit<ValueBase<string | Color>, "onChange"> {
  colorSpace?: ColorSpace;
  xChannel?: ColorChannel;
  yChannel?: ColorChannel;
  isDisabled?: boolean;
  onChange?: (value: Color) => void;
  onChangeEnd?: (value: Color) => void;
}

export interface AriaColorAreaProps extends ColorAreaProps, DOMProps, AriaLabelingProps {
  xName?: string;
  yName?: string;
  form?: string;
}

export interface SpectrumColorAreaProps extends AriaColorAreaProps, Omit<StyleProps, "width" | "height"> {
  size?: DimensionValue;
}
