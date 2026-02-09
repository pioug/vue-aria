import { computed, defineComponent, h, type PropType } from "vue";
import { filterDOMProps } from "@vue-aria/utils";

export interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const Heading = defineComponent({
  name: "Heading",
  inheritAttrs: false,
  props: {
    level: {
      type: Number as PropType<1 | 2 | 3 | 4 | 5 | 6>,
      default: 3,
    },
  },
  setup(props, { attrs, slots }) {
    const tagName = computed(() => `h${props.level}` as const);

    return () => {
      const domProps = filterDOMProps(attrs as Record<string, unknown>);
      return h(tagName.value, domProps, slots.default?.());
    };
  },
});
