import { computed, defineComponent, h, type PropType } from "vue";
import { classNames, type ClassValue } from "@vue-spectrum/utils";

export interface HelpTextProps {
  description?: string;
  errorMessage?: string;
  validationState?: "valid" | "invalid" | undefined;
  isInvalid?: boolean | undefined;
  isDisabled?: boolean | undefined;
  showErrorIcon?: boolean | undefined;
  descriptionProps?: Record<string, unknown> | undefined;
  errorMessageProps?: Record<string, unknown> | undefined;
}

export const HelpText = defineComponent({
  name: "HelpText",
  inheritAttrs: false,
  props: {
    description: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    errorMessage: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    validationState: {
      type: String as PropType<"valid" | "invalid" | undefined>,
      default: undefined,
    },
    isInvalid: {
      type: null as unknown as PropType<boolean | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: null as unknown as PropType<boolean | undefined>,
      default: undefined,
    },
    showErrorIcon: {
      type: Boolean,
      default: false,
    },
    descriptionProps: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      default: undefined,
    },
    errorMessageProps: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs }) {
    const isErrorMessage = computed(
      () =>
        Boolean(props.errorMessage) &&
        (props.isInvalid || props.validationState === "invalid")
    );

    return () => {
      const rootClass = classNames(
        "spectrum-HelpText",
        `spectrum-HelpText--${isErrorMessage.value ? "negative" : "neutral"}`,
        {
          "is-disabled": props.isDisabled,
        },
        attrs.class as ClassValue | undefined
      );

      const baseProps = attrs as Record<string, unknown>;

      if (isErrorMessage.value) {
        const errorProps = {
          ...(props.errorMessageProps ?? {}),
          class: classNames(
            "spectrum-HelpText-text",
            (props.errorMessageProps?.class as ClassValue | undefined) ?? undefined
          ),
        };

        return h("div", { ...baseProps, class: rootClass }, [
          props.showErrorIcon
            ? h(
                "span",
                {
                  class: "spectrum-HelpText-validationIcon",
                  "aria-hidden": "true",
                },
                "!"
              )
            : null,
          h("div", errorProps, props.errorMessage),
        ]);
      }

      const descriptionProps = {
        ...(props.descriptionProps ?? {}),
        class: classNames(
          "spectrum-HelpText-text",
          (props.descriptionProps?.class as ClassValue | undefined) ?? undefined
        ),
      };

      return h(
        "div",
        {
          ...baseProps,
          class: rootClass,
        },
        [h("div", descriptionProps, props.description)]
      );
    };
  },
});
