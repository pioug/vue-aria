import { useProviderProps } from "@vue-spectrum/provider";
import { filterDOMProps } from "@vue-aria/utils";
import { useSlotProps, useStyleProps } from "@vue-spectrum/utils";
import { defineComponent, h } from "vue";

export interface SpectrumStatusLightProps {
  children?: unknown;
  variant?: "positive" | "negative" | "notice" | "info" | "neutral";
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}

export const StatusLight = defineComponent({
  name: "SpectrumStatusLight",
  inheritAttrs: false,
  props: {
    variant: {
      type: String as () => SpectrumStatusLightProps["variant"] | undefined,
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
    children: {
      type: null as unknown as () => unknown,
      required: false,
    },
  },
  setup(props, { slots, attrs }) {
    const merged = useProviderProps({
      ...props,
      ...attrs,
    } as Record<string, unknown>) as SpectrumStatusLightProps & Record<string, unknown>;
    const mergedSlot = useSlotProps(merged, "statusLight");
    const { styleProps } = useStyleProps(mergedSlot);
    const domProps = filterDOMProps(mergedSlot);

    const variant = mergedSlot.variant ?? "neutral";

    return () =>
      h(
        "span",
        {
          ...domProps,
          ...styleProps.value,
          class: [
            "spectrum-StatusLight",
            `spectrum-StatusLight--${variant}`,
            styleProps.value.class,
          ],
        },
        slots.default ? slots.default() : props.children
      );
  },
});
