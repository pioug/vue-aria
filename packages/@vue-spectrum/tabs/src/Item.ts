import { defineComponent, type PropType } from "vue";

export interface SpectrumTabsItemProps {
  title?: string | undefined;
  "aria-label"?: string | undefined;
}

export const Item = defineComponent({
  name: "TabsItem",
  props: {
    title: {
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
