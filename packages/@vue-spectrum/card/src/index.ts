import { defineComponent, h } from "vue";

const createLayout = (name: string, tag = "div", className: string) =>
  defineComponent({
    name,
    setup(_, { slots, attrs }) {
      return () =>
        h(
          tag,
          {
            ...attrs,
            class: [className, attrs.class],
          },
          slots.default ? slots.default() : null
        );
    },
  });

export const Card = createLayout("SpectrumCard", "article", "spectrum-Card");
export const CardView = createLayout("SpectrumCardView", "section", "spectrum-CardView");
export const GalleryLayout = createLayout(
  "SpectrumGalleryLayout",
  "div",
  "spectrum-GalleryLayout"
);
export const GridLayout = createLayout("SpectrumGridLayout", "div", "spectrum-GridLayout");
export const WaterfallLayout = createLayout(
  "SpectrumWaterfallLayout",
  "div",
  "spectrum-WaterfallLayout"
);
