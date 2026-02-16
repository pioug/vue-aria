import { useProviderProps } from "@vue-spectrum/provider";
import { useSlotProps, useStyleProps } from "@vue-spectrum/utils";
import { defineComponent, h } from "vue";

export interface SpectrumInlineAlertProps {
  variant?: "info" | "positive" | "neutral" | "negative";
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}

export const InlineAlert = defineComponent({
  name: "SpectrumInlineAlert",
  props: {
    variant: {
      type: String as () => SpectrumInlineAlertProps["variant"],
      required: false,
      default: "info",
    },
    UNSAFE_className: {
      type: String,
      required: false,
      default: undefined,
    },
    UNSAFE_style: {
      type: Object as () => Record<string, unknown> | undefined,
      required: false,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    const merged = useProviderProps({
      ...props,
      ...attrs,
    } as Record<string, unknown>) as SpectrumInlineAlertProps & Record<string, unknown>;
    const mergedSlot = useSlotProps(merged, "inlineAlert");
    const { styleProps } = useStyleProps(mergedSlot);

    return () =>
      h(
        "div",
        {
          ...styleProps.value,
          class: [
            "spectrum-InlineAlert",
            `spectrum-InlineAlert--${props.variant}`,
            styleProps.value.class,
          ],
        },
        slots.default ? slots.default() : null
      );
  },
});
