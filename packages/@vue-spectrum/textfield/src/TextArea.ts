import { mergeProps } from "@vue-aria/utils";
import { useTextField } from "@vue-aria/textfield";
import { defineComponent, h, nextTick, onMounted, ref, watch, type PropType } from "vue";
import { TextFieldBase } from "./TextFieldBase";
import type { SpectrumTextAreaProps } from "./types";

/**
 * TextArea allows users to input multiline custom text entries.
 */
export const TextArea = defineComponent({
  name: "SpectrumTextArea",
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
    height: {
      type: [String, Number] as PropType<string | number | undefined>,
      required: false,
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
    const inputRef = ref<HTMLTextAreaElement | null>(null);
    const merged = {
      ...props,
      ...attrs,
      inputElementType: "textarea",
    } as SpectrumTextAreaProps & Record<string, unknown>;
    const aria = useTextField(merged, {
      get current() {
        return inputRef.value;
      },
      set current(value: HTMLTextAreaElement | null) {
        inputRef.value = value;
      },
    });

    const onHeightChange = () => {
      if (!inputRef.value) {
        return;
      }

      if (!(props.isQuiet || !props.height)) {
        return;
      }

      const input = inputRef.value;
      const prevAlignment = input.style.alignSelf;
      const prevOverflow = input.style.overflow;
      input.style.overflow = "hidden";
      input.style.alignSelf = "start";
      input.style.height = "auto";
      input.style.height = `${input.scrollHeight + (input.offsetHeight - input.clientHeight)}px`;
      input.style.overflow = prevOverflow;
      input.style.alignSelf = prevAlignment;
    };

    watch(
      () => aria.inputProps.value,
      async () => {
        await nextTick();
        onHeightChange();
      },
      { immediate: true }
    );

    onMounted(() => {
      if (props.placeholder && process.env.NODE_ENV !== "production") {
        console.warn(
          "Placeholders are deprecated due to accessibility issues. Please use help text instead. " +
            "See the docs for details: https://react-spectrum.adobe.com/react-spectrum/TextArea.html#help-text"
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
        multiLine: true,
        inputProps: mergeProps(aria.inputProps, {
          ref: inputRef,
          tabIndex: props.excludeFromTabOrder ? -1 : aria.inputProps.tabIndex,
          onInput: (event: Event) => {
            (aria.inputProps.onInput as ((event: Event) => void) | undefined)?.(event);
            onHeightChange();
          },
        }),
      });
  },
});
