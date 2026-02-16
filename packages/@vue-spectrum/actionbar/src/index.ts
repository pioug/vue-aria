import { defineComponent, h } from "vue";

export interface SpectrumActionBarProps {}

export interface ActionBarItemProps {}

export const ActionBar = defineComponent({
  name: "SpectrumActionBar",
  setup(_, { slots, attrs }) {
    return () =>
      h("div", { ...attrs, class: ["spectrum-ActionBar", attrs.class] }, slots.default ? slots.default() : null);
  },
});

export const Item = defineComponent({
  name: "SpectrumActionBarItem",
  setup(_, { slots, attrs }) {
    return () => h("span", { ...attrs, class: ["spectrum-ActionBar-item", attrs.class] }, slots.default ? slots.default() : null);
  },
});
