import { defineComponent, h } from "vue";

export interface SpectrumWellProps {
  children?: unknown;
}

export const Well = defineComponent({
  name: "SpectrumWell",
  setup(_, { slots, attrs }) {
    return () =>
      h(
        "div",
        {
          ...attrs,
          class: ["spectrum-Well", attrs.class],
        },
        slots.default ? slots.default() : null
      );
  },
});
