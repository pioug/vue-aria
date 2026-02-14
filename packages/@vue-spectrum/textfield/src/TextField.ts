import { useTextField } from "@vue-aria/textfield";
import { defineComponent, h, onMounted, ref, type PropType } from "vue";
import { TextFieldBase } from "./TextFieldBase";
import type { SpectrumTextFieldProps } from "./types";

/**
 * TextField allows users to input custom text entries.
 */
export const TextField = defineComponent({
  name: "SpectrumTextField",
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      required: false,
    },
    defaultValue: {
      type: String,
      required: false,
    },
    onChange: {
      type: Function as PropType<((value: string) => void) | undefined>,
      required: false,
    },
    label: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    errorMessage: {
      type: String,
      required: false,
    },
    isQuiet: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    isReadOnly: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    isRequired: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    validationState: {
      type: String as () => "valid" | "invalid" | undefined,
      required: false,
    },
    isInvalid: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    validationBehavior: {
      type: String as () => "aria" | "native" | undefined,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    form: {
      type: String,
      required: false,
    },
    placeholder: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      required: false,
      default: "text",
    },
    autoFocus: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    excludeFromTabOrder: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    icon: {
      type: null as unknown as PropType<unknown>,
      required: false,
    },
    UNSAFE_className: {
      type: String,
      required: false,
    },
    UNSAFE_style: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      required: false,
    },
  },
  setup(props, { attrs, expose }) {
    const inputRef = ref<HTMLInputElement | null>(null);
    const merged = {
      ...props,
      ...attrs,
    } as SpectrumTextFieldProps & Record<string, unknown>;
    const aria = useTextField(merged, {
      get current() {
        return inputRef.value;
      },
      set current(value: HTMLInputElement | null) {
        inputRef.value = value;
      },
    });

    onMounted(() => {
      if (props.placeholder && process.env.NODE_ENV !== "production") {
        console.warn(
          "Placeholders are deprecated due to accessibility issues. Please use help text instead. " +
            "See the docs for details: https://react-spectrum.adobe.com/react-spectrum/TextField.html#help-text"
        );
      }
    });

    expose({
      focus: () => inputRef.value?.focus(),
      select: () => inputRef.value?.select(),
      getInputElement: () => inputRef.value,
      UNSAFE_getDOMNode: () => inputRef.value,
    });

    return () =>
      h(TextFieldBase as any, {
        ...merged,
        ...aria,
        inputProps: {
          ...aria.inputProps,
          ref: inputRef,
          tabIndex: props.excludeFromTabOrder ? -1 : aria.inputProps.tabIndex,
        },
      });
  },
});
