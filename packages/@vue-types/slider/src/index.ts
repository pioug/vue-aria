import type { VNodeChild } from "vue";

import type {
  AriaLabelingProps,
  AriaValidationProps,
  DOMProps,
  FocusableDOMProps,
  FocusableProps,
  InputDOMProps,
  LabelableProps,
  LabelPosition,
  Orientation,
  RangeInputBase,
  RangeValue,
  StyleProps,
  ValidationState,
  ValueBase
} from "@vue-types/shared";

export interface SliderProps<T = number | number[]> extends RangeInputBase<number>, ValueBase<T>, LabelableProps {
  orientation?: Orientation;
  isDisabled?: boolean;
  onChangeEnd?: (value: T) => void;
  minValue?: number;
  maxValue?: number;
  step?: number;
}

export interface SliderThumbProps extends FocusableProps, LabelableProps {
  orientation?: Orientation;
  isDisabled?: boolean;
  index?: number;
  isRequired?: boolean;
  isInvalid?: boolean;
  validationState?: ValidationState;
}

export interface AriaSliderProps<T = number | number[]> extends SliderProps<T>, DOMProps, AriaLabelingProps {}

export interface AriaSliderThumbProps extends SliderThumbProps, DOMProps, Omit<FocusableDOMProps, "excludeFromTabOrder">, InputDOMProps, AriaLabelingProps, AriaValidationProps {}

export interface SpectrumBarSliderBase<T> extends AriaSliderProps<T>, ValueBase<T>, StyleProps {
  formatOptions?: Intl.NumberFormatOptions;
  labelPosition?: LabelPosition;
  showValueLabel?: boolean;
  getValueLabel?: (value: T) => string;
  contextualHelp?: VNodeChild;
}

export interface SpectrumSliderProps extends SpectrumBarSliderBase<number>, InputDOMProps {
  isFilled?: boolean;
  fillOffset?: number;
  trackGradient?: string[];
}

export interface SpectrumRangeSliderProps extends SpectrumBarSliderBase<RangeValue<number>> {
  startName?: string;
  endName?: string;
  form?: string;
}
