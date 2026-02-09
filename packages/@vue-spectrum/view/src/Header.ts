import { defineComponent, h } from "vue";
import { filterDOMProps } from "@vue-aria/utils";

export interface HeaderProps {}

export const Header = defineComponent({
  name: "Header",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => {
      const domProps = filterDOMProps(attrs as Record<string, unknown>);
      return h("header", domProps, slots.default?.());
    };
  },
});
