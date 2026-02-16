import type {
  AriaLabelingProps,
  DOMProps,
  FocusableProps,
  HelpTextProps,
  InputBase,
  InputDOMProps,
  LabelableProps,
  RangeInputBase,
  SpectrumFieldValidation,
  SpectrumLabelableProps,
  StyleProps,
  TextInputBase,
  TextInputDOMEvents,
  Validation,
  ValueBase
} from "@vue-types/shared";

export interface NumberFieldProps extends InputBase, Validation<number>, FocusableProps, TextInputBase, ValueBase<number>, RangeInputBase<number>, LabelableProps, HelpTextProps {
  formatOptions?: Intl.NumberFormatOptions;
}

export interface AriaNumberFieldProps extends NumberFieldProps, DOMProps, AriaLabelingProps, TextInputDOMEvents {
  decrementAriaLabel?: string;
  incrementAriaLabel?: string;
  isWheelDisabled?: boolean;
}

export interface SpectrumNumberFieldProps extends Omit<AriaNumberFieldProps, "placeholder" | "isInvalid" | "validationState">, SpectrumFieldValidation<number>, InputDOMProps, StyleProps, SpectrumLabelableProps {
  isQuiet?: boolean;
  hideStepper?: boolean;
}
