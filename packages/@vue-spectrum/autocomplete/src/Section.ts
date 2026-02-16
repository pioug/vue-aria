import { defineComponent, type PropType } from "vue";
import type { SpectrumSearchAutocompleteSectionProps } from "./types";

export const SearchAutocompleteSection = defineComponent({
  name: "SpectrumSearchAutocompleteSectionNode",
  props: {
    id: {
      type: [String, Number] as PropType<SpectrumSearchAutocompleteSectionProps["id"]>,
      required: false,
    },
    title: {
      type: String as PropType<SpectrumSearchAutocompleteSectionProps["title"]>,
      required: false,
    },
    ariaLabel: {
      type: String as PropType<SpectrumSearchAutocompleteSectionProps["aria-label"]>,
      required: false,
    },
  },
  setup() {
    return () => null;
  },
});

(SearchAutocompleteSection as any).__spectrumSearchAutocompleteNodeType = "section";

export const Section = SearchAutocompleteSection;
