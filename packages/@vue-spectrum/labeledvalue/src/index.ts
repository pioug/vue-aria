import { defineComponent, h } from "vue";

export interface SpectrumLabeledValueProps {}

export const LabeledValue = defineComponent({
  name: "SpectrumLabeledValue",
  setup(_, { attrs, slots }) {
    return () =>
      h("span", { ...attrs, class: ["spectrum-LabeledValue", attrs.class] }, slots.default ? slots.default() : null);
  },
});
