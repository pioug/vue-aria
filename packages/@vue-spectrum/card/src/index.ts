import { useProviderProps, useStyleProps } from "@vue-spectrum/utils";
import type { SpectrumCardProps, SpectrumCardViewProps } from "@vue-types/card";
import { defineComponent, h, type PropType } from "vue";

const createLayout = (name: string, tag = "div", className: string) =>
  defineComponent({
    name,
    inheritAttrs: false,
    props: {
      UNSAFE_className: {
        type: String,
        required: false,
        default: undefined,
      },
      UNSAFE_style: {
        type: Object as PropType<Record<string, unknown> | undefined>,
        required: false,
        default: undefined,
      },
    },
    setup(props, { slots, attrs }) {
      const merged = useProviderProps({
        ...props,
        ...attrs,
      } as Record<string, unknown>) as Record<string, unknown>;
      const { styleProps } = useStyleProps(merged);

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

export interface SpectrumCardComponentProps extends Omit<SpectrumCardProps, "children"> {
  articleProps?: Record<string, unknown>;
}

export const Card = defineComponent({
  name: "SpectrumCard",
  inheritAttrs: false,
  props: {
    orientation: {
      type: String as PropType<SpectrumCardComponentProps["orientation"]>,
      required: false,
      default: "vertical",
    },
    isQuiet: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
      default: undefined,
    },
    layout: {
      type: String as PropType<SpectrumCardComponentProps["layout"]>,
      required: false,
      default: undefined,
    },
    articleProps: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      required: false,
      default: undefined,
    },
    UNSAFE_className: {
      type: String,
      required: false,
      default: undefined,
    },
    UNSAFE_style: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      required: false,
      default: undefined,
    },
  },
  setup(props, { slots, attrs }) {
    const merged = useProviderProps({
      ...props,
      ...attrs,
    } as Record<string, unknown>) as SpectrumCardComponentProps & Record<string, unknown>;
    const { styleProps } = useStyleProps(merged);
    const orientation = merged.orientation ?? "vertical";
    const layout = merged.layout;

    return () =>
      h(
        "article",
        {
          ...merged.articleProps,
          ...styleProps.value,
          class: [
            "spectrum-Card",
            {
              "spectrum-Card--default": !merged.isQuiet && orientation !== "horizontal",
              "spectrum-Card--isQuiet": merged.isQuiet && orientation !== "horizontal",
              "spectrum-Card--horizontal": orientation === "horizontal",
              "spectrum-Card--waterfall": layout === "waterfall",
              "spectrum-Card--gallery": layout === "gallery",
              "spectrum-Card--grid": layout === "grid",
              "spectrum-Card--noLayout":
                layout !== "waterfall" && layout !== "gallery" && layout !== "grid",
            },
            styleProps.value.class,
          ],
        },
        slots.default ? slots.default() : null
      );
  },
});

export interface SpectrumCardViewComponentProps
  extends Omit<SpectrumCardViewProps<unknown>, "children"> {
  role?: string;
}

export const CardView = defineComponent({
  name: "SpectrumCardView",
  inheritAttrs: false,
  props: {
    cardOrientation: {
      type: String as PropType<SpectrumCardViewComponentProps["cardOrientation"]>,
      required: false,
      default: undefined,
    },
    isQuiet: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
      default: undefined,
    },
    loadingState: {
      type: String as PropType<SpectrumCardViewComponentProps["loadingState"]>,
      required: false,
      default: undefined,
    },
    layout: {
      type: Object,
      required: false,
      default: undefined,
    },
    renderEmptyState: {
      type: Function as PropType<() => unknown>,
      required: false,
      default: undefined,
    },
    UNSAFE_className: {
      type: String,
      required: false,
      default: undefined,
    },
    UNSAFE_style: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      required: false,
      default: undefined,
    },
  },
  setup(props, { slots, attrs }) {
    const merged = useProviderProps({
      ...props,
      ...attrs,
    } as Record<string, unknown>) as SpectrumCardViewComponentProps & Record<string, unknown>;
    const { styleProps } = useStyleProps(merged);

    return () =>
      h(
        "div",
        {
          ...styleProps.value,
          class: [
            "spectrum-CardView",
            styleProps.value.class,
          ],
        },
        [
          ...(merged.renderEmptyState ? [merged.renderEmptyState()] : []),
          slots.default ? slots.default() : null,
        ]
      );
  },
});

export const GalleryLayout = createLayout(
  "SpectrumGalleryLayout",
  "div",
  "spectrum-GalleryLayout"
);

export const GridLayout = createLayout(
  "SpectrumGridLayout",
  "div",
  "spectrum-GridLayout"
);

export const WaterfallLayout = createLayout(
  "SpectrumWaterfallLayout",
  "div",
  "spectrum-WaterfallLayout"
);
