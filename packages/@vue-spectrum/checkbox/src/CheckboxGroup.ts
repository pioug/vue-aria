import { useCheckboxGroup } from "@vue-aria/checkbox";
import { useCheckboxGroupState } from "@vue-aria/checkbox-state";
import { useProviderProps } from "@vue-spectrum/provider";
import { useStyleProps } from "@vue-spectrum/utils";
import { defineComponent, h, provide, ref, type PropType } from "vue";
import { CheckboxGroupContextSymbol } from "./context";
import type { SpectrumCheckboxGroupProps } from "./types";

/**
 * A CheckboxGroup allows selecting one or more items from a list.
 */
export const CheckboxGroup = defineComponent({
  name: "SpectrumCheckboxGroup",
  inheritAttrs: false,
  props: {
    value: {
      type: Array as () => string[] | undefined,
      required: false,
    },
    defaultValue: {
      type: Array as () => string[] | undefined,
      required: false,
    },
    onChange: {
      type: Function as PropType<((value: string[]) => void) | undefined>,
      required: false,
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
    isInvalid: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    validationState: {
      type: String as () => "valid" | "invalid" | undefined,
      required: false,
    },
    validationBehavior: {
      type: String as () => "aria" | "native" | undefined,
      required: false,
    },
    isEmphasized: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    orientation: {
      type: String as () => "vertical" | "horizontal" | undefined,
      required: false,
      default: "vertical",
    },
    label: {
      type: String,
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
    description: {
      type: String,
      required: false,
    },
    errorMessage: {
      type: String,
      required: false,
    },
    onFocus: {
      type: Function,
      required: false,
    },
    onBlur: {
      type: Function,
      required: false,
    },
    onFocusChange: {
      type: Function,
      required: false,
    },
    UNSAFE_className: {
      type: String,
      required: false,
    },
    UNSAFE_style: {
      type: Object,
      required: false,
    },
  },
  setup(props, { attrs, slots, expose }) {
    const domRef = ref<HTMLElement | null>(null);
    const provided = useProviderProps({
      ...props,
      ...attrs,
    } as Record<string, unknown>) as SpectrumCheckboxGroupProps & Record<string, unknown>;
    const state = useCheckboxGroupState(provided);
    const { groupProps, labelProps, descriptionProps, errorMessageProps, isInvalid, validationErrors } =
      useCheckboxGroup(provided, state);
    const { styleProps } = useStyleProps(provided);

    provide(CheckboxGroupContextSymbol, {
      state,
      isEmphasized: provided.isEmphasized,
    });

    expose({
      focus: () => domRef.value?.focus(),
      UNSAFE_getDOMNode: () => domRef.value,
    });

    return () =>
      h(
        "div",
        {
          ...styleProps.value,
          ref: domRef,
          class: ["spectrum-FieldGroup", styleProps.value.class],
        },
        [
          provided.label
            ? h(
                "span",
                {
                  ...labelProps,
                  class: "spectrum-FieldLabel",
                },
                provided.label
              )
            : null,
          h(
            "div",
            {
              ...groupProps,
              class: [
                "spectrum-FieldGroup-group",
                {
                  "spectrum-FieldGroup-group--horizontal": provided.orientation === "horizontal",
                },
              ],
            },
            slots.default?.()
          ),
          provided.description
            ? h(
                "div",
                {
                  ...descriptionProps,
                  class: "spectrum-HelpText",
                },
                provided.description
              )
            : null,
          isInvalid && (provided.errorMessage || validationErrors.length > 0)
            ? h(
                "div",
                {
                  ...errorMessageProps,
                  class: "spectrum-HelpText is-invalid",
                },
                provided.errorMessage ?? validationErrors.join(", ")
              )
            : null,
        ]
      );
  },
});
