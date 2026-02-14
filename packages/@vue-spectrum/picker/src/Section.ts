import { defineComponent, type PropType } from "vue";
import type { SpectrumPickerSectionProps } from "./types";

export const PickerSection = defineComponent({
  name: "SpectrumPickerSectionNode",
  props: {
    id: {
      type: [String, Number] as PropType<SpectrumPickerSectionProps["id"]>,
      required: false,
    },
    title: {
      type: String as () => SpectrumPickerSectionProps["title"],
      required: false,
    },
    ariaLabel: {
      type: String as () => SpectrumPickerSectionProps["aria-label"],
      required: false,
    },
  },
  setup() {
    return () => null;
  },
});

(PickerSection as any).__spectrumPickerNodeType = "section";

export const Section = PickerSection;
