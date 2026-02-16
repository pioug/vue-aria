import { defineComponent, h } from "vue";

export interface SpectrumDividerProps {}

export const Divider = defineComponent({
  name: "SpectrumDivider",
  setup(_, { attrs }) {
    return () =>
      h("hr", {
        ...attrs,
        class: ["spectrum-Divider", attrs.class],
      });
  },
});
