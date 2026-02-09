import { defineComponent, h, type PropType } from "vue";
import { filterDOMProps } from "@vue-aria/utils";

export type ViewElementType =
  | "div"
  | "section"
  | "article"
  | "main"
  | "aside"
  | "nav"
  | "header"
  | "footer"
  | "span";

export interface ViewProps {
  elementType?: ViewElementType;
}

export const View = defineComponent({
  name: "View",
  inheritAttrs: false,
  props: {
    elementType: {
      type: String as PropType<ViewElementType>,
      default: "div",
    },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const domProps = filterDOMProps(attrs as Record<string, unknown>);
      return h(props.elementType, domProps, slots.default?.());
    };
  },
});
