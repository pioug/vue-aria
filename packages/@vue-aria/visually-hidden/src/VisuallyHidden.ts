import { mergeProps } from "@vue-aria/utils";
import { useFocusWithin } from "@vue-aria/interactions";
import { computed, defineComponent, h, ref, type PropType } from "vue";

export interface VisuallyHiddenProps {
  children?: unknown;
  elementType?: string;
  isFocusable?: boolean;
  style?: Record<string, string | number>;
}

const styles: Record<string, string | number> = {
  border: 0,
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  width: "1px",
  whiteSpace: "nowrap",
};

export interface VisuallyHiddenAria {
  visuallyHiddenProps: Record<string, unknown>;
}

export function useVisuallyHidden(props: VisuallyHiddenProps = {}): VisuallyHiddenAria {
  const { style, isFocusable } = props;

  const isFocused = ref(false);
  const { focusWithinProps } = useFocusWithin({
    isDisabled: !isFocusable,
    onFocusWithinChange: (val) => {
      isFocused.value = val;
    },
  });

  const combinedStyles = computed(() => {
    if (isFocused.value) {
      return style;
    }

    if (style) {
      return { ...styles, ...style };
    }

    return styles;
  });

  return {
    visuallyHiddenProps: {
      ...focusWithinProps,
      get style() {
        return combinedStyles.value;
      },
    },
  };
}

export const VisuallyHidden = defineComponent({
  name: "VisuallyHidden",
  props: {
    elementType: {
      type: String as PropType<string>,
      default: "div",
    },
    isFocusable: Boolean,
    style: Object as PropType<Record<string, string | number>>,
  },
  setup(props, { slots, attrs }) {
    const { visuallyHiddenProps } = useVisuallyHidden(props);

    return () =>
      h(
        props.elementType,
        mergeProps(attrs, visuallyHiddenProps),
        slots.default?.() ?? []
      );
  },
});
