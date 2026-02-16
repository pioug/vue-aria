import { h } from "vue";

export const List = (_props: Record<string, unknown>, { attrs, slots }) =>
  h("ul", { ...attrs, class: ["spectrum-List", attrs.class] }, slots.default ? slots.default() : null);

export const Item = (_props: Record<string, unknown>, { attrs, slots }) =>
  h("li", { ...attrs, class: ["spectrum-List-item", attrs.class] }, slots.default ? slots.default() : null);
