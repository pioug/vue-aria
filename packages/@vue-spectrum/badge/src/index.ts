import { defineComponent, h } from "vue";

export interface SpectrumBadgeProps {
  count?: number;
  tone?: string;
}

export const Badge = defineComponent({
  name: "SpectrumBadge",
  props: {
    count: {
      type: Number as () => number | undefined,
      required: false,
    },
    tone: {
      type: String,
      required: false,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        "span",
        {
          ...attrs,
          class: ["spectrum-Badge", `spectrum-Badge--${props.tone ?? "neutral"}`],
        },
        slots.default ? slots.default() : props.count
      );
  },
});
