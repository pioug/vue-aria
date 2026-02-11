import type { PropType } from "vue";
import type {
  LabelAlign,
  LabelPosition,
  NecessityIndicator,
  ValidationBehavior,
  ValidationState,
} from "@vue-spectrum/form";

export interface SpectrumNumberFieldErrorMessageContext {
  isInvalid: boolean;
  validationErrors: string[];
  validationDetails: unknown;
}

export type SpectrumNumberFieldErrorMessage =
  | string
  | ((
      context: SpectrumNumberFieldErrorMessageContext
    ) => string | null | undefined);

export interface SpectrumNumberFieldProps {
  id?: string | undefined;
  label?: string | undefined;
  labelPosition?: LabelPosition | undefined;
  labelAlign?: LabelAlign | null | undefined;
  necessityIndicator?: NecessityIndicator | null | undefined;
  includeNecessityIndicatorInAccessibilityName?: boolean | undefined;
  description?: string | undefined;
  errorMessage?: SpectrumNumberFieldErrorMessage | undefined;
  isDisabled?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  isRequired?: boolean | undefined;
  isInvalid?: boolean | undefined;
  validationState?: ValidationState | undefined;
  validationBehavior?: ValidationBehavior | undefined;
  isQuiet?: boolean | undefined;
  value?: number | undefined;
  defaultValue?: number | undefined;
  minValue?: number | undefined;
  maxValue?: number | undefined;
  step?: number | undefined;
  formatOptions?: Intl.NumberFormatOptions | undefined;
  decrementAriaLabel?: string | undefined;
  incrementAriaLabel?: string | undefined;
  hideStepper?: boolean | undefined;
  isWheelDisabled?: boolean | undefined;
  name?: string | undefined;
  form?: string | undefined;
  placeholder?: string | undefined;
  autoFocus?: boolean | undefined;
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
  "aria-describedby"?: string | undefined;
  "aria-errormessage"?: string | undefined;
  validate?:
    | ((value: number | undefined) => string | string[] | boolean | null | undefined)
    | undefined;
  onChange?: ((value: number | undefined) => void) | undefined;
  onFocus?: ((event: FocusEvent) => void) | undefined;
  onBlur?: ((event: FocusEvent) => void) | undefined;
  onKeydown?: ((event: KeyboardEvent) => void) | undefined;
  onKeyup?: ((event: KeyboardEvent) => void) | undefined;
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export const numberFieldPropOptions = {
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
    type: [String, Function] as PropType<SpectrumNumberFieldErrorMessage | undefined>,
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
    type: String as PropType<ValidationState | undefined>,
    default: undefined,
  },
  validationBehavior: {
    type: String as PropType<ValidationBehavior | undefined>,
    default: undefined,
  },
  isQuiet: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  value: {
    type: Number as PropType<number | undefined>,
    default: undefined,
  },
  defaultValue: {
    type: Number as PropType<number | undefined>,
    default: undefined,
  },
  minValue: {
    type: Number as PropType<number | undefined>,
    default: undefined,
  },
  maxValue: {
    type: Number as PropType<number | undefined>,
    default: undefined,
  },
  step: {
    type: Number as PropType<number | undefined>,
    default: undefined,
  },
  formatOptions: {
    type: Object as PropType<Intl.NumberFormatOptions | undefined>,
    default: undefined,
  },
  decrementAriaLabel: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  incrementAriaLabel: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  hideStepper: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  isWheelDisabled: {
    type: Boolean as PropType<boolean | undefined>,
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
      | ((value: number | undefined) => string | string[] | boolean | null | undefined)
      | undefined
    >,
    default: undefined,
  },
  onChange: {
    type: Function as PropType<((value: number | undefined) => void) | undefined>,
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
  onKeydown: {
    type: Function as PropType<((event: KeyboardEvent) => void) | undefined>,
    default: undefined,
  },
  onKeyup: {
    type: Function as PropType<((event: KeyboardEvent) => void) | undefined>,
    default: undefined,
  },
  slot: {
    type: String as PropType<string | undefined>,
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
