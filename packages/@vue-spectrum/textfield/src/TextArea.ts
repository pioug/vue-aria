import { defineComponent, h, ref, watch, type PropType } from "vue";
import { TextFieldBase } from "./TextFieldBase";
import {
  textFieldBasePropOptions,
  type SpectrumTextAreaProps,
} from "./types";
import { useSpectrumTextField } from "./useSpectrumTextField";

const PLACEHOLDER_DEPRECATION_WARNING =
  "Placeholders are deprecated due to accessibility issues. Please use help text instead. See the docs for details: https://react-spectrum.adobe.com/react-spectrum/TextArea.html#help-text";

export const TextArea = defineComponent({
  name: "TextArea",
  inheritAttrs: false,
  props: {
    ...textFieldBasePropOptions,
    rows: {
      type: Number as PropType<number | undefined>,
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
      inputRows,
    } = useSpectrumTextField(props as SpectrumTextAreaProps, attrsRecord, {
      multiLine: true,
      rows: props.rows,
    });

    return () =>
      h(TextFieldBase as any, {
        ...(attrsRecord as Record<string, unknown>),
        ...props,
        multiLine: true,
        rows: inputRows.value,
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
