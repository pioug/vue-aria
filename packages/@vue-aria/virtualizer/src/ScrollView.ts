import {
  computed,
  defineComponent,
  h,
  ref,
  type CSSProperties,
  type PropType,
} from "vue";
import { mergeProps } from "@vue-aria/utils";
import { Size } from "@vue-aria/virtualizer-state";
import { Rect } from "@vue-aria/virtualizer-state";
import type { ScrollDirection } from "./useScrollView";
import { useScrollView } from "./useScrollView";

export const ScrollView = defineComponent({
  name: "ScrollView",
  props: {
    contentSize: {
      type: Object as PropType<Size>,
      required: true,
    },
    onVisibleRectChange: {
      type: Function as PropType<(rect: Rect) => void>,
      required: true,
    },
    innerStyle: {
      type: Object as PropType<CSSProperties | undefined>,
      default: undefined,
    },
    onScrollStart: {
      type: Function as PropType<(() => void) | undefined>,
      default: undefined,
    },
    onScrollEnd: {
      type: Function as PropType<(() => void) | undefined>,
      default: undefined,
    },
    scrollDirection: {
      type: String as PropType<ScrollDirection | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots, expose }) {
    const scrollRef = ref<HTMLElement | null>(null);
    const scrollView = useScrollView(
      {
        contentSize: computed(() => props.contentSize),
        onVisibleRectChange: props.onVisibleRectChange,
        innerStyle: computed(() => props.innerStyle),
        onScrollStart: props.onScrollStart,
        onScrollEnd: props.onScrollEnd,
        scrollDirection: computed(() => props.scrollDirection),
      },
      scrollRef
    );

    expose({
      isScrolling: scrollView.isScrolling,
      updateSize: scrollView.updateSize,
      element: scrollRef,
    });

    return () =>
      h(
        "div",
        mergeProps(attrs as Record<string, unknown>, scrollView.scrollViewProps.value, {
          ref: scrollRef,
        }),
        [
          h("div", scrollView.contentProps.value, slots.default?.()),
        ]
      );
  },
});
