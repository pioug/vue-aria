import { useSeparator } from "@vue-aria/separator";
import { useProviderProps } from "@vue-spectrum/provider";
import { useSlotProps, useStyleProps } from "@vue-spectrum/utils";
import { defineComponent, h } from "vue";

const sizeMap = {
  S: "small",
  M: "medium",
  L: "large",
};

export interface SpectrumDividerProps {
  size?: "S" | "M" | "L";
  orientation?: "horizontal" | "vertical";
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}

export const Divider = defineComponent({
  name: "SpectrumDivider",
  inheritAttrs: false,
  props: {
    size: {
      type: String as () => SpectrumDividerProps["size"],
      required: false,
      default: "L",
    },
    orientation: {
      type: String as () => SpectrumDividerProps["orientation"],
      required: false,
      default: "horizontal",
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
  setup(props, { attrs }) {
    const mergedProvider = useProviderProps({
      ...props,
      ...attrs,
    } as Record<string, unknown>) as SpectrumDividerProps & Record<string, unknown>;
    const merged = useSlotProps(mergedProvider, "divider");
    const { styleProps } = useStyleProps(merged);
    const { separatorProps } = useSeparator({
      ...merged,
      elementType: merged.orientation === "vertical" ? "div" : "hr",
    });
    const weight = sizeMap[merged.size ?? "L"] ?? sizeMap.L;

    return () =>
      h(
        merged.orientation === "vertical" ? "div" : "hr",
        {
          ...styleProps.value,
          ...separatorProps,
          class: [
            "spectrum-Rule",
            `spectrum-Rule--${weight}`,
            {
              "spectrum-Rule--vertical": merged.orientation === "vertical",
              "spectrum-Rule--horizontal": merged.orientation === "horizontal",
            },
            styleProps.value.class,
          ],
        },
        []
      );
  },
});
