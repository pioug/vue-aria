import { computed, defineComponent, h, type CSSProperties, type PropType } from "vue";
import { mergeProps } from "@vue-aria/utils";
import { useVisuallyHidden } from "./useVisuallyHidden";

export const VisuallyHidden = defineComponent({
  name: "VisuallyHidden",
  props: {
    elementType: {
      type: String,
      default: "div",
    },
    isFocusable: {
      type: Boolean,
      default: false,
    },
    style: {
      type: Object as PropType<CSSProperties | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    const { visuallyHiddenProps } = useVisuallyHidden({
      isFocusable: computed(() => props.isFocusable),
      style: computed(() => props.style),
    });

    return () =>
      h(
        props.elementType,
        mergeProps(attrs as Record<string, unknown>, visuallyHiddenProps.value),
        slots.default?.()
      );
  },
});
