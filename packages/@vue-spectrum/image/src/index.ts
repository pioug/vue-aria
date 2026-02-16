import { useProviderProps } from "@vue-spectrum/provider";
import { useSlotProps, useStyleProps } from "@vue-spectrum/utils";
import { defineComponent, h } from "vue";

export interface SpectrumImageProps {
  src?: string;
  alt?: string;
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}

export const Image = defineComponent({
  name: "SpectrumImage",
  props: {
    src: {
      type: String,
      required: false,
    },
    alt: {
      type: String,
      required: false,
      default: "",
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
    const merged = useProviderProps({
      ...props,
      ...attrs,
    } as Record<string, unknown>) as SpectrumImageProps & Record<string, unknown>;
    const mergedSlot = useSlotProps(merged, "image");
    const { styleProps } = useStyleProps(mergedSlot);

    return () =>
      h("img", {
        ...styleProps.value,
        src: props.src,
        alt: props.alt,
        class: [
          "spectrum-Image",
          styleProps.value.class,
        ],
      });
  },
});
