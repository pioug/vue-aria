import { defineComponent, h } from "vue";

export interface SpectrumAvatarProps {
  src?: string;
  alt?: string;
}

export const Avatar = defineComponent({
  name: "SpectrumAvatar",
  props: {
    src: {
      type: String,
      required: false,
    },
    alt: {
      type: String,
      required: false,
    },
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        "span",
        {
          ...attrs,
          class: ["spectrum-Avatar", attrs.class],
        },
        [
          props.src
            ? h("img", {
                src: props.src,
                alt: props.alt,
              })
            : slots.default
              ? slots.default()
              : null,
        ]
      );
  },
});
