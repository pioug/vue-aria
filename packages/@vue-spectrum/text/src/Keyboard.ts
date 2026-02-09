import { defineComponent, h } from "vue";
import { filterDOMProps } from "@vue-aria/utils";

export interface KeyboardProps {}

export const Keyboard = defineComponent({
  name: "Keyboard",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => {
      const domProps = filterDOMProps(attrs as Record<string, unknown>);
      return h("kbd", domProps, slots.default?.());
    };
  },
});
