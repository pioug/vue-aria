import { cloneVNode, defineComponent, type PropType } from "vue";
import { filterDOMProps } from "@vue-aria/utils";
import { useSpectrumProviderContext } from "@vue-spectrum/provider";
import { classNames } from "@vue-spectrum/utils";
import type { ClassValue } from "@vue-spectrum/utils";
import { getFirstSlotVNode, mergeStyle, normalizeAriaHidden } from "./shared";
import type { IconColorValue, IconProps, IconSize } from "./types";

function iconColorValue(value: IconColorValue): string {
  return `var(--spectrum-semantic-${value}-color-icon)`;
}

export const Icon = defineComponent({
  name: "Icon",
  inheritAttrs: false,
  props: {
    size: {
      type: String as PropType<IconSize | undefined>,
      default: undefined,
    },
    color: {
      type: String as PropType<IconColorValue | undefined>,
      default: undefined,
    },
    ariaLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaHidden: {
      type: [Boolean, String] as PropType<IconProps["ariaHidden"]>,
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

      const scale = provider?.value.scale === "large" ? "L" : "M";
      const iconSize = props.size ?? scale;
      const ariaLabel = props.ariaLabel;
      const ariaHidden = ariaLabel
        ? normalizeAriaHidden(props.ariaHidden)
        : true;

      const domProps = filterDOMProps(attrs as Record<string, unknown>);
      const childClass = (iconNode.props as Record<string, unknown> | null)?.class as
        | ClassValue
        | undefined;
      const domClass = domProps.class as ClassValue | undefined;

      return cloneVNode(iconNode, {
        ...domProps,
        class: classNames(
          childClass,
          "spectrum-Icon",
          `spectrum-Icon--size${iconSize}`,
          domClass
        ),
        style: mergeStyle(
          domProps.style,
          props.color ? { color: iconColorValue(props.color) } : undefined
        ),
        focusable: "false",
        role: "img",
        "aria-label": ariaLabel,
        "aria-hidden": ariaHidden,
      });
    };
  },
});
