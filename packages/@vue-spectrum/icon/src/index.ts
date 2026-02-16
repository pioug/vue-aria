import { defineComponent, h } from "vue";

export interface IconProps {
  alt?: string;
}

export interface UIIconProps {
  alt?: string;
}

export interface IllustrationProps {
  alt?: string;
}

const createIconLike = (className: string, tag = "span") =>
  defineComponent({
    name: className,
    props: {
      alt: {
        type: String,
        required: false,
      },
    },
    setup(props, { attrs, slots }) {
      return () =>
        h(tag, {
          ...attrs,
          class: [className, attrs.class],
          "aria-label": attrs["aria-label"] ?? props.alt,
        }, slots.default ? slots.default() : null);
    },
  });

export const Icon = createIconLike("spectrum-Icon", "span");
export const UIIcon = createIconLike("spectrum-UIIcon", "span");
export const Illustration = createIconLike("spectrum-Illustration", "span");
