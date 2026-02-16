import { defineComponent, h } from "vue";

const createSlotWrapper = (
  tag: string,
  defaultClass: string,
  componentName: string
) =>
  defineComponent({
    name: componentName,
    setup(_, { slots, attrs }) {
      return () =>
        h(
          tag,
          {
            ...attrs,
            class: [defaultClass, attrs.class],
          },
          slots.default ? slots.default() : null
        );
    },
  });

export const View = createSlotWrapper("div", "spectrum-View", "SpectrumView");
export const Content = createSlotWrapper("div", "spectrum-View-content", "SpectrumViewContent");
export const Footer = createSlotWrapper("footer", "spectrum-View-footer", "SpectrumViewFooter");
export const Header = createSlotWrapper("header", "spectrum-View-header", "SpectrumViewHeader");
