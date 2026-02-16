import type { VNodeChild } from "vue";

import type {
  AriaLabelingProps,
  AriaValidationProps,
  DOMProps,
  FocusableProps,
  FocusEvents,
  HelpTextProps,
  InputBase,
  InputDOMProps,
  LabelableProps,
  Orientation,
  PressEvents,
  SpectrumHelpTextProps,
  SpectrumLabelableProps,
  StyleProps,
  Validation,
  ValueBase
} from "@vue-types/shared";

export interface RadioGroupProps extends ValueBase<string | null, string>, InputBase, Pick<InputDOMProps, "name">, Validation<string>, LabelableProps, HelpTextProps, FocusEvents {
  orientation?: Orientation;
}

export interface RadioProps extends FocusableProps {
  value: string;
  children?: VNodeChild;
  isDisabled?: boolean;
}

export interface AriaRadioGroupProps extends RadioGroupProps, InputDOMProps, DOMProps, AriaLabelingProps, AriaValidationProps {}

export interface SpectrumRadioGroupProps extends AriaRadioGroupProps, SpectrumLabelableProps, StyleProps, SpectrumHelpTextProps {
  children: VNodeChild | VNodeChild[];
  isEmphasized?: boolean;
}

export interface AriaRadioProps extends RadioProps, DOMProps, AriaLabelingProps, PressEvents {}

export interface SpectrumRadioProps extends Omit<AriaRadioProps, "onClick">, StyleProps {}
