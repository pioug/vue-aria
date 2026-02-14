import { defineComponent, type PropType } from "vue";
import type { SpectrumComboBoxItemProps } from "./types";

export const ComboBoxItem = defineComponent({
  name: "SpectrumComboBoxItemNode",
  props: {
    id: {
      type: [String, Number] as PropType<SpectrumComboBoxItemProps["id"]>,
      required: false,
    },
    textValue: {
      type: String as PropType<SpectrumComboBoxItemProps["textValue"]>,
      required: false,
    },
    isDisabled: {
      type: Boolean as PropType<SpectrumComboBoxItemProps["isDisabled"]>,
      required: false,
      default: undefined,
    },
    ariaLabel: {
      type: String as PropType<SpectrumComboBoxItemProps["aria-label"]>,
      required: false,
    },
  },
  setup() {
    return () => null;
  },
});

(ComboBoxItem as any).__spectrumComboBoxNodeType = "item";

export const Item = ComboBoxItem;
