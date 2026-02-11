import clsx from "clsx";
import { computed, defineComponent, h, type PropType } from "vue";
import {
  TextArea as SpectrumTextArea,
  TextField as SpectrumTextField,
  type SpectrumTextAreaProps,
  type SpectrumTextFieldProps,
} from "@vue-spectrum/textfield";
import { useProviderProps } from "@vue-spectrum/provider";

export type TextFieldSize = "S" | "M" | "L" | "XL";

export interface S2TextFieldProps extends SpectrumTextFieldProps {
  size?: TextFieldSize | undefined;
}

export interface S2TextAreaProps extends SpectrumTextAreaProps {
  size?: TextFieldSize | undefined;
}

export const TextField = defineComponent({
  name: "S2TextField",
  inheritAttrs: false,
  props: {
    size: {
      type: String as PropType<TextFieldSize | undefined>,
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
  setup(props, { attrs }) {
    const forwardedProps = computed(() => {
      const attrsRecord = attrs as Record<string, unknown>;
      const attrsClassName =
        typeof attrsRecord.UNSAFE_className === "string"
          ? (attrsRecord.UNSAFE_className as string)
          : undefined;
      const attrsStyle =
        (attrsRecord.UNSAFE_style as Record<string, string | number> | undefined) ??
        undefined;

      return useProviderProps({
        ...attrsRecord,
        UNSAFE_className: clsx(
          "s2-TextField",
          props.size ? `s2-TextField--${props.size}` : null,
          attrsClassName,
          props.UNSAFE_className
        ),
        UNSAFE_style: {
          ...(attrsStyle ?? {}),
          ...(props.UNSAFE_style ?? {}),
        },
      });
    });

    return () =>
      h(SpectrumTextField, forwardedProps.value as Record<string, unknown>);
  },
});

export const TextArea = defineComponent({
  name: "S2TextArea",
  inheritAttrs: false,
  props: {
    size: {
      type: String as PropType<TextFieldSize | undefined>,
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
  setup(props, { attrs }) {
    const forwardedProps = computed(() => {
      const attrsRecord = attrs as Record<string, unknown>;
      const attrsClassName =
        typeof attrsRecord.UNSAFE_className === "string"
          ? (attrsRecord.UNSAFE_className as string)
          : undefined;
      const attrsStyle =
        (attrsRecord.UNSAFE_style as Record<string, string | number> | undefined) ??
        undefined;

      return useProviderProps({
        ...attrsRecord,
        UNSAFE_className: clsx(
          "s2-TextArea",
          props.size ? `s2-TextArea--${props.size}` : null,
          attrsClassName,
          props.UNSAFE_className
        ),
        UNSAFE_style: {
          ...(attrsStyle ?? {}),
          ...(props.UNSAFE_style ?? {}),
        },
      });
    });

    return () => h(SpectrumTextArea, forwardedProps.value as Record<string, unknown>);
  },
});
