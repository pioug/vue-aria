import { defineComponent, type PropType } from "vue";

export interface SpectrumCollectionProps<T = unknown> {
  items?: T[] | undefined;
}

export const Collection = defineComponent({
  name: "Collection",
  props: {
    items: {
      type: Array as PropType<unknown[] | undefined>,
      default: undefined,
    },
  },
  setup(_, { slots }) {
    return () => slots.default?.() ?? null;
  },
});
