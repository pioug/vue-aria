import { defineComponent, type PropType } from "vue";
import type { SpectrumMenuItemProps } from "./types";

/**
 * Data-only collection item used by Menu and ActionMenu.
 */
export const Item = defineComponent({
  name: "SpectrumMenuItemNode",
  props: {
    textValue: {
      type: String as () => SpectrumMenuItemProps["textValue"],
      required: false,
    },
    description: {
      type: String as () => SpectrumMenuItemProps["description"],
      required: false,
    },
    keyboardShortcut: {
      type: String as () => SpectrumMenuItemProps["keyboardShortcut"],
      required: false,
    },
    href: {
      type: String as () => SpectrumMenuItemProps["href"],
      required: false,
    },
    routerOptions: {
      type: Object as () => SpectrumMenuItemProps["routerOptions"],
      required: false,
    },
    closeOnSelect: {
      type: Boolean as () => SpectrumMenuItemProps["closeOnSelect"],
      required: false,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as () => SpectrumMenuItemProps["isDisabled"],
      required: false,
      default: undefined,
    },
    onAction: {
      type: Function as PropType<SpectrumMenuItemProps["onAction"]>,
      required: false,
    },
    ariaLabel: {
      type: String as () => SpectrumMenuItemProps["aria-label"],
      required: false,
    },
  },
  setup() {
    return () => null;
  },
});

(Item as any).__spectrumMenuNodeType = "item";
