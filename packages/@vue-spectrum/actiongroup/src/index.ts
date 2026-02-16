import { defineComponent, h } from "vue";

export { useActionGroup, useActionGroupItem } from "@vue-aria/actiongroup";
export type { ActionGroupAria, AriaActionGroupProps } from "@vue-aria/actiongroup";
export type { ActionGroupItemAria, AriaActionGroupItemProps } from "@vue-aria/actiongroup";

export const ActionGroup = defineComponent({
  name: "SpectrumActionGroup",
  setup(_, { slots, attrs }) {
    return () =>
      h("div", { ...attrs, class: ["spectrum-ActionGroup", attrs.class] }, slots.default ? slots.default() : null);
  },
});

export const Item = defineComponent({
  name: "SpectrumActionGroupItem",
  setup(_, { slots, attrs }) {
    return () =>
      h("button", { ...attrs, class: ["spectrum-ActionGroup-item", attrs.class] }, slots.default ? slots.default() : null);
  },
});
