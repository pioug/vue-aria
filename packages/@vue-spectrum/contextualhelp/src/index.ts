import { defineComponent, h } from "vue";

export const ContextualHelp = defineComponent({
  name: "SpectrumContextualHelp",
  setup(_, { slots, attrs }) {
    return () =>
      h(
        "span",
        {
          ...attrs,
          class: ["spectrum-ContextualHelp", attrs.class],
        },
        slots.default ? slots.default() : null
      );
  },
});
