import { defineComponent, type PropType } from "vue";
import type { SpectrumPickerItemProps } from "./types";

export const PickerItem = defineComponent({
  name: "SpectrumPickerItemNode",
  props: {
    id: {
      type: [String, Number] as PropType<SpectrumPickerItemProps["id"]>,
      required: false,
    },
    textValue: {
      type: String as () => SpectrumPickerItemProps["textValue"],
      required: false,
    },
    isDisabled: {
      type: Boolean as () => SpectrumPickerItemProps["isDisabled"],
      required: false,
      default: undefined,
    },
    ariaLabel: {
      type: String as () => SpectrumPickerItemProps["aria-label"],
      required: false,
    },
  },
  setup() {
    return () => null;
  },
});

(PickerItem as any).__spectrumPickerNodeType = "item";

export const Item = PickerItem;
