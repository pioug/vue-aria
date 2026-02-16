import type { VNodeChild } from "vue";

import type {
  Alignment,
  DOMProps,
  LabelPosition,
  NecessityIndicator,
  SpectrumFieldValidation,
  SpectrumHelpTextProps,
  StyleProps,
  Validation,
  ValidationResult
} from "@vue-types/shared";

export interface LabelProps {
  children?: VNodeChild;
  htmlFor?: string;
  for?: string;
  elementType?: string;
}

interface SpectrumLabelPropsBase extends LabelProps, DOMProps, StyleProps {
  labelPosition?: LabelPosition;
  labelAlign?: Alignment;
  isRequired?: boolean;
  necessityIndicator?: NecessityIndicator;
  includeNecessityIndicatorInAccessibilityName?: boolean;
}

export interface SpectrumLabelProps extends SpectrumLabelPropsBase, Record<string, unknown> {}

export interface SpectrumFieldProps extends SpectrumLabelPropsBase, SpectrumHelpTextProps, Omit<Validation<unknown>, "validationState">, SpectrumFieldValidation<unknown>, Partial<ValidationResult> {
  children: VNodeChild;
  label?: VNodeChild;
  contextualHelp?: VNodeChild;
  labelProps?: Record<string, unknown>;
  descriptionProps?: Record<string, unknown>;
  errorMessageProps?: Record<string, unknown>;
  wrapperClassName?: string;
  wrapperProps?: Record<string, unknown>;
}
