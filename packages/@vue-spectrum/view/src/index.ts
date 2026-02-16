import { h } from "vue";

const createSlotWrapper = (tag: string, defaultClass: string) =>
  (props: Record<string, unknown>, { slots, attrs }) =>
    h(
      tag,
      {
        ...attrs,
        class: [defaultClass, attrs.class],
      },
      slots.default ? slots.default() : null
    );

export const View = createSlotWrapper("div", "spectrum-View");
export const Content = createSlotWrapper("div", "spectrum-View-content");
export const Footer = createSlotWrapper("footer", "spectrum-View-footer");
export const Header = createSlotWrapper("header", "spectrum-View-header");
