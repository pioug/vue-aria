import { defineComponent, type PropType } from "vue";
import type { SpectrumSearchAutocompleteItemProps } from "./types";

export const SearchAutocompleteItem = defineComponent({
  name: "SpectrumSearchAutocompleteItemNode",
  props: {
    id: {
      type: [String, Number] as PropType<SpectrumSearchAutocompleteItemProps["id"]>,
      required: false,
    },
    textValue: {
      type: String as PropType<SpectrumSearchAutocompleteItemProps["textValue"]>,
      required: false,
    },
    isDisabled: {
      type: Boolean as PropType<SpectrumSearchAutocompleteItemProps["isDisabled"]>,
      required: false,
      default: undefined,
    },
    ariaLabel: {
      type: String as PropType<SpectrumSearchAutocompleteItemProps["aria-label"]>,
      required: false,
    },
  },
  setup() {
    return () => null;
  },
});

(SearchAutocompleteItem as any).__spectrumSearchAutocompleteNodeType = "item";

export const Item = SearchAutocompleteItem;
