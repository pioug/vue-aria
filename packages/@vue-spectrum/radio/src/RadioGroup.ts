import { useRadioGroup } from "@vue-aria/radio";
import { useRadioGroupState } from "@vue-aria/radio-state";
import { useProviderProps } from "@vue-spectrum/provider";
import { useStyleProps } from "@vue-spectrum/utils";
import { computed, defineComponent, h, provide, ref, type PropType } from "vue";
import { RadioGroupContextSymbol } from "./context";
import type { SpectrumRadioGroupProps } from "./types";

function omitUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined)) as T;
}

/**
 * Radio groups allow selecting one option from a set of choices.
 */
export const RadioGroup = defineComponent({
  name: "SpectrumRadioGroup",
  inheritAttrs: false,
  props: {
    value: {
      type: String as () => string | null | undefined,
      required: false,
    },
    defaultValue: {
      type: String as () => string | null | undefined,
      required: false,
    },
    onChange: {
      type: Function as PropType<((value: string | null) => void) | undefined>,
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
    orientation: {
      type: String as () => "horizontal" | "vertical" | undefined,
      required: false,
      default: "vertical",
    },
    isEmphasized: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
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
    const provided = useProviderProps(omitUndefined({
      ...props,
      ...attrs,
    } as Record<string, unknown>)) as SpectrumRadioGroupProps & Record<string, unknown>;
    const state = useRadioGroupState(provided);
    const { radioGroupProps, labelProps, descriptionProps, errorMessageProps } =
      useRadioGroup(provided, state);
    const isInvalid = computed(() => state.displayValidation.isInvalid);
    const validationErrors = computed(() => state.displayValidation.validationErrors);
    const { styleProps } = useStyleProps(provided);

    provide(RadioGroupContextSymbol, {
      isEmphasized: provided.isEmphasized,
      state,
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
              ...radioGroupProps,
              "aria-invalid": isInvalid.value || undefined,
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
          isInvalid.value && (provided.errorMessage || validationErrors.value.length > 0)
            ? h(
                "div",
                {
                  ...errorMessageProps,
                  class: "spectrum-HelpText is-invalid",
                },
                provided.errorMessage ?? validationErrors.value.join(", ")
              )
            : null,
        ]
      );
  },
});
