import { defineComponent, type PropType } from "vue";
import type { Key } from "@vue-aria/collections";

export interface SpectrumTabsItemProps {
  id?: Key;
  title?: string;
  isDisabled?: boolean;
  href?: string;
  "aria-label"?: string;
}

export const Item = defineComponent({
  name: "SpectrumTabsItemNode",
  props: {
    id: {
      type: [String, Number] as PropType<SpectrumTabsItemProps["id"]>,
      required: false,
    },
    title: {
      type: String as PropType<SpectrumTabsItemProps["title"]>,
      required: false,
    },
    isDisabled: {
      type: Boolean as PropType<SpectrumTabsItemProps["isDisabled"]>,
      required: false,
      default: undefined,
    },
    href: {
      type: String as PropType<SpectrumTabsItemProps["href"]>,
      required: false,
    },
    ariaLabel: {
      type: String as PropType<SpectrumTabsItemProps["aria-label"]>,
      required: false,
    },
  },
  setup(props, { slots }) {
    return () => slots.default?.() ?? props.title ?? null;
  },
});

(Item as any).__spectrumTabsNodeType = "item";
