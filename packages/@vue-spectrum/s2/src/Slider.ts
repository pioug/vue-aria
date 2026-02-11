import clsx from "clsx";
import { computed, defineComponent, h, type PropType } from "vue";
import {
  Slider as SpectrumSlider,
  type SpectrumSliderProps,
} from "@vue-spectrum/slider";
import { useProviderProps } from "@vue-spectrum/provider";

export type SliderSize = "S" | "M" | "L" | "XL";

export interface S2SliderProps extends SpectrumSliderProps {
  size?: SliderSize | undefined;
}

export const Slider = defineComponent({
  name: "S2Slider",
  inheritAttrs: false,
  props: {
    size: {
      type: String as PropType<SliderSize | undefined>,
      default: undefined,
    },
    UNSAFE_className: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    UNSAFE_style: {
      type: Object as PropType<Record<string, string | number> | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs }) {
    const forwardedProps = computed(() => {
      const attrsRecord = attrs as Record<string, unknown>;
      const attrsClassName =
        typeof attrsRecord.UNSAFE_className === "string"
          ? (attrsRecord.UNSAFE_className as string)
          : undefined;
      const attrsStyle =
        (attrsRecord.UNSAFE_style as Record<string, string | number> | undefined) ??
        undefined;

      return useProviderProps({
        ...attrsRecord,
        UNSAFE_className: clsx(
          "s2-Slider",
          props.size ? `s2-Slider--${props.size}` : null,
          attrsClassName,
          props.UNSAFE_className
        ),
        UNSAFE_style: {
          ...(attrsStyle ?? {}),
          ...(props.UNSAFE_style ?? {}),
        },
      });
    });

    return () => h(SpectrumSlider, forwardedProps.value as Record<string, unknown>);
  },
});
