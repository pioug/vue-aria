import type { VNode, PropType } from "vue";
import type { LabelAlign, LabelPosition, NecessityIndicator } from "@vue-spectrum/form";

export type SpectrumTextFieldValidationState = "valid" | "invalid";
export type SpectrumTextFieldValidationBehavior = "aria" | "native";

export interface SpectrumTextFieldErrorMessageContext {
  isInvalid: boolean;
  validationErrors: string[];
  validationDetails: unknown;
}

export type SpectrumTextFieldErrorMessage =
  | string
  | ((
      context: SpectrumTextFieldErrorMessageContext
    ) => string | null | undefined);

export interface SpectrumTextFieldBaseProps {
  id?: string | undefined;
  label?: string | undefined;
  labelPosition?: LabelPosition | undefined;
  labelAlign?: LabelAlign | null | undefined;
  necessityIndicator?: NecessityIndicator | null | undefined;
  includeNecessityIndicatorInAccessibilityName?: boolean | undefined;
  description?: string | undefined;
  errorMessage?: SpectrumTextFieldErrorMessage | undefined;
  isDisabled?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  isRequired?: boolean | undefined;
  isInvalid?: boolean | undefined;
  validationState?: SpectrumTextFieldValidationState | undefined;
  validationBehavior?: SpectrumTextFieldValidationBehavior | undefined;
  isQuiet?: boolean | undefined;
  value?: string | undefined;
  defaultValue?: string | undefined;
  name?: string | undefined;
  form?: string | undefined;
  placeholder?: string | undefined;
  autoFocus?: boolean | undefined;
  autoComplete?: string | undefined;
  autoCapitalize?:
    | "off"
    | "none"
    | "on"
    | "sentences"
    | "words"
    | "characters"
    | undefined;
  inputMode?: string | undefined;
  autoCorrect?: string | undefined;
  spellCheck?: boolean | undefined;
  enterKeyHint?:
    | "enter"
    | "done"
    | "go"
    | "next"
    | "previous"
    | "search"
    | "send"
    | undefined;
  maxLength?: number | undefined;
  minLength?: number | undefined;
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
  "aria-describedby"?: string | undefined;
  "aria-errormessage"?: string | undefined;
  validate?:
    | ((value: string) => string | string[] | boolean | null | undefined)
    | undefined;
  onChange?: ((value: string) => void) | undefined;
  onInput?: ((event: Event) => void) | undefined;
  onFocus?: ((event: FocusEvent) => void) | undefined;
  onBlur?: ((event: FocusEvent) => void) | undefined;
  contextualHelp?: VNode | undefined;
  slot?: string | undefined;
  icon?: VNode | "" | null | undefined;
  loadingIndicator?: VNode | null | undefined;
  isLoading?: boolean | undefined;
  disableFocusRing?: boolean | undefined;
  excludeFromTabOrder?: boolean | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export interface SpectrumTextFieldProps extends SpectrumTextFieldBaseProps {
  type?: string | undefined;
  pattern?: string | undefined;
}

export interface SpectrumTextAreaProps extends SpectrumTextFieldBaseProps {
  rows?: number | undefined;
}

export const textFieldBasePropOptions = {
  id: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  label: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  labelPosition: {
    type: String as PropType<LabelPosition | undefined>,
    default: undefined,
  },
  labelAlign: {
    type: String as PropType<LabelAlign | null | undefined>,
    default: undefined,
  },
  necessityIndicator: {
    type: String as PropType<NecessityIndicator | null | undefined>,
    default: undefined,
  },
  includeNecessityIndicatorInAccessibilityName: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  description: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  errorMessage: {
    type: [String, Function] as PropType<SpectrumTextFieldErrorMessage | undefined>,
    default: undefined,
  },
  isDisabled: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  isReadOnly: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  isRequired: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  isInvalid: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  validationState: {
    type: String as PropType<SpectrumTextFieldValidationState | undefined>,
    default: undefined,
  },
  validationBehavior: {
    type: String as PropType<SpectrumTextFieldValidationBehavior | undefined>,
    default: undefined,
  },
  isQuiet: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  value: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  defaultValue: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  name: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  form: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  placeholder: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  autoFocus: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  autoComplete: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  autoCapitalize: {
    type: String as PropType<
      | "off"
      | "none"
      | "on"
      | "sentences"
      | "words"
      | "characters"
      | undefined
    >,
    default: undefined,
  },
  inputMode: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  autoCorrect: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  spellCheck: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  enterKeyHint: {
    type: String as PropType<
      | "enter"
      | "done"
      | "go"
      | "next"
      | "previous"
      | "search"
      | "send"
      | undefined
    >,
    default: undefined,
  },
  maxLength: {
    type: Number as PropType<number | undefined>,
    default: undefined,
  },
  minLength: {
    type: Number as PropType<number | undefined>,
    default: undefined,
  },
  "aria-label": {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  "aria-labelledby": {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  "aria-describedby": {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  "aria-errormessage": {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  validate: {
    type: Function as PropType<
      | ((value: string) => string | string[] | boolean | null | undefined)
      | undefined
    >,
    default: undefined,
  },
  onChange: {
    type: Function as PropType<((value: string) => void) | undefined>,
    default: undefined,
  },
  onInput: {
    type: Function as PropType<((event: Event) => void) | undefined>,
    default: undefined,
  },
  onFocus: {
    type: Function as PropType<((event: FocusEvent) => void) | undefined>,
    default: undefined,
  },
  onBlur: {
    type: Function as PropType<((event: FocusEvent) => void) | undefined>,
    default: undefined,
  },
  contextualHelp: {
    type: Object as PropType<VNode | undefined>,
    default: undefined,
  },
  slot: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  icon: {
    type: null as unknown as PropType<VNode | "" | null | undefined>,
    default: undefined,
  },
  loadingIndicator: {
    type: Object as PropType<VNode | null | undefined>,
    default: undefined,
  },
  isLoading: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  disableFocusRing: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  excludeFromTabOrder: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  UNSAFE_className: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  UNSAFE_style: {
    type: Object as PropType<Record<string, string | number> | undefined>,
    default: undefined,
  },
} as const;
