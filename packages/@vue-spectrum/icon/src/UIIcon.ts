import { cloneVNode, computed, defineComponent, type PropType } from "vue";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { useSpectrumProviderContext } from "@vue-spectrum/provider";
import { classNames, useSlotProps } from "@vue-spectrum/utils";
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

      const slotProps = slottedProps.value as Record<string, unknown>;
      const ariaLabel = (slotProps.ariaLabel ??
        slotProps["aria-label"]) as string | undefined;
      const ariaHidden = ariaLabel
        ? normalizeAriaHidden(
            (slotProps.ariaHidden ??
              slotProps["aria-hidden"]) as UIIconProps["ariaHidden"]
          )
        : true;
      const domProps = filterDOMProps(slotProps);
      const displayName = getDisplayName(iconNode);
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
          displayName ? `spectrum-UIIcon-${displayName}` : null,
          domClass,
          unsafeClassName
        ),
        style: mergeStyle(domProps.style, unsafeStyle),
        scale: provider?.value.scale === "large" ? "L" : "M",
        focusable: "false",
        role: "img",
        "aria-label": ariaLabel,
        "aria-hidden": ariaHidden,
      });
    };
  },
});
