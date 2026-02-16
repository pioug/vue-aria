import { defineComponent, h } from "vue";

export interface SpectrumIllustratedMessageProps {}

export const IllustratedMessage = defineComponent({
  name: "SpectrumIllustratedMessage",
  setup(_, { slots, attrs }) {
    return () =>
      h(
        "div",
        { ...attrs, class: ["spectrum-IllustratedMessage", attrs.class] },
        slots.default ? slots.default() : null
      );
  },
});

export const IllustratedMessageHeading = defineComponent({
  name: "SpectrumIllustratedMessageHeading",
  setup(_, { slots, attrs }) {
    return () =>
      h("h3", { ...attrs, class: ["spectrum-IllustratedMessage-heading", attrs.class] }, slots.default ? slots.default() : null);
  },
});

export const IllustratedMessageDescription = defineComponent({
  name: "SpectrumIllustratedMessageDescription",
  setup(_, { slots, attrs }) {
    return () =>
      h("p", { ...attrs, class: ["spectrum-IllustratedMessage-description", attrs.class] }, slots.default ? slots.default() : null);
  },
});
