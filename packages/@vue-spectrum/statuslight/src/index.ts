import { defineComponent, h } from "vue";

export interface SpectrumStatusLightProps {
  children?: unknown;
  variant?: "positive" | "negative" | "notice" | "info" | "neutral";
}

export const StatusLight = defineComponent({
  name: "SpectrumStatusLight",
  inheritAttrs: false,
  props: {
    variant: {
      type: String as () => SpectrumStatusLightProps["variant"] | undefined,
      required: false,
      default: undefined,
    },
    children: {
      type: null as unknown as () => unknown,
      required: false,
    },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "span",
        {
          ...attrs,
          class: ["spectrum-StatusLight", `spectrum-StatusLight--${props.variant ?? "neutral"}`],
        },
        slots.default ? slots.default() : props.children
      );
  },
});
