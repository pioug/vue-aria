import { cloneVNode, defineComponent, type PropType } from "vue";
import { filterDOMProps } from "@vue-aria/utils";
import { getFirstSlotVNode, mergeStyle, normalizeAriaHidden } from "./shared";
import type { IllustrationProps } from "./types";

export const Illustration = defineComponent({
  name: "Illustration",
  inheritAttrs: false,
  props: {
    ariaLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaLabelledby: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaHidden: {
      type: [Boolean, String] as PropType<IllustrationProps["ariaHidden"]>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const iconNode = getFirstSlotVNode(slots);
      if (!iconNode) {
        return null;
      }

      const ariaLabel = props.ariaLabel;
      const ariaLabelledBy = props.ariaLabelledby;
      const hasLabel = Boolean(ariaLabel || ariaLabelledBy);
      const ariaHidden = normalizeAriaHidden(props.ariaHidden);
      const domProps = filterDOMProps(attrs as Record<string, unknown>);

      return cloneVNode(iconNode, {
        ...domProps,
        style: mergeStyle(domProps.style),
        focusable: "false",
        role: hasLabel ? "img" : undefined,
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
        "aria-hidden": ariaHidden,
      });
    };
  },
});
