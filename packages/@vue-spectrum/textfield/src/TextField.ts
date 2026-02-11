import { defineComponent, h, ref, watch, type PropType } from "vue";
import { TextFieldBase } from "./TextFieldBase";
import {
  textFieldBasePropOptions,
  type SpectrumTextFieldProps,
} from "./types";
import { useSpectrumTextField } from "./useSpectrumTextField";

const PLACEHOLDER_DEPRECATION_WARNING =
  "Placeholders are deprecated due to accessibility issues. Please use help text instead. See the docs for details: https://react-spectrum.adobe.com/react-spectrum/TextField.html#help-text";

export const TextField = defineComponent({
  name: "TextField",
  inheritAttrs: false,
  props: {
    ...textFieldBasePropOptions,
    type: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    pattern: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs }) {
    const attrsRecord = attrs as Record<string, unknown>;
    const hasWarnedPlaceholder = ref(false);
    const isProduction =
      typeof process !== "undefined" && process.env.NODE_ENV === "production";
    watch(
      () => props.placeholder,
      (placeholder) => {
        if (isProduction || hasWarnedPlaceholder.value || !placeholder) {
          return;
        }

        console.warn(PLACEHOLDER_DEPRECATION_WARNING);
        hasWarnedPlaceholder.value = true;
      },
      { immediate: true }
    );

    const {
      isDisabled,
      validationState,
      textField,
      inputProps,
    } = useSpectrumTextField(props as SpectrumTextFieldProps, attrsRecord, {
      multiLine: false,
      type: props.type,
      pattern: props.pattern,
    });

    return () =>
      h(TextFieldBase as any, {
        ...(attrsRecord as Record<string, unknown>),
        ...props,
        multiLine: false,
        isDisabled: isDisabled.value,
        isInvalid: textField.isInvalid.value,
        validationState:
          (validationState.value as "valid" | "invalid" | undefined) ??
          undefined,
        labelProps: textField.labelProps.value,
        descriptionProps: textField.descriptionProps.value,
        errorMessageProps: textField.errorMessageProps.value,
        inputProps: inputProps.value,
      } as Record<string, unknown>);
  },
});
