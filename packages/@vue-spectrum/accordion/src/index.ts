import { defineComponent, h } from "vue";

export interface SpectrumAccordionProps {
  children?: unknown;
}

export interface SpectrumAccordionItemProps {
  children?: unknown;
}

export const Accordion = defineComponent({
  name: "SpectrumAccordion",
  setup(_, { slots, attrs }) {
    return () =>
      h(
        "div",
        {
          ...attrs,
          class: ["spectrum-Accordion", attrs.class],
        },
        slots.default ? slots.default() : null
      );
  },
});

export const AccordionItem = defineComponent({
  name: "SpectrumAccordionItem",
  setup(_, { slots, attrs }) {
    return () =>
      h(
        "section",
        {
          ...attrs,
          class: ["spectrum-Accordion-item", attrs.class],
        },
        slots.default ? slots.default() : null
      );
  },
});
