import { defineComponent, h } from "vue";

export const ButtonGroup = defineComponent({
  name: "SpectrumButtonGroup",
  setup(_, { slots, attrs }) {
    return () =>
      h(
        "div",
        { ...attrs, class: ["spectrum-ButtonGroup", attrs.class] },
        slots.default ? slots.default() : null
      );
  },
});
