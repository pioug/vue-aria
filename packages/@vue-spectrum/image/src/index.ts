import { defineComponent, h } from "vue";

export interface SpectrumImageProps {
  src?: string;
  alt?: string;
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
  },
  setup(props, { attrs }) {
    return () =>
      h("img", {
        ...attrs,
        src: props.src,
        alt: props.alt,
        class: ["spectrum-Image", attrs.class],
      });
  },
});
