import {
  Fragment,
  computed,
  defineComponent,
  h,
  ref,
  type PropType,
  type VNodeChild,
} from "vue";
import type { Key } from "@vue-aria/types";
import { mergeProps } from "@vue-aria/utils";
import type {
  Layout,
  ReusableView,
  VirtualizerCollection,
} from "@vue-aria/virtualizer-state";
import { useVirtualizer } from "./useVirtualizer";
import { VirtualizerItem } from "./VirtualizerItem";
import type { ScrollDirection } from "./useScrollView";
import type { RenderWrapper } from "./useVirtualizer";

type VirtualizerRenderFn = () => VNodeChild;
type VirtualizerRenderWrapper = RenderWrapper<
  object,
  VirtualizerRenderFn,
  VNodeChild
>;

export const Virtualizer = defineComponent({
  name: "Virtualizer",
  props: {
    layout: {
      type: Object as PropType<Layout<any, unknown>>,
      required: true,
    },
    collection: {
      type: Object as PropType<VirtualizerCollection<any>>,
      required: true,
    },
    persistedKeys: {
      type: Object as PropType<Set<Key> | null | undefined>,
      default: undefined,
    },
    scrollDirection: {
      type: String as PropType<ScrollDirection | undefined>,
      default: undefined,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    onLoadMore: {
      type: Function as PropType<(() => void) | undefined>,
      default: undefined,
    },
    scrollOffset: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
    items: {
      type: null as unknown as PropType<unknown>,
      default: undefined,
    },
    layoutOptions: {
      type: null as unknown as PropType<unknown>,
      default: undefined,
    },
    renderWrapper: {
      type: Function as PropType<VirtualizerRenderWrapper | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots, expose }) {
    const scrollRef = ref<HTMLElement | null>(null);

    const renderView = (
      type: string,
      content: object | null
    ): VirtualizerRenderFn => {
      return () => {
        const slotContent = slots.default?.({ type, content });
        if (!slotContent || slotContent.length === 0) {
          return null;
        }
        if (slotContent.length === 1) {
          return slotContent[0];
        }

        return h(Fragment, null, slotContent);
      };
    };

    const renderWrapper = computed<VirtualizerRenderWrapper>(() => {
      if (props.renderWrapper) {
        return props.renderWrapper;
      }

      return (parent, reusableView, _children, _renderChildren) => {
        if (!reusableView.layoutInfo) {
          return null;
        }

        return h(
          VirtualizerItem,
          {
            key: reusableView.key,
            layoutInfo: reusableView.layoutInfo,
            virtualizer: reusableView.virtualizer,
            parent: parent?.layoutInfo ?? null,
          },
          {
            default: () => reusableView.rendered?.() ?? null,
          }
        );
      };
    });

    const virtualizer = useVirtualizer<object, VirtualizerRenderFn, VNodeChild>({
      renderView,
      renderWrapper: (parent, reusableView, children, renderChildren) =>
        renderWrapper.value(parent, reusableView, children, renderChildren),
      layout: computed(() => props.layout),
      collection: computed(() => props.collection),
      scrollRef,
      persistedKeys: computed(() => props.persistedKeys),
      layoutOptions: computed(() => props.layoutOptions),
      scrollDirection: computed(() => props.scrollDirection),
      isLoading: computed(() => props.isLoading),
      onLoadMore: props.onLoadMore,
      scrollOffset: computed(() => props.scrollOffset),
      items: computed(() => props.items),
      scrollViewProps: computed(() => attrs as Record<string, unknown>),
    });

    expose({
      state: virtualizer.state,
      virtualizer: virtualizer.virtualizer,
      isScrolling: virtualizer.isScrolling,
      updateSize: virtualizer.updateSize,
      element: scrollRef,
    });

    return () =>
      h(
        "div",
        mergeProps(virtualizer.scrollViewProps.value, { ref: scrollRef }),
        [h("div", virtualizer.contentProps.value, virtualizer.renderedViews.value)]
      );
  },
});
