import { defineComponent } from "vue";
import type { SpectrumListBoxSectionProps } from "./types";

export const Section = defineComponent({
  name: "SpectrumListBoxSectionNode",
  props: {
    title: {
      type: String as () => SpectrumListBoxSectionProps["title"],
      required: false,
    },
    ariaLabel: {
      type: String as () => SpectrumListBoxSectionProps["aria-label"],
      required: false,
    },
  },
  setup() {
    return () => null;
  },
});

(Section as any).__spectrumListBoxNodeType = "section";
