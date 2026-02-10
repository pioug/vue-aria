import { computed, defineComponent, h, ref, type PropType } from "vue";
import { useRadioGroup, type UseRadioGroupState } from "@vue-aria/radio";
import { mergeProps } from "@vue-aria/utils";
import { useFormProps } from "@vue-spectrum/form";
import { Field } from "@vue-spectrum/label";
import { useProviderContext } from "@vue-spectrum/provider";
import { classNames, type ClassValue } from "@vue-spectrum/utils";
import { provideRadioGroupContext } from "./context";

export type SpectrumRadioValidationBehavior = "aria" | "native";
export type SpectrumRadioGroupOrientation = "vertical" | "horizontal";

export interface SpectrumRadioGroupProps {
  value?: string | undefined;
  defaultValue?: string | undefined;
  onChange?: ((value: string) => void) | undefined;
  orientation?: SpectrumRadioGroupOrientation | undefined;
  label?: string | undefined;
  description?: string | undefined;
  errorMessage?: string | undefined;
  name?: string | undefined;
  form?: string | undefined;
  isEmphasized?: boolean | undefined;
  isDisabled?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  isRequired?: boolean | undefined;
  isInvalid?: boolean | undefined;
  validationState?: "valid" | "invalid" | undefined;
  validationBehavior?: SpectrumRadioValidationBehavior | undefined;
  direction?: "ltr" | "rtl" | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  ariaDescribedby?: string | undefined;
  ariaErrormessage?: string | undefined;
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export const RadioGroup = defineComponent({
  name: "RadioGroup",
  inheritAttrs: false,
  props: {
    value: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    defaultValue: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    onChange: {
      type: Function as PropType<((value: string) => void) | undefined>,
      default: undefined,
    },
    orientation: {
      type: String as PropType<SpectrumRadioGroupOrientation | undefined>,
      default: undefined,
    },
    label: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    description: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    errorMessage: {
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
    isEmphasized: {
      type: Boolean as PropType<boolean | undefined>,
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
      type: String as PropType<"valid" | "invalid" | undefined>,
      default: undefined,
    },
    validationBehavior: {
      type: String as PropType<SpectrumRadioValidationBehavior | undefined>,
      default: undefined,
    },
    direction: {
      type: String as PropType<"ltr" | "rtl" | undefined>,
      default: undefined,
    },
    ariaLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaLabelledby: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaDescribedby: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaErrormessage: {
      type: String as PropType<string | undefined>,
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
  },
  setup(props, { attrs, slots, expose }) {
    const provider = useProviderContext();
    const attrsRecord = attrs as Record<string, unknown>;
    const groupRef = ref<HTMLElement | null>(null);
    const uncontrolledValue = ref<string | null>(props.defaultValue ?? null);
    const lastFocusedValue = ref<string | null>(null);
    const resolvedFormProps = computed<Record<string, unknown>>(() =>
      useFormProps({
        isDisabled: props.isDisabled,
        isReadOnly: props.isReadOnly,
        isRequired: props.isRequired,
        validationState: props.validationState,
        validationBehavior: props.validationBehavior,
      })
    );
    const isControlled = computed(() => props.value !== undefined);
    const selectedValue = computed<string | null>(() => {
      if (isControlled.value) {
        return props.value ?? null;
      }

      return uncontrolledValue.value;
    });
    const isDisabled = computed(() => {
      if (props.isDisabled !== undefined) {
        return props.isDisabled;
      }

      const fromForm = resolvedFormProps.value.isDisabled;
      if (typeof fromForm === "boolean") {
        return fromForm;
      }

      return provider?.value.isDisabled ?? false;
    });
    const isReadOnly = computed(() => {
      if (props.isReadOnly !== undefined) {
        return props.isReadOnly;
      }

      const fromForm = resolvedFormProps.value.isReadOnly;
      if (typeof fromForm === "boolean") {
        return fromForm;
      }

      return provider?.value.isReadOnly ?? false;
    });
    const isRequired = computed(() => {
      if (props.isRequired !== undefined) {
        return props.isRequired;
      }

      const fromForm = resolvedFormProps.value.isRequired;
      if (typeof fromForm === "boolean") {
        return fromForm;
      }

      return provider?.value.isRequired ?? false;
    });
    const validationState = computed<"valid" | "invalid" | undefined>(() => {
      if (props.validationState !== undefined) {
        return props.validationState;
      }

      const fromForm = resolvedFormProps.value.validationState;
      if (fromForm === "valid" || fromForm === "invalid") {
        return fromForm;
      }

      const fromProvider = provider?.value.validationState;
      return fromProvider === "valid" || fromProvider === "invalid"
        ? fromProvider
        : undefined;
    });
    const validationBehavior = computed<SpectrumRadioValidationBehavior | undefined>(
      () => {
        if (props.validationBehavior !== undefined) {
          return props.validationBehavior;
        }

        const fromForm = resolvedFormProps.value.validationBehavior;
        return fromForm === "native" ? "native" : "aria";
      }
    );
    const isInvalid = computed(() => {
      if (props.isInvalid !== undefined) {
        return props.isInvalid;
      }

      if (validationState.value === "invalid") {
        return true;
      }

      return isRequired.value && selectedValue.value == null;
    });
    const isEmphasized = computed(
      () => props.isEmphasized ?? provider?.value.isEmphasized ?? false
    );
    const orientation = computed<SpectrumRadioGroupOrientation>(
      () => props.orientation ?? "vertical"
    );

    const setSelectedValue = (value: string | null): void => {
      if (isDisabled.value || isReadOnly.value) {
        return;
      }

      if (!isControlled.value) {
        uncontrolledValue.value = value;
      }

      if (value !== null) {
        props.onChange?.(value);
      }
    };

    const state: UseRadioGroupState = {
      selectedValue,
      setSelectedValue,
      lastFocusedValue,
      setLastFocusedValue: (value) => {
        lastFocusedValue.value = value;
      },
      isDisabled,
      isReadOnly,
      isRequired,
      isInvalid,
      validationState,
    };

    provideRadioGroupContext({
      state,
      isEmphasized,
    });

    const group = useRadioGroup(
      {
        ...(attrsRecord as Record<string, unknown>),
        label: computed(() => props.label),
        description: computed(() => props.description),
        errorMessage: computed(() => props.errorMessage),
        name: computed(() => props.name),
        form: computed(() => props.form),
        isDisabled,
        isReadOnly,
        isRequired,
        isInvalid: computed(() => props.isInvalid),
        validationState,
        validationBehavior,
        orientation,
        direction: computed(() => props.direction),
        "aria-label": computed(
          () => props.ariaLabel ?? (attrsRecord["aria-label"] as string | undefined)
        ),
        "aria-labelledby": computed(
          () =>
            props.ariaLabelledby ??
            (attrsRecord["aria-labelledby"] as string | undefined)
        ),
        "aria-describedby": computed(
          () =>
            props.ariaDescribedby ??
            (attrsRecord["aria-describedby"] as string | undefined)
        ),
        "aria-errormessage": computed(() => props.ariaErrormessage),
      },
      state
    );

    expose({
      UNSAFE_getDOMNode: () => groupRef.value,
    });

    return () =>
      h(
        Field,
        {
          label: props.label,
          description: props.description,
          errorMessage: props.errorMessage,
          isRequired: isRequired.value,
          isInvalid: group.isInvalid.value,
          validationState: validationState.value,
          labelProps: group.labelProps.value,
          descriptionProps: group.descriptionProps.value,
          errorMessageProps: group.errorMessageProps.value,
          elementType: "span",
          wrapperClassName: classNames("spectrum-FieldGroup"),
        },
        {
          default: () =>
            h(
              "div",
              mergeProps(group.radioGroupProps.value, {
                ref: (value: unknown) => {
                  groupRef.value = value as HTMLElement | null;
                },
                class: classNames(
                  "spectrum-FieldGroup-group",
                  {
                    "spectrum-FieldGroup-group--horizontal":
                      orientation.value === "horizontal",
                  },
                  props.UNSAFE_className as ClassValue | undefined
                ),
                style: props.UNSAFE_style,
              }),
              slots.default?.()
            ),
        }
      );
  },
});
