import { defineComponent, h } from "vue";

export interface SpectrumInlineAlertProps {
  variant?: "info" | "positive" | "neutral" | "negative";
}

export const InlineAlert = defineComponent({
  name: "SpectrumInlineAlert",
  props: {
    variant: {
      type: String as () => SpectrumInlineAlertProps["variant"],
      required: false,
      default: "info",
    },
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        "div",
        {
          ...attrs,
          class: ["spectrum-InlineAlert", `spectrum-InlineAlert--${props.variant}`],
        },
        slots.default ? slots.default() : null
      );
  },
});
