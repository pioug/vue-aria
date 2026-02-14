import { defineComponent } from "vue";
import type { SpectrumMenuSectionProps } from "./types";

/**
 * Data-only collection section used by Menu and ActionMenu.
 */
export const Section = defineComponent({
  name: "SpectrumMenuSectionNode",
  props: {
    title: {
      type: String as () => SpectrumMenuSectionProps["title"],
      required: false,
    },
    ariaLabel: {
      type: String as () => SpectrumMenuSectionProps["aria-label"],
      required: false,
    },
  },
  setup() {
    return () => null;
  },
});

(Section as any).__spectrumMenuNodeType = "section";
