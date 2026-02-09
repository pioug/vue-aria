import { defineComponent, h } from "vue";
import { filterDOMProps } from "@vue-aria/utils";

export interface TextProps {
  role?: string;
}

export const Text = defineComponent({
  name: "Text",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => {
      const domProps = filterDOMProps(attrs as Record<string, unknown>);

      return h(
        "span",
        {
          role: "none",
          ...domProps,
        },
        slots.default?.()
      );
    };
  },
});
