import { useHover } from "@vue-aria/interactions";
import { mergeProps, useId } from "@vue-aria/utils";
import { useStyleProps } from "@vue-spectrum/utils";
import { computed, defineComponent, h, type PropType } from "vue";
import type { SpectrumTextFieldBaseProps } from "./types";

/**
 * Shared visual wrapper used by TextField and TextArea.
 */
export const TextFieldBase = defineComponent({
  name: "SpectrumTextFieldBase",
  inheritAttrs: false,
  props: {
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
    isDisabled: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    isQuiet: {
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
    validationErrors: {
      type: Array as PropType<string[] | undefined>,
      required: false,
    },
    multiLine: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    icon: {
      type: null as unknown as PropType<unknown>,
      required: false,
    },
    inputClassName: {
      type: String,
      required: false,
    },
    validationIconClassName: {
      type: String,
      required: false,
    },
    wrapperChildren: {
      type: null as unknown as PropType<unknown>,
      required: false,
    },
    inputProps: {
      type: Object as PropType<Record<string, unknown>>,
      required: true,
    },
    labelProps: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      required: false,
    },
    descriptionProps: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      required: false,
    },
    errorMessageProps: {
      type: Object as PropType<Record<string, unknown> | undefined>,
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
  setup(props) {
    const { hoverProps, isHovered } = useHover({ isDisabled: props.isDisabled });
    const { styleProps } = useStyleProps(props as unknown as Record<string, unknown>);
    const validIconId = useId();
    const computedValidationState = computed(() =>
      props.validationState ?? (props.isInvalid ? "invalid" : undefined)
    );
    const isInvalid = computed(() =>
      computedValidationState.value === "invalid" && !props.isDisabled
    );
    const inputProps = computed(() => {
      const describedBy = props.inputProps["aria-describedby"] as string | undefined;
      if (
        computedValidationState.value === "valid"
        && !isInvalid.value
        && !props.isDisabled
      ) {
        return {
          ...props.inputProps,
          "aria-describedby": [describedBy, validIconId].filter(Boolean).join(" ") || undefined,
        };
      }

      return props.inputProps;
    });

    return () => {
      const ElementType = props.multiLine ? "textarea" : "input";
      const resolvedErrorMessage = props.errorMessage ?? props.validationErrors?.[0];
      const descriptionText = isInvalid.value ? resolvedErrorMessage : props.description;
      const descriptionProps = isInvalid.value ? props.errorMessageProps : props.descriptionProps;
      const validationIcon =
        computedValidationState.value && !props.isDisabled
          ? isInvalid.value
            ? h("span", {
                class: ["spectrum-Textfield-validationIcon", props.validationIconClassName],
                role: "img",
                "aria-hidden": "true",
              })
            : h("span", {
                id: validIconId,
                class: ["spectrum-Textfield-validationIcon", props.validationIconClassName],
                role: "img",
                "aria-label": "Valid",
              })
          : null;

      return h(
        "div",
        {
          ...styleProps.value,
          class: [
            "spectrum-Textfield-wrapper",
            {
              "spectrum-Textfield-wrapper--quiet": Boolean(props.isQuiet),
            },
            styleProps.value.class,
          ],
        },
        [
          props.label
            ? h(
                "label",
                {
                  ...(props.labelProps ?? {}),
                  class: "spectrum-FieldLabel",
                },
                props.label
              )
            : null,
          h("div", {
            class: [
              "spectrum-Textfield",
              {
                "spectrum-Textfield--invalid": isInvalid.value,
                "spectrum-Textfield--valid":
                  computedValidationState.value === "valid" && !props.isDisabled,
                "spectrum-Textfield--quiet": Boolean(props.isQuiet),
                "spectrum-Textfield--multiline": Boolean(props.multiLine),
              },
            ],
          }, [
            h(ElementType, {
              ...mergeProps(inputProps.value, hoverProps),
              rows: props.multiLine ? 1 : undefined,
              class: [
                "spectrum-Textfield-input",
                {
                  "spectrum-Textfield-inputIcon": Boolean(props.icon),
                  "is-hovered": isHovered,
                },
                props.inputClassName,
              ],
            }),
            props.icon ? (props.icon as any) : null,
            validationIcon,
            props.wrapperChildren ? (props.wrapperChildren as any) : null,
          ]),
          descriptionText
            ? h(
                "div",
                {
                  ...(descriptionProps ?? {}),
                  class: ["spectrum-HelpText", { "is-invalid": isInvalid.value }],
                },
                descriptionText
              )
            : null,
        ]
      );
    };
  },
});
