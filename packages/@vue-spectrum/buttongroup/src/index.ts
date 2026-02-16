import { useProviderProps } from "@vue-spectrum/provider";
import { useSlotProps, useStyleProps } from "@vue-spectrum/utils";
import { defineComponent, h } from "vue";

export interface SpectrumButtonGroupProps {
  orientation?: "horizontal" | "vertical";
  align?: "start" | "center" | "end";
  isDisabled?: boolean;
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}

export const ButtonGroup = defineComponent({
  name: "SpectrumButtonGroup",
  inheritAttrs: false,
  props: {
    orientation: {
      type: String as () => SpectrumButtonGroupProps["orientation"] | undefined,
      required: false,
      default: "horizontal",
    },
    align: {
      type: String as () => SpectrumButtonGroupProps["align"] | undefined,
      required: false,
      default: "start",
    },
    isDisabled: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    UNSAFE_className: {
      type: String,
      required: false,
      default: undefined,
    },
    UNSAFE_style: {
      type: Object as () => Record<string, unknown> | undefined,
      required: false,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    const mergedProvider = useProviderProps({
      ...props,
      ...attrs,
    } as Record<string, unknown>) as SpectrumButtonGroupProps & Record<string, unknown>;
    const merged = useSlotProps(mergedProvider, "buttonGroup");
    const { styleProps } = useStyleProps(merged);

    return () =>
      h(
        "div",
        {
          ...styleProps.value,
          class: [
            "spectrum-ButtonGroup",
            {
              "spectrum-ButtonGroup--vertical": merged.orientation === "vertical",
              "spectrum-ButtonGroup--alignEnd": merged.align === "end",
              "spectrum-ButtonGroup--alignCenter": merged.align === "center",
            },
            styleProps.value.class,
          ],
        },
        slots.default ? slots.default() : null
      );
  },
});
