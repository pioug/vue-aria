import { defineComponent, h } from "vue";

export const List = defineComponent({
  name: "SpectrumList",
  setup(_, { slots, attrs }) {
    return () =>
      h("ul", { ...attrs, class: ["spectrum-List", attrs.class] }, slots.default ? slots.default() : null);
  },
});

export const Item = defineComponent({
  name: "SpectrumListItem",
  setup(_, { slots, attrs }) {
    return () =>
      h("li", { ...attrs, class: ["spectrum-List-item", attrs.class] }, slots.default ? slots.default() : null);
  },
});
