import type { VNodeChild } from "vue";

import type { AriaLabelingProps, DOMProps, SpectrumLabelableProps, StyleProps, ValidationErrors, ValidationState } from "@vue-types/shared";

export interface FormProps extends AriaLabelingProps {
  validationErrors?: ValidationErrors;
  action?: string;
  encType?: "application/x-www-form-urlencoded" | "multipart/form-data" | "text/plain";
  method?: "get" | "post" | "dialog";
  target?: "_blank" | "_self" | "_parent" | "_top";
  onSubmit?: (event: Event) => void;
  onReset?: (event: Event) => void;
  onInvalid?: (event: Event) => void;
  autoComplete?: "off" | "on";
  autoCapitalize?: "off" | "none" | "on" | "sentences" | "words" | "characters";
  role?: "search" | "presentation";
}

export interface SpectrumFormProps extends FormProps, DOMProps, StyleProps, Omit<SpectrumLabelableProps, "contextualHelp" | "label"> {
  children: VNodeChild | VNodeChild[];
  isQuiet?: boolean;
  isEmphasized?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  isReadOnly?: boolean;
  validationState?: ValidationState;
  validationBehavior?: "aria" | "native";
}
