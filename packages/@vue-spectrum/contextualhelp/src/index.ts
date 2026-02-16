import type { SpectrumContextualHelpProps } from "@vue-types/contextualhelp";
import { useProviderProps } from "@vue-spectrum/provider";
import { filterDOMProps } from "@vue-aria/utils";
import { useSlotProps, useStyleProps } from "@vue-spectrum/utils";
import { defineComponent, h, type PropType } from "vue";

export const ContextualHelp = defineComponent({
  name: "SpectrumContextualHelp",
  inheritAttrs: false,
  props: {
    variant: {
      type: String as PropType<SpectrumContextualHelpProps["variant"]>,
      required: false,
      default: undefined,
    },
    UNSAFE_className: {
      type: String,
      required: false,
      default: undefined,
    },
    UNSAFE_style: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      required: false,
      default: undefined,
    },
  },
  setup(props, { slots, attrs }) {
    const merged = useProviderProps({
      ...props,
      ...attrs,
    } as Record<string, unknown>) as SpectrumContextualHelpProps & Record<string, unknown>;
    const mergedSlot = useSlotProps(merged, "contextualHelp");
    const { styleProps } = useStyleProps(mergedSlot);
    const domProps = filterDOMProps(mergedSlot);

    return () =>
      h(
        "span",
        {
          ...domProps,
          ...styleProps.value,
          class: [
            "spectrum-ContextualHelp",
            {
              "spectrum-ContextualHelp--help": mergedSlot.variant === "help" || mergedSlot.variant == null,
              "spectrum-ContextualHelp--info": mergedSlot.variant === "info",
            },
            styleProps.value.class,
          ],
        },
        slots.default ? slots.default() : null
      );
  },
});
