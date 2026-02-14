import { defineComponent, type PropType } from "vue";
import type { SpectrumListBoxItemProps } from "./types";

export const Item = defineComponent({
  name: "SpectrumListBoxItemNode",
  props: {
    textValue: {
      type: String as () => SpectrumListBoxItemProps["textValue"],
      required: false,
    },
    href: {
      type: String as () => SpectrumListBoxItemProps["href"],
      required: false,
    },
    routerOptions: {
      type: Object as () => SpectrumListBoxItemProps["routerOptions"],
      required: false,
    },
    isDisabled: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    onAction: {
      type: Function as PropType<SpectrumListBoxItemProps["onAction"]>,
      required: false,
    },
    ariaLabel: {
      type: String as () => SpectrumListBoxItemProps["aria-label"],
      required: false,
    },
  },
  setup() {
    return () => null;
  },
});

(Item as any).__spectrumListBoxNodeType = "item";
