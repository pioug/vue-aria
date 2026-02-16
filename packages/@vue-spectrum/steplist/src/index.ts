export * from "@vue-stately/steplist";

import { defineComponent, h } from "vue";

export const StepList = defineComponent({
  name: "SpectrumStepList",
  setup(_, { slots, attrs }) {
    return () =>
      h("ol", { ...attrs, class: ["spectrum-StepList", attrs.class] }, slots.default ? slots.default() : null);
  },
});

export const Item = defineComponent({
  name: "SpectrumStepListItem",
  setup(_, { slots, attrs }) {
    return () =>
      h("li", { ...attrs, class: ["spectrum-StepList-item", attrs.class] }, slots.default ? slots.default() : null);
  },
});
