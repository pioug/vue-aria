import { cloneVNode, computed, defineComponent, type PropType } from "vue";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { useSpectrumProviderContext } from "@vue-spectrum/provider";
import { classNames, useSlotProps } from "@vue-spectrum/utils";
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
    const attrsRecord = attrs as Record<string, unknown>;
    const slottedProps = computed(() =>
      useSlotProps(
        mergeProps(attrsRecord, props as unknown as Record<string, unknown>),
        "icon"
      )
    );

    return () => {
      const iconNode = getFirstSlotVNode(slots);
      if (!iconNode) {
        return null;
      }

      const scale = provider?.value.scale === "large" ? "L" : "M";
      const slotProps = slottedProps.value as Record<string, unknown>;
      const iconSize = (slotProps.size as IconSize | undefined) ?? scale;
      const iconColor = slotProps.color as IconColorValue | undefined;
      const ariaLabel = (slotProps.ariaLabel ??
        slotProps["aria-label"]) as string | undefined;
      const ariaHidden = ariaLabel
        ? normalizeAriaHidden(
            (slotProps.ariaHidden ??
              slotProps["aria-hidden"]) as IconProps["ariaHidden"]
          )
        : true;

      const domProps = filterDOMProps(slotProps);
      const childClass = (iconNode.props as Record<string, unknown> | null)?.class as
        | ClassValue
        | undefined;
      const domClass = domProps.class as ClassValue | undefined;
      const unsafeClassName = slotProps.UNSAFE_className as ClassValue | undefined;
      const unsafeStyle =
        slotProps.UNSAFE_style as Record<string, string | number> | undefined;

      return cloneVNode(iconNode, {
        ...domProps,
        class: classNames(
          childClass,
          "spectrum-Icon",
          `spectrum-Icon--size${iconSize}`,
          domClass,
          unsafeClassName
        ),
        style: mergeStyle(
          domProps.style,
          unsafeStyle,
          iconColor ? { color: iconColorValue(iconColor) } : undefined
        ),
        focusable: "false",
        role: "img",
        "aria-label": ariaLabel,
        "aria-hidden": ariaHidden,
      });
    };
  },
});
