import {
  computed,
  defineComponent,
  h,
  nextTick,
  onMounted,
  ref,
  type PropType,
} from "vue";
import { useFocusRing } from "@vue-aria/focus";
import { useHover } from "@vue-aria/interactions";
import { mergeProps } from "@vue-aria/utils";
import { Field } from "@vue-spectrum/label";
import { classNames, type ClassValue } from "@vue-spectrum/utils";

export interface SpectrumTextFieldBaseRenderProps {
  isQuiet?: boolean | undefined;
  isDisabled?: boolean | undefined;
  isInvalid?: boolean | undefined;
  validationState?: "valid" | "invalid" | undefined;
  label?: string | undefined;
  labelPosition?: "top" | "side" | undefined;
  labelAlign?: "start" | "end" | null | undefined;
  necessityIndicator?: "icon" | "label" | null | undefined;
  includeNecessityIndicatorInAccessibilityName?: boolean | undefined;
  description?: string | undefined;
  errorMessage?: string | undefined;
  contextualHelp?: unknown;
  labelProps?: Record<string, unknown> | undefined;
  descriptionProps?: Record<string, unknown> | undefined;
  errorMessageProps?: Record<string, unknown> | undefined;
  inputProps: Record<string, unknown>;
  inputClassName?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
  multiLine?: boolean | undefined;
  rows?: number | undefined;
}

export const TextFieldBase = defineComponent({
  name: "TextFieldBase",
  inheritAttrs: false,
  props: {
    isQuiet: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isDisabled: {
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
    label: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    labelPosition: {
      type: String as PropType<"top" | "side" | undefined>,
      default: undefined,
    },
    labelAlign: {
      type: String as PropType<"start" | "end" | null | undefined>,
      default: undefined,
    },
    necessityIndicator: {
      type: String as PropType<"icon" | "label" | null | undefined>,
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
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    contextualHelp: {
      type: null as unknown as PropType<unknown>,
      default: undefined,
    },
    labelProps: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      default: undefined,
    },
    descriptionProps: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      default: undefined,
    },
    errorMessageProps: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      default: undefined,
    },
    inputProps: {
      type: Object as PropType<Record<string, unknown>>,
      required: true,
    },
    inputClassName: {
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
    multiLine: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    rows: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
  },
  setup(props, { expose }) {
    const inputRef = ref<HTMLInputElement | HTMLTextAreaElement | null>(null);

    const { hoverProps, isHovered } = useHover({
      isDisabled: computed(() => Boolean(props.isDisabled)),
    });
    const focusRing = useFocusRing();

    onMounted(() => {
      if (!props.inputProps.autoFocus) {
        return;
      }

      void nextTick(() => {
        inputRef.value?.focus();
      });
    });

    expose({
      UNSAFE_getDOMNode: () => inputRef.value,
      focus: () => {
        inputRef.value?.focus();
      },
      select: () => {
        inputRef.value?.select();
      },
      getInputElement: () => inputRef.value,
    });

    return () => {
      const inputInteractionProps = props.inputProps;
      const isInvalid =
        Boolean(props.isInvalid) || props.validationState === "invalid";
      const elementType = props.multiLine ? "textarea" : "input";

      const textField = h(
        "div",
        {
          class: classNames("spectrum-Textfield", {
            "spectrum-Textfield--invalid": isInvalid && !props.isDisabled,
            "spectrum-Textfield--valid":
              props.validationState === "valid" && !props.isDisabled,
            "spectrum-Textfield--quiet": Boolean(props.isQuiet),
            "spectrum-Textfield--multiline": Boolean(props.multiLine),
            "focus-ring": focusRing.isFocusVisible.value,
          }),
        },
        [
          h(
            elementType,
            mergeProps(inputInteractionProps, hoverProps, focusRing.focusProps, {
              ref: (value: unknown) => {
                inputRef.value = value as HTMLInputElement | HTMLTextAreaElement | null;
              },
              rows: props.multiLine ? (props.rows ?? 1) : undefined,
              class: classNames(
                "spectrum-Textfield-input",
                {
                  "is-hovered": isHovered.value,
                },
                props.inputClassName as ClassValue | undefined
              ),
            })
          ),
        ]
      );

      return h(
        Field,
        {
          label: props.label,
          labelPosition: props.labelPosition,
          labelAlign: props.labelAlign,
          necessityIndicator: props.necessityIndicator,
          includeNecessityIndicatorInAccessibilityName:
            props.includeNecessityIndicatorInAccessibilityName,
          description: props.description,
          errorMessage: props.errorMessage,
          isInvalid: props.isInvalid,
          validationState: props.validationState,
          isDisabled: props.isDisabled,
          contextualHelp: props.contextualHelp,
          labelProps: props.labelProps,
          descriptionProps: props.descriptionProps,
          errorMessageProps: props.errorMessageProps,
          wrapperClassName: classNames(
            "spectrum-Textfield-wrapper",
            {
              "spectrum-Textfield-wrapper--quiet": Boolean(props.isQuiet),
            },
            props.UNSAFE_className as ClassValue | undefined
          ),
          UNSAFE_style: props.UNSAFE_style,
          showErrorIcon: false,
        },
        {
          default: () => [textField],
        }
      );
    };
  },
});
