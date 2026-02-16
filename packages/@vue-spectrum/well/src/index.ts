import { h } from "vue";

export interface SpectrumWellProps {
  children?: unknown;
}

export const Well = (_props: SpectrumWellProps, { slots, attrs }) =>
  h(
    "div",
    {
      ...attrs,
      class: ["spectrum-Well", attrs.class],
    },
    slots.default ? slots.default() : null
  );
