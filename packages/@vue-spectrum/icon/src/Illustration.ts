import { cloneVNode, computed, defineComponent, type PropType } from "vue";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { classNames, useSlotProps, type ClassValue } from "@vue-spectrum/utils";
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
    const attrsRecord = attrs as Record<string, unknown>;
    const slottedProps = computed(() =>
      useSlotProps(
        mergeProps(attrsRecord, props as unknown as Record<string, unknown>),
        "illustration"
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
      const ariaLabelledBy = (slotProps.ariaLabelledby ??
        slotProps["aria-labelledby"]) as string | undefined;
      const hasLabel = Boolean(ariaLabel || ariaLabelledBy);
      const ariaHidden = normalizeAriaHidden(
        (slotProps.ariaHidden ??
          slotProps["aria-hidden"]) as IllustrationProps["ariaHidden"]
      );
      const domProps = filterDOMProps(slotProps);
      const unsafeClassName = slotProps.UNSAFE_className as ClassValue | undefined;
      const unsafeStyle =
        slotProps.UNSAFE_style as Record<string, string | number> | undefined;
      const domClass = domProps.class as ClassValue | undefined;

      return cloneVNode(iconNode, {
        ...domProps,
        class: classNames(domClass, unsafeClassName),
        style: mergeStyle(domProps.style, unsafeStyle),
        focusable: "false",
        role: hasLabel ? "img" : undefined,
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
        "aria-hidden": ariaHidden,
      });
    };
  },
});
