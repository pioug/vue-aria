export * from "@vue-stately/steplist";

import { h } from "vue";

export const StepList = (_props: Record<string, unknown>, { attrs, slots }) =>
  h("ol", { ...attrs, class: ["spectrum-StepList", attrs.class] }, slots.default ? slots.default() : null);

export const Item = (_props: Record<string, unknown>, { attrs, slots }) =>
  h("li", { ...attrs, class: ["spectrum-StepList-item", attrs.class] }, slots.default ? slots.default() : null);
