import { defineComponent, h } from "vue";
import { filterDOMProps } from "@vue-aria/utils";

export interface ContentProps {}

export const Content = defineComponent({
  name: "Content",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => {
      const domProps = filterDOMProps(attrs as Record<string, unknown>);
      return h("section", domProps, slots.default?.());
    };
  },
});
