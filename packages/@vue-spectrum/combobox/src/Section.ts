import { defineComponent, type PropType } from "vue";
import type { SpectrumComboBoxSectionProps } from "./types";

export const ComboBoxSection = defineComponent({
  name: "SpectrumComboBoxSectionNode",
  props: {
    id: {
      type: [String, Number] as PropType<SpectrumComboBoxSectionProps["id"]>,
      required: false,
    },
    title: {
      type: String as PropType<SpectrumComboBoxSectionProps["title"]>,
      required: false,
    },
    ariaLabel: {
      type: String as PropType<SpectrumComboBoxSectionProps["aria-label"]>,
      required: false,
    },
  },
  setup() {
    return () => null;
  },
});

(ComboBoxSection as any).__spectrumComboBoxNodeType = "section";

export const Section = ComboBoxSection;
