import { defineComponent, h } from "vue";
import { filterDOMProps } from "@vue-aria/utils";

export interface FooterProps {}

export const Footer = defineComponent({
  name: "Footer",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => {
      const domProps = filterDOMProps(attrs as Record<string, unknown>);
      return h("footer", domProps, slots.default?.());
    };
  },
});
