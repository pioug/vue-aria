import { useProviderProps } from "@vue-spectrum/provider";
import { useSlotProps, useStyleProps } from "@vue-spectrum/utils";
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
      const merged = useProviderProps({
        ...props,
        ...attrs,
      } as Record<string, unknown>) as Record<string, unknown>;
      const mergedSlot = useSlotProps(merged, "icon");
      const { styleProps } = useStyleProps(mergedSlot);

      return () =>
        h(
          tag,
          {
            ...styleProps.value,
            "aria-label": mergedSlot["aria-label"] ?? mergedSlot.alt,
            class: [
              className,
              styleProps.value.class,
            ],
          },
          slots.default ? slots.default() : null
        );
    },
  });

export const Icon = createIconLike("spectrum-Icon", "span");
export const UIIcon = createIconLike("spectrum-UIIcon", "span");
export const Illustration = createIconLike("spectrum-Illustration", "span");
