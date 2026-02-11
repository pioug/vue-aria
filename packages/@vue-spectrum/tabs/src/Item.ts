import { defineComponent, type PropType } from "vue";

export interface SpectrumTabsItemProps {
  id?: string | number | undefined;
  title?: string | undefined;
  isDisabled?: boolean | undefined;
  href?: string | undefined;
  "aria-label"?: string | undefined;
}

export const Item = defineComponent({
  name: "TabsItem",
  props: {
    id: {
      type: [String, Number] as PropType<string | number | undefined>,
      default: undefined,
    },
    title: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    href: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    "aria-label": {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    return () => slots.default?.() ?? props.title ?? null;
  },
});
