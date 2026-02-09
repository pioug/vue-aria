import { cloneVNode, defineComponent, type PropType } from "vue";
import { filterDOMProps } from "@vue-aria/utils";
import { useSpectrumProviderContext } from "@vue-spectrum/provider";
import { classNames } from "@vue-spectrum/utils";
import type { ClassValue } from "@vue-spectrum/utils";
import { getDisplayName, getFirstSlotVNode, mergeStyle, normalizeAriaHidden } from "./shared";
import type { UIIconProps } from "./types";

export const UIIcon = defineComponent({
  name: "UIIcon",
  inheritAttrs: false,
  props: {
    ariaLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaHidden: {
      type: [Boolean, String] as PropType<UIIconProps["ariaHidden"]>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    const provider = useSpectrumProviderContext();

    return () => {
      const iconNode = getFirstSlotVNode(slots);
      if (!iconNode) {
        return null;
      }

      const ariaLabel = props.ariaLabel;
      const ariaHidden = ariaLabel
        ? normalizeAriaHidden(props.ariaHidden)
        : true;
      const domProps = filterDOMProps(attrs as Record<string, unknown>);
      const displayName = getDisplayName(iconNode);
      const childClass = (iconNode.props as Record<string, unknown> | null)?.class as
        | ClassValue
        | undefined;
      const domClass = domProps.class as ClassValue | undefined;

      return cloneVNode(iconNode, {
        ...domProps,
        class: classNames(
          childClass,
          "spectrum-Icon",
          displayName ? `spectrum-UIIcon-${displayName}` : null,
          domClass
        ),
        style: mergeStyle(domProps.style),
        scale: provider?.value.scale === "large" ? "L" : "M",
        focusable: "false",
        role: "img",
        "aria-label": ariaLabel,
        "aria-hidden": ariaHidden,
      });
    };
  },
});
