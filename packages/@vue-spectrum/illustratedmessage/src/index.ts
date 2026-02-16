import { useProviderProps } from "@vue-spectrum/provider";
import { useSlotProps, useStyleProps } from "@vue-spectrum/utils";
import { defineComponent, h } from "vue";

export interface SpectrumIllustratedMessageProps {
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}

const createIllustrated = (name: string, tag: string, className: string) =>
  defineComponent({
    name,
    props: {
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
    setup(_, { attrs, slots }) {
      const merged = useProviderProps(attrs) as SpectrumIllustratedMessageProps & Record<string, unknown>;
      const mergedSlot = useSlotProps(merged, "illustratedMessage");
      const { styleProps } = useStyleProps(mergedSlot);

      return () =>
        h(
          tag,
          {
            ...styleProps.value,
            class: [
              className,
              styleProps.value.class,
            ],
          },
          slots.default ? slots.default() : null
        );
    },
  });

export const IllustratedMessage = createIllustrated(
  "SpectrumIllustratedMessage",
  "div",
  "spectrum-IllustratedMessage"
);

export const IllustratedMessageHeading = createIllustrated(
  "SpectrumIllustratedMessageHeading",
  "h3",
  "spectrum-IllustratedMessage-heading"
);

export const IllustratedMessageDescription = createIllustrated(
  "SpectrumIllustratedMessageDescription",
  "p",
  "spectrum-IllustratedMessage-description"
);
