import {
  computed,
  defineComponent,
  h,
  inject,
  provide,
  type PropType,
} from "vue";
import type { ReadonlyRef } from "@vue-aria/types";
import { filterDOMProps } from "@vue-aria/utils";
import { classNames, type ClassValue } from "@vue-spectrum/utils";
import { provideSpectrumProvider } from "@vue-spectrum/provider";

export type LabelPosition = "top" | "side";
export type LabelAlign = "start" | "end";
export type NecessityIndicator = "icon" | "label";
export type ValidationState = "valid" | "invalid";
export type ValidationBehavior = "aria" | "native";

export interface SpectrumLabelableProps {
  labelPosition?: LabelPosition;
  labelAlign?: LabelAlign;
  necessityIndicator?: NecessityIndicator | undefined;
  validationBehavior?: ValidationBehavior | undefined;
}

export interface FormContextValue extends SpectrumLabelableProps {}

export interface SpectrumFormProps extends SpectrumLabelableProps {
  isRequired?: boolean | undefined;
  isQuiet?: boolean | undefined;
  isEmphasized?: boolean | undefined;
  isDisabled?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  validationState?: ValidationState | undefined;
  validationErrors?: Record<string, string | string[]> | undefined;
}

export type FormValidationErrors = Record<string, string | string[]>;

const FORM_CONTEXT_SYMBOL: unique symbol = Symbol("vue-spectrum-form-context");
const FORM_VALIDATION_ERRORS_SYMBOL: unique symbol = Symbol(
  "vue-spectrum-form-validation-errors"
);

const FORM_PROP_NAMES = new Set([
  "action",
  "autoComplete",
  "encType",
  "method",
  "target",
  "onSubmit",
  "onReset",
  "onInvalid",
]);

function filterFormDOMProps(
  props: Record<string, unknown>
): Record<string, unknown> {
  const domProps = filterDOMProps(props, { labelable: true });

  for (const propName of FORM_PROP_NAMES) {
    if (props[propName] !== undefined) {
      domProps[propName] = props[propName];
    }
  }

  return domProps;
}

export function useFormProps<T extends Record<string, unknown>>(props: T): T {
  const context = useFormContext();
  if (!context) {
    return props;
  }

  return {
    ...context.value,
    ...props,
  } as T;
}

export function useFormContext(): ReadonlyRef<FormContextValue> | null {
  return inject<ReadonlyRef<FormContextValue> | null>(
    FORM_CONTEXT_SYMBOL,
    null
  );
}

export function useFormValidationErrors(): ReadonlyRef<FormValidationErrors> {
  const validationErrors = inject<ReadonlyRef<FormValidationErrors> | null>(
    FORM_VALIDATION_ERRORS_SYMBOL,
    null
  );
  if (validationErrors) {
    return validationErrors;
  }

  return computed<FormValidationErrors>(() => ({}));
}

export const Form = defineComponent({
  name: "Form",
  inheritAttrs: false,
  props: {
    labelPosition: {
      type: String as PropType<LabelPosition>,
      default: "top",
    },
    labelAlign: {
      type: String as PropType<LabelAlign>,
      default: "start",
    },
    necessityIndicator: {
      type: String as PropType<NecessityIndicator | undefined>,
      default: undefined,
    },
    isRequired: {
      type: null as unknown as PropType<boolean | undefined>,
      default: undefined,
    },
    isQuiet: {
      type: null as unknown as PropType<boolean | undefined>,
      default: undefined,
    },
    isEmphasized: {
      type: null as unknown as PropType<boolean | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: null as unknown as PropType<boolean | undefined>,
      default: undefined,
    },
    isReadOnly: {
      type: null as unknown as PropType<boolean | undefined>,
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
    validationErrors: {
      type: Object as PropType<Record<string, string | string[]> | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    provideSpectrumProvider({
      isQuiet: computed(() => props.isQuiet),
      isEmphasized: computed(() => props.isEmphasized),
      isDisabled: computed(() => props.isDisabled),
      isReadOnly: computed(() => props.isReadOnly),
      isRequired: computed(() => props.isRequired),
      validationState: computed(() => props.validationState),
    });

    const formContext = computed<FormContextValue>(() => ({
      labelPosition: props.labelPosition,
      labelAlign: props.labelAlign,
      necessityIndicator: props.necessityIndicator,
      validationBehavior: props.validationBehavior,
    }));
    const validationErrors = computed<FormValidationErrors>(
      () => props.validationErrors ?? {}
    );

    provide(FORM_CONTEXT_SYMBOL, formContext);
    provide(FORM_VALIDATION_ERRORS_SYMBOL, validationErrors);

    const formProps = computed(() => {
      const filteredProps = filterFormDOMProps(attrs as Record<string, unknown>);
      const className = classNames(
        "spectrum-Form",
        {
          "spectrum-Form--positionSide": props.labelPosition === "side",
          "spectrum-Form--positionTop": props.labelPosition === "top",
        },
        filteredProps.class as ClassValue | undefined
      );

      return {
        ...filteredProps,
        class: className,
        noValidate: props.validationBehavior !== "native",
      };
    });

    return () => h("form", formProps.value, slots.default?.());
  },
});
