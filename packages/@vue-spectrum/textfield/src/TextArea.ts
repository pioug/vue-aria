import { defineComponent, h, nextTick, onMounted, ref, watch, type PropType } from "vue";
import { mergeProps } from "@vue-aria/utils";
import { TextFieldBase } from "./TextFieldBase";
import {
  textFieldBasePropOptions,
  type SpectrumTextAreaProps,
} from "./types";
import { useSpectrumTextField } from "./useSpectrumTextField";

const PLACEHOLDER_DEPRECATION_WARNING =
  "Placeholders are deprecated due to accessibility issues. Please use help text instead. See the docs for details: https://react-spectrum.adobe.com/react-spectrum/TextArea.html#help-text";

function styleIncludesHeight(style: unknown): boolean {
  if (!style) {
    return false;
  }

  if (typeof style === "string") {
    return /(^|;)\s*height\s*:/.test(style);
  }

  if (Array.isArray(style)) {
    return style.some((entry) => styleIncludesHeight(entry));
  }

  if (typeof style === "object") {
    return Object.prototype.hasOwnProperty.call(style, "height");
  }

  return false;
}

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
    const inputRef = ref<HTMLTextAreaElement | null>(null);
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

    const hasExplicitHeight = () =>
      props.UNSAFE_style?.height !== undefined || styleIncludesHeight(attrsRecord.style);

    const syncTextareaHeight = () => {
      const element = inputRef.value;
      if (!element || hasExplicitHeight()) {
        return;
      }

      element.style.height = "auto";
      element.style.height = `${element.scrollHeight}px`;
    };

    onMounted(() => {
      void nextTick(() => {
        syncTextareaHeight();
      });
    });

    watch(
      [() => props.value, () => props.defaultValue, () => props.rows],
      () => {
        void nextTick(() => {
          syncTextareaHeight();
        });
      },
      { immediate: true }
    );

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
        inputRef,
        labelProps: textField.labelProps.value,
        descriptionProps: textField.descriptionProps.value,
        errorMessageProps: textField.errorMessageProps.value,
        inputProps: mergeProps(textField.inputProps.value, {
          onInput: () => {
            syncTextareaHeight();
          },
        }),
      } as Record<string, unknown>);
  },
});
