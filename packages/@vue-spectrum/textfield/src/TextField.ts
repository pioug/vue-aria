import { defineComponent, h, type PropType } from "vue";
import { TextFieldBase } from "./TextFieldBase";
import {
  textFieldBasePropOptions,
  type SpectrumTextFieldProps,
} from "./types";
import { useSpectrumTextField } from "./useSpectrumTextField";

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
    const {
      isDisabled,
      validationState,
      textField,
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
        inputProps: textField.inputProps.value,
      } as Record<string, unknown>);
  },
});
